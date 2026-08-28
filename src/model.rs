use serde::{Deserialize, Serialize};
use std::cmp::Ordering;

#[derive(Clone, Debug, Deserialize, Eq, Serialize)]
pub struct Edge {
    pub secret: String,
    pub recipient: String,
    pub injection: String,
    pub source: String,
    pub adapter: String,
}

impl Edge {
    pub fn identity(&self) -> (&str, &str, &str) {
        (&self.secret, &self.recipient, &self.injection)
    }
}

impl PartialEq for Edge {
    fn eq(&self, other: &Self) -> bool {
        self.identity() == other.identity()
    }
}

impl Ord for Edge {
    fn cmp(&self, other: &Self) -> Ordering {
        self.identity().cmp(&other.identity())
    }
}

impl PartialOrd for Edge {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Report {
    pub schema: u8,
    pub edges: Vec<Edge>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub warnings: Vec<String>,
}

impl Report {
    pub fn new(mut edges: Vec<Edge>, mut warnings: Vec<String>) -> Self {
        edges.sort();
        edges.dedup();
        warnings.sort();
        warnings.dedup();
        Self {
            schema: 1,
            edges,
            warnings,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct DiffReport {
    pub schema: u8,
    pub additions: Vec<Edge>,
    pub removals: Vec<Edge>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub injection_changes: Vec<InjectionChange>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub warnings: Vec<String>,
}

#[derive(Clone, Debug, Serialize)]
pub struct InjectionChange {
    pub secret: String,
    pub recipient: String,
    pub before: Vec<String>,
    pub after: Vec<String>,
}
