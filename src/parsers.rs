use crate::model::{Declaration, Edge};
use serde::Deserialize;
use serde_yaml_ng::{Mapping, Value};
use std::fs;
use std::io;
use std::path::Path;

fn yaml_error(error: impl std::fmt::Display) -> io::Error {
    io::Error::new(io::ErrorKind::InvalidData, error.to_string())
}

fn yaml_documents(path: &Path) -> io::Result<Vec<Value>> {
    let content = fs::read_to_string(path)?;
    serde_yaml_ng::Deserializer::from_str(&content)
        .map(|document| Value::deserialize(document).map_err(yaml_error))
        .collect()
}

fn key(name: &str) -> Value {
    Value::String(name.to_string())
}

fn field<'a>(mapping: &'a Mapping, name: &str) -> Option<&'a Value> {
    mapping.get(key(name))
}

fn mapping_field<'a>(mapping: &'a Mapping, name: &str) -> Option<&'a Mapping> {
    field(mapping, name)?.as_mapping()
}

fn sequence_field<'a>(mapping: &'a Mapping, name: &str) -> Option<&'a Vec<Value>> {
    field(mapping, name)?.as_sequence()
}

fn scalar(value: &Value) -> Option<String> {
    match value {
        Value::String(value) => Some(value.clone()),
        Value::Number(value) => Some(value.to_string()),
        Value::Bool(value) => Some(value.to_string()),
        _ => None,
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
    for line in fs::read_to_string(path)?.lines() {
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

pub fn parse_dotenv(path: &Path, source: &str) -> io::Result<Vec<Declaration>> {
    Ok(dotenv_names(path)?
        .into_iter()
        .map(|secret| Declaration {
            secret,
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

fn compose_environment(value: &Value, service: &str, source: &str, edges: &mut Vec<Edge>) {
    let mut add = |target: String, value: Option<String>| {
        if !valid_identifier(&target) {
            return;
        }
        let refs = value.as_deref().map(env_refs).unwrap_or_default();
        let refs = if refs.is_empty() {
            vec![target.clone()]
        } else {
            refs
        };
        for secret in refs {
            edges.push(Edge {
                secret,
                recipient: format!("compose:service/{service}"),
                injection: format!("environment:{target}"),
                source: source.into(),
                adapter: "compose".into(),
            });
        }
    };
    match value {
        Value::Mapping(environment) => {
            for (target, value) in environment {
                if let Some(target) = scalar(target) {
                    add(target, scalar(value));
                }
            }
        }
        Value::Sequence(environment) => {
            for item in environment {
                if let Some(item) = scalar(item) {
                    let (target, value) = item
                        .split_once('=')
                        .map_or((item.as_str(), None), |(name, value)| (name, Some(value)));
                    add(target.trim().to_string(), value.map(str::to_string));
                }
            }
        }
        _ => {}
    }
}

fn compose_env_files(value: &Value, service: &str, files: &mut Vec<ComposeEnvFile>) {
    let values = match value {
        Value::Sequence(values) => values.iter().collect(),
        value => vec![value],
    };
    for value in values {
        let path = match value {
            Value::Mapping(item) => field(item, "path").and_then(scalar),
            value => scalar(value),
        };
        if let Some(path) = path.filter(|path| !path.is_empty()) {
            files.push(ComposeEnvFile {
                service: service.into(),
                path,
            });
        }
    }
}

fn compose_secrets(value: &Value, service: &str, source: &str, edges: &mut Vec<Edge>) {
    let Some(secrets) = value.as_sequence() else {
        return;
    };
    for item in secrets {
        let (secret, target) = match item {
            Value::Mapping(item) => {
                let Some(secret) = field(item, "source").and_then(scalar) else {
                    continue;
                };
                let target = field(item, "target")
                    .and_then(scalar)
                    .unwrap_or_else(|| secret.clone());
                (secret, target)
            }
            value => {
                let Some(secret) = scalar(value) else {
                    continue;
                };
                (secret.clone(), secret)
            }
        };
        edges.push(Edge {
            secret,
            recipient: format!("compose:service/{service}"),
            injection: format!("secret mount:/run/secrets/{target}"),
            source: source.into(),
            adapter: "compose".into(),
        });
    }
}

pub fn parse_compose(path: &Path, source: &str) -> io::Result<(Vec<Edge>, Vec<String>)> {
    let documents = yaml_documents(path)?;
    let mut edges = Vec::new();
    let mut warnings = Vec::new();
    let mut env_files = Vec::<ComposeEnvFile>::new();
    for document in documents {
        let Some(root) = document.as_mapping() else {
            continue;
        };
        let Some(services) = mapping_field(root, "services") else {
            continue;
        };
        for (service, config) in services {
            let (Some(service), Some(config)) = (scalar(service), config.as_mapping()) else {
                continue;
            };
            if let Some(environment) = field(config, "environment") {
                compose_environment(environment, &service, source, &mut edges);
            }
            if let Some(env_file) = field(config, "env_file") {
                compose_env_files(env_file, &service, &mut env_files);
            }
            if let Some(secrets) = field(config, "secrets") {
                compose_secrets(secrets, &service, source, &mut edges);
            }
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
            .take_while(|byte| byte.is_ascii_alphanumeric() || *byte == b'_')
            .count();
        if len > 0 {
            found.push(tail[..len].to_string());
        }
        rest = &tail[len..];
    }
    found
}

fn github_section(
    value: Option<&Value>,
    section: &str,
    recipient: &str,
    source: &str,
    edges: &mut Vec<Edge>,
) {
    let Some(value) = value else { return };
    if section == "secrets" && value.as_str() == Some("inherit") {
        edges.push(Edge {
            secret: "inherited-secrets/*".into(),
            recipient: recipient.into(),
            injection: "reusable workflow secret inheritance".into(),
            source: source.into(),
            adapter: "github-actions".into(),
        });
        return;
    }
    let Some(items) = value.as_mapping() else {
        return;
    };
    for (target, value) in items {
        let (Some(target), Some(value)) = (scalar(target), scalar(value)) else {
            continue;
        };
        for secret in github_refs(&value) {
            edges.push(Edge {
                secret,
                recipient: recipient.into(),
                injection: format!("{section}:{target}"),
                source: source.into(),
                adapter: "github-actions".into(),
            });
        }
    }
}

pub fn parse_github(path: &Path, source: &str) -> io::Result<Vec<Edge>> {
    let documents = yaml_documents(path)?;
    let mut edges = Vec::new();
    for document in documents {
        let Some(root) = document.as_mapping() else {
            continue;
        };
        let Some(jobs) = mapping_field(root, "jobs") else {
            continue;
        };
        for (job, config) in jobs {
            let (Some(job), Some(config)) = (scalar(job), config.as_mapping()) else {
                continue;
            };
            let job_recipient = format!("github:job/{job}");
            github_section(
                field(config, "env"),
                "env",
                &job_recipient,
                source,
                &mut edges,
            );
            github_section(
                field(config, "secrets"),
                "secrets",
                &job_recipient,
                source,
                &mut edges,
            );
            if let Some(steps) = sequence_field(config, "steps") {
                for (index, step) in steps.iter().enumerate() {
                    let Some(step) = step.as_mapping() else {
                        continue;
                    };
                    let label = field(step, "name")
                        .and_then(scalar)
                        .or_else(|| field(step, "id").and_then(scalar))
                        .unwrap_or_else(|| (index + 1).to_string());
                    let recipient = format!("{job_recipient}/step/{label}");
                    github_section(field(step, "env"), "env", &recipient, source, &mut edges);
                    github_section(
                        field(step, "secrets"),
                        "secrets",
                        &recipient,
                        source,
                        &mut edges,
                    );
                }
            }
        }
    }
    Ok(edges)
}

fn nested_mapping<'a>(root: &'a Mapping, path: &[&str]) -> Option<&'a Mapping> {
    let mut current = root;
    for name in path {
        current = mapping_field(current, name)?;
    }
    Some(current)
}

fn kubernetes_pod_spec<'a>(root: &'a Mapping, kind: &str) -> Option<&'a Mapping> {
    match kind {
        "Pod" => mapping_field(root, "spec"),
        "CronJob" => nested_mapping(root, &["spec", "jobTemplate", "spec", "template", "spec"]),
        _ => nested_mapping(root, &["spec", "template", "spec"]),
    }
}

fn kubernetes_containers(
    pod_spec: &Mapping,
    field_name: &str,
    resource: &str,
    source: &str,
    volumes: &std::collections::HashMap<String, String>,
    edges: &mut Vec<Edge>,
) {
    let Some(containers) = sequence_field(pod_spec, field_name) else {
        return;
    };
    for container in containers {
        let Some(container) = container.as_mapping() else {
            continue;
        };
        let Some(container_name) = field(container, "name").and_then(scalar) else {
            continue;
        };
        let recipient = format!("{resource}:container/{container_name}");
        if let Some(environment) = sequence_field(container, "env") {
            for variable in environment {
                let Some(variable) = variable.as_mapping() else {
                    continue;
                };
                let Some(target) = field(variable, "name").and_then(scalar) else {
                    continue;
                };
                let Some(value_from) = mapping_field(variable, "valueFrom") else {
                    continue;
                };
                let Some(secret_ref) = mapping_field(value_from, "secretKeyRef") else {
                    continue;
                };
                let (Some(secret_name), Some(secret_key)) = (
                    field(secret_ref, "name").and_then(scalar),
                    field(secret_ref, "key").and_then(scalar),
                ) else {
                    continue;
                };
                edges.push(Edge {
                    secret: format!("{secret_name}/{secret_key}"),
                    recipient: recipient.clone(),
                    injection: format!("env:{target}"),
                    source: source.into(),
                    adapter: "kubernetes".into(),
                });
            }
        }
        if let Some(environment) = sequence_field(container, "envFrom") {
            for reference in environment {
                let Some(reference) = reference.as_mapping() else {
                    continue;
                };
                let Some(secret_ref) = mapping_field(reference, "secretRef") else {
                    continue;
                };
                let Some(secret_name) = field(secret_ref, "name").and_then(scalar) else {
                    continue;
                };
                edges.push(Edge {
                    secret: format!("{secret_name}/*"),
                    recipient: recipient.clone(),
                    injection: "envFrom:secretRef".into(),
                    source: source.into(),
                    adapter: "kubernetes".into(),
                });
            }
        }
        if let Some(mounts) = sequence_field(container, "volumeMounts") {
            for mount in mounts {
                let Some(mount) = mount.as_mapping() else {
                    continue;
                };
                let Some(volume_name) = field(mount, "name").and_then(scalar) else {
                    continue;
                };
                if let Some(secret_name) = volumes.get(&volume_name) {
                    edges.push(Edge {
                        secret: format!("{secret_name}/*"),
                        recipient: recipient.clone(),
                        injection: format!("secret volume:{volume_name}"),
                        source: source.into(),
                        adapter: "kubernetes".into(),
                    });
                }
            }
        }
    }
}

pub fn parse_kubernetes(path: &Path, source: &str) -> io::Result<Vec<Edge>> {
    let documents = yaml_documents(path)?;
    let mut edges = Vec::new();
    for document in documents {
        let Some(root) = document.as_mapping() else {
            continue;
        };
        let (Some(kind), Some(metadata)) = (
            field(root, "kind").and_then(scalar),
            mapping_field(root, "metadata"),
        ) else {
            continue;
        };
        let Some(name) = field(metadata, "name").and_then(scalar) else {
            continue;
        };
        let Some(pod_spec) = kubernetes_pod_spec(root, &kind) else {
            continue;
        };
        let resource = format!("kubernetes:{}/{}", kind.to_lowercase(), name);
        let mut volumes = std::collections::HashMap::<String, String>::new();
        if let Some(items) = sequence_field(pod_spec, "volumes") {
            for volume in items {
                let Some(volume) = volume.as_mapping() else {
                    continue;
                };
                let (Some(volume_name), Some(secret)) = (
                    field(volume, "name").and_then(scalar),
                    mapping_field(volume, "secret"),
                ) else {
                    continue;
                };
                if let Some(secret_name) = field(secret, "secretName").and_then(scalar) {
                    volumes.insert(volume_name, secret_name);
                }
            }
        }
        kubernetes_containers(
            pod_spec,
            "containers",
            &resource,
            source,
            &volumes,
            &mut edges,
        );
        kubernetes_containers(
            pod_spec,
            "initContainers",
            &resource,
            source,
            &volumes,
            &mut edges,
        );
    }
    Ok(edges)
}

pub fn looks_like_kubernetes(path: &Path) -> io::Result<bool> {
    Ok(yaml_documents(path)?.iter().any(|document| {
        document.as_mapping().is_some_and(|root| {
            field(root, "kind").is_some() && field(root, "apiVersion").is_some()
        })
    }))
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

    #[test]
    fn github_matrix_does_not_change_job_recipient() {
        let path = fixture(
            "matrix.yml",
            "jobs:\n  test:\n    strategy:\n      matrix:\n        include:\n          - os: ubuntu-latest\n    env:\n      DATABASE_URL: ${{ secrets.DATABASE_URL }}\n    steps:\n      - run: cargo test\n",
        );
        let edges = parse_github(&path, ".github/workflows/test.yml").unwrap();
        assert_eq!(edges.len(), 1);
        assert_eq!(edges[0].recipient, "github:job/test");
    }

    #[test]
    fn compose_supports_scalar_env_file_and_long_secret_syntax() {
        let directory = std::env::temp_dir().join(format!("sid-compose-{}", std::process::id()));
        fs::create_dir_all(&directory).unwrap();
        fs::write(directory.join(".env.runtime"), "API_TOKEN=value\n").unwrap();
        let path = directory.join("compose.yml");
        fs::write(&path, "services:\n  api:\n    env_file: .env.runtime\n    secrets:\n      - source: server-certificate\n        target: tls.pem\n").unwrap();
        let (edges, warnings) = parse_compose(&path, "compose.yml").unwrap();
        assert!(warnings.is_empty());
        assert!(edges.iter().any(|edge| edge.secret == "API_TOKEN"));
        assert!(edges.iter().any(|edge| edge.secret == "server-certificate"
            && edge.injection == "secret mount:/run/secrets/tls.pem"));
        assert!(
            !edges
                .iter()
                .any(|edge| edge.secret == "source" || edge.secret == "target")
        );
    }

    #[test]
    fn kubernetes_uses_only_secret_parents_and_ignores_mapping_order() {
        let path = fixture(
            "deployment.yaml",
            "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api\nspec:\n  template:\n    spec:\n      containers:\n        - name: app\n          env:\n            - name: APP_MODE\n              valueFrom:\n                configMapKeyRef:\n                  name: app-config\n                  key: mode\n            - name: TOKEN\n              valueFrom:\n                secretKeyRef:\n                  key: access-token\n                  name: api-secret\n          envFrom:\n            - configMapRef:\n                name: shared-config\n            - secretRef:\n                name: shared-secret\n",
        );
        let edges = parse_kubernetes(&path, "deployment.yaml").unwrap();
        assert_eq!(edges.len(), 2);
        assert!(
            edges
                .iter()
                .any(|edge| edge.secret == "api-secret/access-token")
        );
        assert!(edges.iter().any(|edge| edge.secret == "shared-secret/*"));
        assert!(!edges.iter().any(|edge| edge.secret.contains("config")));
    }
}
