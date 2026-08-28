use crate::model::{Edge, Report};
use crate::parsers::{
    looks_like_kubernetes, parse_compose, parse_dotenv, parse_github, parse_kubernetes, relative,
};
use std::fs;
use std::io;
use std::path::{Path, PathBuf};

const MAX_FILE_SIZE: u64 = 5 * 1024 * 1024;

fn ignored(name: &str) -> bool {
    matches!(
        name,
        ".git" | "node_modules" | "target" | "dist" | ".idea" | ".vscode"
    )
}

fn collect(path: &Path, files: &mut Vec<PathBuf>, warnings: &mut Vec<String>) -> io::Result<()> {
    if path.is_file() {
        files.push(path.to_path_buf());
        return Ok(());
    }
    let mut entries = fs::read_dir(path)?.collect::<Result<Vec<_>, _>>()?;
    entries.sort_by_key(|entry| entry.file_name());
    for entry in entries {
        let file_type = entry.file_type()?;
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if file_type.is_symlink() {
            continue;
        }
        if file_type.is_dir() {
            if !ignored(&name) {
                collect(&entry.path(), files, warnings)?;
            }
        } else if file_type.is_file() {
            let size = entry.metadata()?.len();
            if size > MAX_FILE_SIZE {
                warnings.push(format!(
                    "{}: skipped because it exceeds 5 MB",
                    entry.path().display()
                ));
            } else {
                files.push(entry.path());
            }
        }
    }
    Ok(())
}

fn is_dotenv(name: &str) -> bool {
    name == ".env" || name.starts_with(".env.")
}

fn is_compose(name: &str) -> bool {
    matches!(
        name,
        "compose.yml" | "compose.yaml" | "docker-compose.yml" | "docker-compose.yaml"
    ) || (name.starts_with("compose.") && (name.ends_with(".yml") || name.ends_with(".yaml")))
}

fn is_yaml(name: &str) -> bool {
    name.ends_with(".yml") || name.ends_with(".yaml")
}

pub fn scan(root: &Path) -> Result<Report, String> {
    let root = root
        .canonicalize()
        .map_err(|error| format!("cannot open {}: {error}", root.display()))?;
    let base = if root.is_file() {
        root.parent().unwrap_or(Path::new(".")).to_path_buf()
    } else {
        root.clone()
    };
    let mut files = Vec::new();
    let mut warnings = Vec::new();
    collect(&root, &mut files, &mut warnings)
        .map_err(|error| format!("cannot scan {}: {error}", root.display()))?;
    let mut edges = Vec::<Edge>::new();
    for path in files {
        let Some(name) = path.file_name().and_then(|value| value.to_str()) else {
            continue;
        };
        let source = relative(&path, &base);
        let result: Result<Vec<Edge>, io::Error> = if is_dotenv(name) {
            parse_dotenv(&path, &source)
        } else if is_compose(name) {
            match parse_compose(&path, &source) {
                Ok((found, notes)) => {
                    edges.extend(found);
                    warnings.extend(notes);
                    continue;
                }
                Err(error) => Err(error),
            }
        } else if is_yaml(name)
            && (source.starts_with(".github/workflows/")
                || path.to_string_lossy().contains("/.github/workflows/"))
        {
            parse_github(&path, &source)
        } else if is_yaml(name) && looks_like_kubernetes(&path).unwrap_or(false) {
            parse_kubernetes(&path, &source)
        } else {
            continue;
        };
        match result {
            Ok(found) => edges.extend(found),
            Err(error) => warnings.push(format!("{source}: {error}")),
        }
    }
    Ok(Report::new(edges, warnings))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_directory_is_a_valid_empty_report() {
        let path = std::env::temp_dir().join(format!("sid-empty-{}", std::process::id()));
        let _ = fs::remove_dir_all(&path);
        fs::create_dir(&path).unwrap();
        let report = scan(&path).unwrap();
        assert!(report.edges.is_empty());
    }
}
