use crate::model::Edge;
use std::collections::HashMap;
use std::fs::File;
use std::io::{self, BufRead, BufReader};
use std::path::Path;

fn lines(path: &Path) -> io::Result<impl Iterator<Item = io::Result<String>>> {
    Ok(BufReader::new(File::open(path)?).lines())
}

fn indent(line: &str) -> usize {
    line.bytes().take_while(|b| *b == b' ').count()
}

fn clean_scalar(value: &str) -> String {
    let value = value.trim().trim_matches(['\'', '"']);
    value.split(" #").next().unwrap_or(value).trim().to_string()
}

fn mapping(line: &str) -> Option<(String, &str)> {
    let clean = line
        .trim_start()
        .strip_prefix("- ")
        .unwrap_or(line.trim_start());
    let (key, value) = clean.split_once(':')?;
    let key = clean_scalar(key);
    if key.is_empty() {
        None
    } else {
        Some((key, value.trim()))
    }
}

fn valid_identifier(value: &str) -> bool {
    let mut chars = value.chars();
    matches!(chars.next(), Some('A'..='Z') | Some('_'))
        && chars.all(|c| c.is_ascii_uppercase() || c.is_ascii_digit() || c == '_')
}

fn env_refs(value: &str) -> Vec<String> {
    let bytes = value.as_bytes();
    let mut found = Vec::new();
    let mut i = 0;
    while i + 2 < bytes.len() {
        if bytes[i] == b'$' && bytes[i + 1] == b'{' {
            let start = i + 2;
            if let Some(end) = value[start..].find('}') {
                let raw = value[start..start + end]
                    .split([':', '-'])
                    .next()
                    .unwrap_or("");
                if valid_identifier(raw) {
                    found.push(raw.to_string());
                }
                i = start + end + 1;
                continue;
            }
        }
        i += 1;
    }
    found
}

pub fn dotenv_names(path: &Path) -> io::Result<Vec<String>> {
    let mut names = Vec::new();
    for line in lines(path)? {
        let line = line?;
        let left = line
            .trim_start()
            .strip_prefix("export ")
            .unwrap_or(line.trim_start());
        if left.starts_with('#') || left.is_empty() {
            continue;
        }
        let end = left
            .find('=')
            .or_else(|| left.find(':'))
            .unwrap_or(left.len());
        let name = left[..end].trim();
        if valid_identifier(name) {
            names.push(name.to_string());
        }
    }
    names.sort();
    names.dedup();
    Ok(names)
}

pub fn parse_dotenv(path: &Path, source: &str) -> io::Result<Vec<Edge>> {
    Ok(dotenv_names(path)?
        .into_iter()
        .map(|secret| Edge {
            secret,
            recipient: format!("env-file:{source}"),
            injection: "declared environment name".into(),
            source: source.into(),
            adapter: "dotenv".into(),
        })
        .collect())
}

#[derive(Clone)]
struct ComposeEnvFile {
    service: String,
    path: String,
}

pub fn parse_compose(path: &Path, source: &str) -> io::Result<(Vec<Edge>, Vec<String>)> {
    let mut edges = Vec::new();
    let mut warnings = Vec::new();
    let mut in_services = false;
    let mut service = String::new();
    let mut service_indent = 0;
    let mut section = String::new();
    let mut section_indent = 0;
    let mut env_files = Vec::<ComposeEnvFile>::new();

    for line in lines(path)? {
        let line = line?;
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        let depth = indent(&line);
        if depth == 0 {
            in_services = trimmed == "services:";
            service.clear();
            section.clear();
            continue;
        }
        if !in_services {
            continue;
        }
        if depth == 2 && trimmed.ends_with(':') {
            service = clean_scalar(trimmed.trim_end_matches(':'));
            service_indent = depth;
            section.clear();
            continue;
        }
        if service.is_empty() {
            continue;
        }
        if depth > service_indent && trimmed.ends_with(':') && !trimmed.starts_with('-') {
            let name = trimmed.trim_end_matches(':');
            if matches!(name, "environment" | "env_file" | "secrets") {
                section = name.into();
                section_indent = depth;
                continue;
            }
        }
        if !section.is_empty() && depth <= section_indent {
            section.clear();
        }
        let recipient = format!("compose:service/{service}");
        match section.as_str() {
            "environment" if depth > section_indent => {
                let item = trimmed.strip_prefix("- ").unwrap_or(trimmed);
                if let Some((target, value)) = item.split_once(':') {
                    let target = clean_scalar(target);
                    if valid_identifier(&target) {
                        let refs = env_refs(value);
                        let refs = if refs.is_empty() {
                            vec![target.clone()]
                        } else {
                            refs
                        };
                        for secret in refs {
                            edges.push(Edge {
                                secret,
                                recipient: recipient.clone(),
                                injection: format!("environment:{target}"),
                                source: source.into(),
                                adapter: "compose".into(),
                            });
                        }
                    }
                } else {
                    let target = item.split('=').next().unwrap_or("").trim();
                    if valid_identifier(target) {
                        let refs = env_refs(item);
                        let refs = if refs.is_empty() {
                            vec![target.to_string()]
                        } else {
                            refs
                        };
                        for secret in refs {
                            edges.push(Edge {
                                secret,
                                recipient: recipient.clone(),
                                injection: format!("environment:{target}"),
                                source: source.into(),
                                adapter: "compose".into(),
                            });
                        }
                    }
                }
            }
            "env_file" if depth > section_indent => {
                let value = trimmed.strip_prefix("- ").unwrap_or(trimmed);
                let value = if let Some((key, val)) = value.split_once(':') {
                    if key.trim() == "path" { val } else { "" }
                } else {
                    value
                };
                let value = clean_scalar(value);
                if !value.is_empty() {
                    env_files.push(ComposeEnvFile {
                        service: service.clone(),
                        path: value,
                    });
                }
            }
            "secrets" if depth > section_indent => {
                let item = trimmed.strip_prefix("- ").unwrap_or(trimmed);
                let name = item.split(':').next().map(clean_scalar).unwrap_or_default();
                if !name.is_empty() {
                    edges.push(Edge {
                        secret: name.clone(),
                        recipient,
                        injection: format!("secret mount:/run/secrets/{name}"),
                        source: source.into(),
                        adapter: "compose".into(),
                    });
                }
            }
            _ => {}
        }
    }

    let base = path.parent().unwrap_or_else(|| Path::new("."));
    for env_file in env_files {
        let resolved = base.join(&env_file.path);
        match dotenv_names(&resolved) {
            Ok(names) => {
                for secret in names {
                    edges.push(Edge {
                        injection: format!("env_file:{}", env_file.path),
                        secret,
                        recipient: format!("compose:service/{}", env_file.service),
                        source: source.into(),
                        adapter: "compose".into(),
                    });
                }
            }
            Err(error) => warnings.push(format!(
                "{source}: could not read env_file {}: {error}",
                env_file.path
            )),
        }
    }
    Ok((edges, warnings))
}

fn github_refs(value: &str) -> Vec<String> {
    let mut found = Vec::new();
    let needle = "secrets.";
    let mut rest = value;
    while let Some(start) = rest.find(needle) {
        let tail = &rest[start + needle.len()..];
        let len = tail
            .bytes()
            .take_while(|b| b.is_ascii_alphanumeric() || *b == b'_')
            .count();
        if len > 0 {
            found.push(tail[..len].to_string());
        }
        rest = &tail[len..];
    }
    found
}

pub fn parse_github(path: &Path, source: &str) -> io::Result<Vec<Edge>> {
    let mut edges = Vec::new();
    let mut jobs_indent = None;
    let mut job = String::new();
    let mut job_indent = 0;
    let mut step_index = 0usize;
    let mut step_name = String::new();
    let mut env_indent = None;
    let mut secrets_indent = None;

    for line in lines(path)? {
        let line = line?;
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        let depth = indent(&line);
        if trimmed == "jobs:" {
            jobs_indent = Some(depth);
            continue;
        }
        let Some(jobs_depth) = jobs_indent else {
            continue;
        };
        if depth <= jobs_depth && trimmed != "jobs:" {
            jobs_indent = None;
            continue;
        }
        if depth == jobs_depth + 2 && trimmed.ends_with(':') {
            job = clean_scalar(trimmed.trim_end_matches(':'));
            job_indent = depth;
            step_index = 0;
            step_name.clear();
            env_indent = None;
            secrets_indent = None;
            continue;
        }
        if job.is_empty() {
            continue;
        }
        if trimmed.starts_with("- ") && depth > job_indent {
            step_index += 1;
            step_name.clear();
            env_indent = None;
            secrets_indent = None;
            if let Some((key, value)) = mapping(trimmed) {
                if key == "name" || key == "id" {
                    step_name = clean_scalar(value);
                }
            }
        } else if let Some((key, value)) = mapping(trimmed) {
            if (key == "name" || key == "id") && step_index > 0 {
                step_name = clean_scalar(value);
            }
        }
        if trimmed == "env:" {
            env_indent = Some(depth);
            continue;
        }
        if trimmed == "secrets:" {
            secrets_indent = Some(depth);
            continue;
        }

        for (section, at) in [("env", env_indent), ("secrets", secrets_indent)] {
            let Some(base) = at else { continue };
            if depth <= base {
                continue;
            }
            if let Some((target, value)) = mapping(trimmed) {
                let refs = github_refs(value);
                for secret in refs {
                    let scope = if step_index > 0 {
                        let label = if step_name.is_empty() {
                            step_index.to_string()
                        } else {
                            step_name.clone()
                        };
                        format!("github:job/{job}/step/{label}")
                    } else {
                        format!("github:job/{job}")
                    };
                    edges.push(Edge {
                        secret,
                        recipient: scope,
                        injection: format!("{section}:{target}"),
                        source: source.into(),
                        adapter: "github-actions".into(),
                    });
                }
                if section == "secrets" && value.trim() == "inherit" {
                    edges.push(Edge {
                        secret: "inherited-secrets/*".into(),
                        recipient: format!("github:job/{job}"),
                        injection: "reusable workflow secret inheritance".into(),
                        source: source.into(),
                        adapter: "github-actions".into(),
                    });
                }
            }
        }
        if trimmed == "secrets: inherit" {
            edges.push(Edge {
                secret: "inherited-secrets/*".into(),
                recipient: format!("github:job/{job}"),
                injection: "reusable workflow secret inheritance".into(),
                source: source.into(),
                adapter: "github-actions".into(),
            });
        }
        if let Some(base) = env_indent {
            if depth <= base {
                env_indent = None;
            }
        }
        if let Some(base) = secrets_indent {
            if depth <= base {
                secrets_indent = None;
            }
        }
    }
    Ok(edges)
}

#[derive(Default)]
struct KubeContainer {
    name: String,
    pending_env: String,
    secret_resource: String,
    mounts: Vec<String>,
}

pub fn parse_kubernetes(path: &Path, source: &str) -> io::Result<Vec<Edge>> {
    let mut resource_kind = String::new();
    let mut resource_name = String::new();
    let mut in_metadata = false;
    let mut metadata_indent = 0;
    let mut in_containers = false;
    let mut containers_indent = 0;
    let mut in_env = false;
    let mut env_indent = 0;
    let mut in_env_from = false;
    let mut env_from_indent = 0;
    let mut in_mounts = false;
    let mut mounts_indent = 0;
    let mut pending_mount = String::new();
    let mut containers = Vec::<KubeContainer>::new();
    let mut current: Option<KubeContainer> = None;
    let mut volumes = HashMap::<String, String>::new();
    let mut in_volumes = false;
    let mut volumes_indent = 0;
    let mut pending_volume = String::new();
    let mut edges = Vec::new();

    for line in lines(path)? {
        let line = line?;
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        let depth = indent(&line);
        if depth == 0 {
            if let Some((key, value)) = mapping(trimmed) {
                if key == "kind" {
                    resource_kind = clean_scalar(value);
                }
                if key == "metadata" {
                    in_metadata = true;
                    metadata_indent = depth;
                }
            }
        }
        if trimmed == "metadata:" {
            in_metadata = true;
            metadata_indent = depth;
            continue;
        }
        if in_metadata {
            if depth <= metadata_indent {
                in_metadata = false;
            } else if let Some((key, value)) = mapping(trimmed) {
                if key == "name" && resource_name.is_empty() {
                    resource_name = clean_scalar(value);
                }
            }
        }
        if trimmed == "containers:" || trimmed == "initContainers:" {
            if in_mounts && !pending_mount.is_empty() {
                if let Some(item) = current.as_mut() {
                    item.mounts.push(std::mem::take(&mut pending_mount));
                }
            }
            if let Some(item) = current.take() {
                containers.push(item);
            }
            in_containers = true;
            containers_indent = depth;
            in_volumes = false;
            continue;
        }
        if trimmed == "volumes:" {
            if in_mounts && !pending_mount.is_empty() {
                if let Some(item) = current.as_mut() {
                    item.mounts.push(std::mem::take(&mut pending_mount));
                }
            }
            if let Some(item) = current.take() {
                containers.push(item);
            }
            in_containers = false;
            in_volumes = true;
            volumes_indent = depth;
            continue;
        }
        if in_containers && depth <= containers_indent {
            if in_mounts && !pending_mount.is_empty() {
                if let Some(item) = current.as_mut() {
                    item.mounts.push(std::mem::take(&mut pending_mount));
                }
            }
            if let Some(item) = current.take() {
                containers.push(item);
            }
            in_containers = false;
        }
        if in_volumes && depth <= volumes_indent {
            in_volumes = false;
        }

        if in_containers {
            if trimmed.starts_with("- name:") && depth == containers_indent + 2 {
                if let Some(item) = current.take() {
                    containers.push(item);
                }
                current = Some(KubeContainer {
                    name: clean_scalar(trimmed.split_once(':').map(|x| x.1).unwrap_or("")),
                    ..Default::default()
                });
                in_env = false;
                in_env_from = false;
                in_mounts = false;
                continue;
            }
            let Some(container) = current.as_mut() else {
                continue;
            };
            if trimmed == "env:" {
                in_env = true;
                env_indent = depth;
                in_env_from = false;
                in_mounts = false;
                continue;
            }
            if trimmed == "envFrom:" {
                in_env_from = true;
                env_from_indent = depth;
                in_env = false;
                in_mounts = false;
                continue;
            }
            if trimmed == "volumeMounts:" {
                in_mounts = true;
                mounts_indent = depth;
                in_env = false;
                in_env_from = false;
                continue;
            }
            if in_env && depth <= env_indent {
                in_env = false;
            }
            if in_env_from && depth <= env_from_indent {
                in_env_from = false;
            }
            if in_mounts && depth <= mounts_indent {
                if !pending_mount.is_empty() {
                    container.mounts.push(std::mem::take(&mut pending_mount));
                }
                in_mounts = false;
            }

            if in_env {
                if trimmed.starts_with("- name:") {
                    container.pending_env =
                        clean_scalar(trimmed.split_once(':').map(|x| x.1).unwrap_or(""));
                    container.secret_resource.clear();
                } else if let Some((key, value)) = mapping(trimmed) {
                    if key == "name" && container.secret_resource.is_empty() {
                        container.secret_resource = clean_scalar(value);
                    }
                    if key == "key" && !container.secret_resource.is_empty() {
                        let key_name = clean_scalar(value);
                        let recipient = format!(
                            "kubernetes:{}/{}:container/{}",
                            resource_kind.to_lowercase(),
                            resource_name,
                            container.name
                        );
                        edges.push(Edge {
                            secret: format!("{}/{}", container.secret_resource, key_name),
                            recipient,
                            injection: format!("env:{}", container.pending_env),
                            source: source.into(),
                            adapter: "kubernetes".into(),
                        });
                        container.secret_resource.clear();
                    }
                }
            } else if in_env_from {
                if let Some((key, value)) = mapping(trimmed) {
                    if key == "name" {
                        let recipient = format!(
                            "kubernetes:{}/{}:container/{}",
                            resource_kind.to_lowercase(),
                            resource_name,
                            container.name
                        );
                        edges.push(Edge {
                            secret: format!("{}/*", clean_scalar(value)),
                            recipient,
                            injection: "envFrom:secretRef".into(),
                            source: source.into(),
                            adapter: "kubernetes".into(),
                        });
                    }
                }
            } else if in_mounts {
                if trimmed.starts_with("- name:") {
                    if !pending_mount.is_empty() {
                        container.mounts.push(std::mem::take(&mut pending_mount));
                    }
                    pending_mount =
                        clean_scalar(trimmed.split_once(':').map(|x| x.1).unwrap_or(""));
                }
            }
        } else if in_volumes {
            if trimmed.starts_with("- name:") && depth == volumes_indent + 2 {
                pending_volume = clean_scalar(trimmed.split_once(':').map(|x| x.1).unwrap_or(""));
            } else if let Some((key, value)) = mapping(trimmed) {
                if key == "secretName" && !pending_volume.is_empty() {
                    volumes.insert(pending_volume.clone(), clean_scalar(value));
                }
            }
        }
    }
    if let Some(item) = current.take() {
        containers.push(item);
    }
    for container in containers {
        let recipient = format!(
            "kubernetes:{}/{}:container/{}",
            resource_kind.to_lowercase(),
            resource_name,
            container.name
        );
        for mount in container.mounts {
            if let Some(secret) = volumes.get(&mount) {
                edges.push(Edge {
                    secret: format!("{secret}/*"),
                    recipient: recipient.clone(),
                    injection: format!("secret volume:{mount}"),
                    source: source.into(),
                    adapter: "kubernetes".into(),
                });
            }
        }
    }
    Ok(edges)
}

pub fn looks_like_kubernetes(path: &Path) -> io::Result<bool> {
    let mut kind = false;
    let mut api = false;
    for line in lines(path)?.take(80) {
        let line = line?;
        let trimmed = line.trim_start();
        kind |= trimmed.starts_with("kind:");
        api |= trimmed.starts_with("apiVersion:");
        if kind && api {
            return Ok(true);
        }
    }
    Ok(false)
}

pub fn relative(path: &Path, root: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    fn fixture(name: &str, content: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!("sid-parser-{}-{name}", std::process::id()));
        fs::write(&path, content).unwrap();
        path
    }

    #[test]
    fn dotenv_keeps_names_only() {
        let path = fixture(
            "env",
            "TOKEN=do-not-print\nlower=no\nexport API_KEY='also-secret'\n",
        );
        assert_eq!(dotenv_names(&path).unwrap(), vec!["API_KEY", "TOKEN"]);
    }

    #[test]
    fn github_finds_step_recipient() {
        let path = fixture(
            "workflow.yml",
            "jobs:\n  deploy:\n    steps:\n      - name: Ship\n        env:\n          TOKEN: ${{ secrets.DEPLOY_TOKEN }}\n",
        );
        let edges = parse_github(&path, ".github/workflows/deploy.yml").unwrap();
        assert_eq!(edges[0].secret, "DEPLOY_TOKEN");
        assert!(edges[0].recipient.contains("step/Ship"));
    }
}
