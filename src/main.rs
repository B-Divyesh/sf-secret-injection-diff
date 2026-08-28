mod model;
mod parsers;
mod scan;

use clap::{Args, Parser, Subcommand};
use model::{DiffReport, Edge, Report};
use scan::scan;
use std::collections::BTreeSet;
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
#[command(name = "secret-injection-diff", version, about = "Prove which processes gain secret names before merge", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// List secret-name to recipient edges in supported configuration files
    Scan(ScanArgs),
    /// Save the current approved graph as a JSON baseline
    Snapshot(SnapshotArgs),
    /// Compare the current graph with a baseline without failing on additions
    Diff(CheckArgs),
    /// Compare with a baseline and exit 2 when an unapproved edge appears
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
    /// Approved graph created by snapshot
    #[arg(short, long, default_value = ".secret-injection-baseline.json")]
    baseline: PathBuf,
    #[command(flatten)]
    output: OutputArgs,
}

#[derive(Args, Clone, Default)]
struct OutputArgs {
    /// Print stable JSON for scripts
    #[arg(long)]
    json: bool,
    /// Replace secret names with stable local hashes
    #[arg(long)]
    redact: bool,
}

fn stable_redaction(value: &str) -> String {
    let mut hash = 0xcbf29ce484222325u64;
    for byte in value.bytes() {
        hash ^= byte as u64;
        hash = hash.wrapping_mul(0x100000001b3);
    }
    format!("secret_{:08x}", (hash >> 32) as u32)
}

fn redact_edge(mut edge: Edge) -> Edge {
    edge.secret = stable_redaction(&edge.secret);
    edge.injection = edge
        .injection
        .split(':')
        .next()
        .unwrap_or(&edge.injection)
        .to_string();
    edge
}

fn shown_report(report: &Report, redact: bool) -> Report {
    if !redact {
        return report.clone();
    }
    Report::new(
        report.edges.iter().cloned().map(redact_edge).collect(),
        report.warnings.clone(),
    )
}

fn print_report(report: &Report, args: &OutputArgs) -> Result<(), String> {
    let shown = shown_report(report, args.redact);
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&shown).map_err(|error| error.to_string())?
        );
    } else if shown.edges.is_empty() {
        println!("No secret recipient edges found.");
        println!(
            "Add a supported .env, Compose, GitHub Actions, or Kubernetes file, then scan again."
        );
    } else {
        println!(
            "{} secret recipient edge{}",
            shown.edges.len(),
            if shown.edges.len() == 1 { "" } else { "s" }
        );
        for edge in shown.edges {
            println!(
                "  {} -> {}  [{}; {}]",
                edge.secret, edge.recipient, edge.adapter, edge.injection
            );
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

fn compare(baseline: &Report, current: &Report) -> DiffReport {
    let old: BTreeSet<_> = baseline.edges.iter().cloned().collect();
    let new: BTreeSet<_> = current.edges.iter().cloned().collect();
    DiffReport {
        schema: 1,
        additions: new.difference(&old).cloned().collect(),
        removals: old.difference(&new).cloned().collect(),
        warnings: current.warnings.clone(),
    }
}

fn print_diff(diff: &DiffReport, args: &OutputArgs) -> Result<(), String> {
    let transform = |edge: &Edge| {
        if args.redact {
            redact_edge(edge.clone())
        } else {
            edge.clone()
        }
    };
    if args.json {
        let shown = DiffReport {
            schema: diff.schema,
            additions: diff.additions.iter().map(transform).collect(),
            removals: diff.removals.iter().map(transform).collect(),
            warnings: diff.warnings.clone(),
        };
        println!(
            "{}",
            serde_json::to_string_pretty(&shown).map_err(|error| error.to_string())?
        );
        return Ok(());
    }
    if diff.additions.is_empty() && diff.removals.is_empty() {
        println!("No secret recipient changes.");
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
        println!(
            "{} added, {} removed",
            diff.additions.len(),
            diff.removals.len()
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
        println!(
            "The sample adds one release step recipient. Nothing here is saved to your project.\n"
        );
    }
    print_diff(&diff, args)?;
    if !args.json {
        println!(
            "\nExpected result: check would exit 2 for {} unapproved edge.",
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
                "Saved {} approved edge{} to {}",
                report.edges.len(),
                if report.edges.len() == 1 { "" } else { "s" },
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
                eprintln!("check failed: an undeclared recipient gained a secret name");
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
        );
        assert_eq!(compare(&base, &current).additions.len(), 1);
    }

    #[test]
    fn redaction_is_stable_and_hides_name() {
        let one = stable_redaction("DEPLOY_TOKEN");
        assert_eq!(one, stable_redaction("DEPLOY_TOKEN"));
        assert!(!one.contains("DEPLOY"));
    }
}
