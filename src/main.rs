mod model;
mod parsers;
mod scan;

use clap::{Args, Parser, Subcommand};
use model::{Declaration, DiffReport, Edge, InjectionChange, Report};
use scan::scan;
use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::time::{SystemTime, UNIX_EPOCH};

const DEMO_BEFORE_ENV: &str = include_str!("../examples/demo/before/.env.production");
const DEMO_BEFORE_COMPOSE: &str = include_str!("../examples/demo/before/compose.yaml");
const DEMO_BEFORE_GITHUB: &str =
    include_str!("../examples/demo/before/.github/workflows/release.yml");
const DEMO_BEFORE_KUBE: &str = include_str!("../examples/demo/before/k8s/deployment.yaml");
const DEMO_AFTER_GITHUB: &str =
    include_str!("../examples/demo/after/.github/workflows/release.yml");

#[derive(Parser)]
#[command(name = "secret-injection-diff", version, about = "Prove which processes gain secret names before code merges", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// List which processes get secret names in supported files
    Scan(ScanArgs),
    /// Save the current access list as an approved JSON baseline
    Snapshot(SnapshotArgs),
    /// Compare current access with a baseline without failing on additions
    Diff(CheckArgs),
    /// Compare with a baseline and exit 2 when a new process gets a secret name
    Check(CheckArgs),
    /// Run the bundled sample in a temporary directory
    Demo(OutputArgs),
}

#[derive(Args)]
struct ScanArgs {
    /// File or directory to scan
    #[arg(default_value = ".")]
    path: PathBuf,
    #[command(flatten)]
    output: OutputArgs,
}

#[derive(Args)]
struct SnapshotArgs {
    /// File or directory to scan
    #[arg(default_value = ".")]
    path: PathBuf,
    /// Baseline file to create
    #[arg(short, long, default_value = ".secret-injection-baseline.json")]
    output: PathBuf,
    /// Replace an existing baseline
    #[arg(long)]
    force: bool,
}

#[derive(Args)]
struct CheckArgs {
    /// File or directory to scan
    #[arg(default_value = ".")]
    path: PathBuf,
    /// Approved baseline created by snapshot
    #[arg(short, long, default_value = ".secret-injection-baseline.json")]
    baseline: PathBuf,
    #[command(flatten)]
    output: OutputArgs,
}

#[derive(Args, Clone, Default)]
struct OutputArgs {
    /// Print JSON for scripts
    #[arg(long)]
    json: bool,
    /// Replace secret names with opaque labels for this output
    #[arg(long)]
    redact: bool,
}

#[derive(Default)]
struct Redactor {
    labels: BTreeMap<String, String>,
}

impl Redactor {
    fn from_names(names: impl IntoIterator<Item = String>) -> Self {
        let mut unique = BTreeSet::new();
        unique.extend(names);
        let labels = unique
            .into_iter()
            .enumerate()
            .map(|(index, name)| (name, format!("secret_{:03}", index + 1)))
            .collect();
        Self { labels }
    }

    fn label(&self, value: &str) -> String {
        self.labels
            .get(value)
            .cloned()
            .unwrap_or_else(|| "secret_unknown".into())
    }

    fn replace_names(&self, value: &str) -> String {
        let mut shown = value.to_string();
        let mut names = self.labels.iter().collect::<Vec<_>>();
        names.sort_by_key(|(name, _)| std::cmp::Reverse(name.len()));
        for (name, label) in names {
            shown = shown.replace(name.as_str(), label);
        }
        shown
    }
}

fn redact_edge(mut edge: Edge, redactor: &Redactor) -> Edge {
    edge.secret = redactor.label(&edge.secret);
    edge.recipient = redactor.replace_names(&edge.recipient);
    edge.injection = edge
        .injection
        .split(':')
        .next()
        .unwrap_or(&edge.injection)
        .to_string();
    edge.source = redactor.replace_names(&edge.source);
    edge.adapter = redactor.replace_names(&edge.adapter);
    edge
}

fn redact_declaration(mut declaration: Declaration, redactor: &Redactor) -> Declaration {
    declaration.secret = redactor.label(&declaration.secret);
    declaration.source = redactor.replace_names(&declaration.source);
    declaration.adapter = redactor.replace_names(&declaration.adapter);
    declaration
}

fn report_redactor(report: &Report) -> Redactor {
    Redactor::from_names(
        report.edges.iter().map(|edge| edge.secret.clone()).chain(
            report
                .declarations
                .iter()
                .map(|declaration| declaration.secret.clone()),
        ),
    )
}

fn diff_redactor(diff: &DiffReport) -> Redactor {
    Redactor::from_names(
        diff.additions
            .iter()
            .chain(diff.removals.iter())
            .map(|edge| edge.secret.clone())
            .chain(
                diff.injection_changes
                    .iter()
                    .map(|change| change.secret.clone()),
            ),
    )
}

fn shown_report(report: &Report, redact: bool) -> Report {
    if !redact {
        return report.clone();
    }
    let redactor = report_redactor(report);
    let mut shown = report.clone();
    shown.edges = shown
        .edges
        .into_iter()
        .map(|edge| redact_edge(edge, &redactor))
        .collect();
    shown.declarations = shown
        .declarations
        .into_iter()
        .map(|declaration| redact_declaration(declaration, &redactor))
        .collect();
    shown.warnings = shown
        .warnings
        .into_iter()
        .map(|warning| redactor.replace_names(&warning))
        .collect();
    shown
}

fn print_report(report: &Report, args: &OutputArgs) -> Result<(), String> {
    let shown = shown_report(report, args.redact);
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&shown).map_err(|error| error.to_string())?
        );
    } else if shown.edges.is_empty() && shown.declarations.is_empty() {
        println!("No secret access found.");
        println!(
            "Add a supported .env, Compose, GitHub Actions, or Kubernetes file, then scan again."
        );
    } else {
        if !shown.edges.is_empty() {
            println!(
                "{} secret access entr{}",
                shown.edges.len(),
                if shown.edges.len() == 1 { "y" } else { "ies" }
            );
        }
        for edge in shown.edges {
            println!(
                "  {} -> {}  [{}; {}]",
                edge.secret, edge.recipient, edge.adapter, edge.injection
            );
        }
        if !shown.declarations.is_empty() {
            println!(
                "{} declared secret name{} without a named process",
                shown.declarations.len(),
                if shown.declarations.len() == 1 {
                    ""
                } else {
                    "s"
                }
            );
            for declaration in shown.declarations {
                println!(
                    "  {}  [{}; {}]",
                    declaration.secret, declaration.adapter, declaration.source
                );
            }
        }
    }
    for warning in &report.warnings {
        eprintln!("warning: {warning}");
    }
    Ok(())
}

fn read_baseline(path: &Path) -> Result<Report, String> {
    let content = fs::read_to_string(path).map_err(|error| {
        format!(
            "cannot read baseline {}: {error}. Run `secret-injection-diff snapshot` first",
            path.display()
        )
    })?;
    let report: Report = serde_json::from_str(&content)
        .map_err(|error| format!("baseline {} is not valid: {error}", path.display()))?;
    if report.schema != 1 {
        return Err(format!(
            "baseline {} uses unsupported schema {}",
            path.display(),
            report.schema
        ));
    }
    Ok(report)
}

fn access_by_process(report: &Report) -> BTreeMap<(String, String), Vec<&Edge>> {
    let mut grouped = BTreeMap::<(String, String), Vec<&Edge>>::new();
    for edge in &report.edges {
        grouped
            .entry((edge.secret.clone(), edge.recipient.clone()))
            .or_default()
            .push(edge);
    }
    grouped
}

fn compare(baseline: &Report, current: &Report) -> DiffReport {
    let old = access_by_process(baseline);
    let new = access_by_process(current);
    let additions = new
        .iter()
        .filter(|(boundary, _)| !old.contains_key(*boundary))
        .filter_map(|(_, edges)| edges.first().map(|edge| (*edge).clone()))
        .collect();
    let removals = old
        .iter()
        .filter(|(boundary, _)| !new.contains_key(*boundary))
        .filter_map(|(_, edges)| edges.first().map(|edge| (*edge).clone()))
        .collect();
    let injection_changes = new
        .iter()
        .filter_map(|((secret, recipient), current_edges)| {
            let baseline_edges = old.get(&(secret.clone(), recipient.clone()))?;
            let before = baseline_edges
                .iter()
                .map(|edge| edge.injection.clone())
                .collect::<BTreeSet<_>>();
            let after = current_edges
                .iter()
                .map(|edge| edge.injection.clone())
                .collect::<BTreeSet<_>>();
            (before != after).then(|| InjectionChange {
                secret: secret.clone(),
                recipient: recipient.clone(),
                before: before.into_iter().collect(),
                after: after.into_iter().collect(),
            })
        })
        .collect();
    DiffReport {
        schema: 1,
        additions,
        removals,
        injection_changes,
        warnings: current.warnings.clone(),
    }
}

fn print_diff(diff: &DiffReport, args: &OutputArgs) -> Result<(), String> {
    let redactor = args.redact.then(|| diff_redactor(diff));
    let transform = |edge: &Edge| {
        if args.redact {
            redact_edge(edge.clone(), redactor.as_ref().expect("redactor exists"))
        } else {
            edge.clone()
        }
    };
    if args.json {
        let shown = DiffReport {
            schema: diff.schema,
            additions: diff.additions.iter().map(transform).collect(),
            removals: diff.removals.iter().map(transform).collect(),
            injection_changes: diff
                .injection_changes
                .iter()
                .map(|change| {
                    let redact_injection =
                        |value: &String| value.split(':').next().unwrap_or(value).to_string();
                    if args.redact {
                        InjectionChange {
                            secret: redactor
                                .as_ref()
                                .expect("redactor exists")
                                .label(&change.secret),
                            recipient: redactor
                                .as_ref()
                                .expect("redactor exists")
                                .replace_names(&change.recipient),
                            before: change.before.iter().map(redact_injection).collect(),
                            after: change.after.iter().map(redact_injection).collect(),
                        }
                    } else {
                        change.clone()
                    }
                })
                .collect(),
            warnings: diff.warnings.clone(),
        };
        println!(
            "{}",
            serde_json::to_string_pretty(&shown).map_err(|error| error.to_string())?
        );
        return Ok(());
    }
    if diff.additions.is_empty() && diff.removals.is_empty() && diff.injection_changes.is_empty() {
        println!("No secret access changes.");
    } else {
        for edge in &diff.additions {
            let edge = transform(edge);
            println!(
                "+ {} -> {}  [{}]",
                edge.secret, edge.recipient, edge.injection
            );
        }
        for edge in &diff.removals {
            let edge = transform(edge);
            println!(
                "- {} -> {}  [{}]",
                edge.secret, edge.recipient, edge.injection
            );
        }
        for change in &diff.injection_changes {
            let secret = if args.redact {
                redactor
                    .as_ref()
                    .expect("redactor exists")
                    .label(&change.secret)
            } else {
                change.secret.clone()
            };
            let shown_paths = |paths: &[String]| {
                paths
                    .iter()
                    .map(|path| {
                        if args.redact {
                            path.split(':').next().unwrap_or(path).to_string()
                        } else {
                            path.clone()
                        }
                    })
                    .collect::<Vec<_>>()
                    .join(" | ")
            };
            println!(
                "~ {} -> {}  [{} -> {}]",
                secret,
                change.recipient,
                shown_paths(&change.before),
                shown_paths(&change.after)
            );
        }
        println!(
            "{} process{} added, {} removed; {} delivery method{} changed",
            diff.additions.len(),
            if diff.additions.len() == 1 { "" } else { "es" },
            diff.removals.len(),
            diff.injection_changes.len(),
            if diff.injection_changes.len() == 1 {
                ""
            } else {
                "s"
            }
        );
    }
    for warning in &diff.warnings {
        eprintln!("warning: {warning}");
    }
    Ok(())
}

fn write_demo_file(root: &Path, relative: &str, content: &str) -> Result<(), String> {
    let path = root.join(relative);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    fs::write(path, content).map_err(|error| error.to_string())
}

fn demo(args: &OutputArgs) -> Result<(), String> {
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| error.to_string())?
        .as_millis();
    let root = std::env::temp_dir().join(format!(
        "secret-injection-diff-demo-{}-{stamp}",
        std::process::id()
    ));
    let before = root.join("before");
    let after = root.join("after");
    for base in [&before, &after] {
        write_demo_file(base, ".env.production", DEMO_BEFORE_ENV)?;
        write_demo_file(base, "compose.yaml", DEMO_BEFORE_COMPOSE)?;
        write_demo_file(base, "k8s/deployment.yaml", DEMO_BEFORE_KUBE)?;
    }
    write_demo_file(&before, ".github/workflows/release.yml", DEMO_BEFORE_GITHUB)?;
    write_demo_file(&after, ".github/workflows/release.yml", DEMO_AFTER_GITHUB)?;
    let baseline = scan(&before)?;
    let current = scan(&after)?;
    let baseline_path = root.join("baseline.json");
    fs::write(
        &baseline_path,
        serde_json::to_vec_pretty(&baseline).map_err(|error| error.to_string())?,
    )
    .map_err(|error| error.to_string())?;
    let diff = compare(&baseline, &current);
    if !args.json {
        println!("Demo workspace: {}", root.display());
        println!("The sample adds one release process. Nothing here is saved to your project.\n");
    }
    print_diff(&diff, args)?;
    if !args.json {
        println!(
            "\nExpected result: check would exit 2 for {} unapproved process.",
            diff.additions.len()
        );
        println!("Baseline: {}", baseline_path.display());
    }
    Ok(())
}

fn run() -> Result<ExitCode, String> {
    match Cli::parse().command {
        Command::Scan(args) => {
            let report = scan(&args.path)?;
            print_report(&report, &args.output)?;
            Ok(ExitCode::SUCCESS)
        }
        Command::Snapshot(args) => {
            if args.output.exists() && !args.force {
                return Err(format!(
                    "{} already exists. Pass --force to replace it",
                    args.output.display()
                ));
            }
            let report = scan(&args.path)?;
            let content = serde_json::to_vec_pretty(&report).map_err(|error| error.to_string())?;
            if let Some(parent) = args
                .output
                .parent()
                .filter(|path| !path.as_os_str().is_empty())
            {
                fs::create_dir_all(parent).map_err(|error| error.to_string())?;
            }
            fs::write(&args.output, content)
                .map_err(|error| format!("cannot write {}: {error}", args.output.display()))?;
            println!(
                "Saved {} approved access entr{} to {}",
                report.edges.len(),
                if report.edges.len() == 1 { "y" } else { "ies" },
                args.output.display()
            );
            Ok(ExitCode::SUCCESS)
        }
        Command::Diff(args) => {
            let diff = compare(&read_baseline(&args.baseline)?, &scan(&args.path)?);
            print_diff(&diff, &args.output)?;
            Ok(ExitCode::SUCCESS)
        }
        Command::Check(args) => {
            let diff = compare(&read_baseline(&args.baseline)?, &scan(&args.path)?);
            let failed = !diff.additions.is_empty();
            print_diff(&diff, &args.output)?;
            if failed {
                eprintln!("check failed: an unapproved process gained a secret name");
                Ok(ExitCode::from(2))
            } else {
                Ok(ExitCode::SUCCESS)
            }
        }
        Command::Demo(args) => {
            demo(&args)?;
            Ok(ExitCode::SUCCESS)
        }
    }
}

fn main() -> ExitCode {
    match run() {
        Ok(code) => code,
        Err(message) => {
            eprintln!("error: {message}");
            ExitCode::FAILURE
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_additions_by_recipient_boundary() {
        let base = Report::new(
            vec![Edge {
                secret: "TOKEN".into(),
                recipient: "job/test".into(),
                injection: "env:TOKEN".into(),
                source: "ci.yml".into(),
                adapter: "github-actions".into(),
            }],
            vec![],
            vec![],
        );
        let current = Report::new(
            vec![
                base.edges[0].clone(),
                Edge {
                    secret: "TOKEN".into(),
                    recipient: "job/deploy".into(),
                    injection: "env:TOKEN".into(),
                    source: "ci.yml".into(),
                    adapter: "github-actions".into(),
                },
            ],
            vec![],
            vec![],
        );
        assert_eq!(compare(&base, &current).additions.len(), 1);
    }

    #[test]
    fn injection_change_keeps_the_same_process_approved() {
        let base = Report::new(
            vec![Edge {
                secret: "TOKEN".into(),
                recipient: "compose:service/api".into(),
                injection: "environment:TOKEN".into(),
                source: "compose.yml".into(),
                adapter: "compose".into(),
            }],
            vec![],
            vec![],
        );
        let current = Report::new(
            vec![Edge {
                injection: "secret mount:/run/secrets/token".into(),
                ..base.edges[0].clone()
            }],
            vec![],
            vec![],
        );
        let diff = compare(&base, &current);
        assert!(diff.additions.is_empty());
        assert!(diff.removals.is_empty());
        assert_eq!(diff.injection_changes.len(), 1);
    }

    #[test]
    fn redaction_uses_opaque_labels_within_one_output() {
        let redactor = Redactor::from_names(["DEPLOY_TOKEN".into(), "NPM_TOKEN".into()]);
        assert_eq!(redactor.label("DEPLOY_TOKEN"), "secret_001");
        assert_eq!(redactor.label("NPM_TOKEN"), "secret_002");
        assert!(!redactor.label("DEPLOY_TOKEN").contains("DEPLOY"));
    }
}
