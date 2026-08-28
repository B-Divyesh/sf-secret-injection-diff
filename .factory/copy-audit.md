# Landing page copy audit

Rechecked against perfection-loop round 4 on 2026-08-28. The core observable is always called a **secret name**; a standalone dotenv entry is a **declaration** until Compose names its process.

Count method: whitespace-separated words. Labels and fragments are included because visitors read them as product copy.

| Copy | Words | Result |
| --- | ---: | --- |
| Secret Injection Diff | 3 | Product label |
| Demo | 1 | Navigation label |
| Install | 1 | Navigation label |
| Privacy | 1 | Navigation label |
| Local configuration audit / v0.1.0 | 5 | Context label |
| Check which process gets each secret name | 7 | Pass |
| For developers reviewing CI and deploy changes before a new process gets a secret name. | 14 | Pass |
| Try it with sample data | 6 | Pass |
| See the check fail when a new process gets a secret name. | 12 | Pass |
| Runs locally · no network calls | 6 | Pass |
| Reports secret names · never values | 6 | Pass |
| Free · MIT licensed | 4 | Pass |
| A cutaway conservatory shows glowing capsules routed into separate plant rooms. | 11 | Image alternative passes |
| Secret names mapped to processes | 5 | Figure caption |
| Sample result | 2 | Section label |
| See which process gets a secret name before code merges | 10 | Pass |
| The check compares current secret access with a committed baseline. | 10 | Pass |
| release.yml / process access | 4 | Output label |
| 1 process added, 0 removed; 0 delivery methods changed | 9 | Output fragment |
| check failed: an unapproved process gained a secret name | 9 | Real CLI output |
| exit 2 | 2 | Output fragment |
| How it works | 3 | Section label |
| Review secret access in three commands | 6 | Pass |
| Save the baseline in your repository beside the configuration it describes. | 11 | Instruction, not a storage promise |
| Scan configuration | 2 | Pass |
| Read secret names from supported files. List processes only when a supported file names them. | 15 | Pass |
| Commit the baseline | 3 | Pass |
| Review the JSON list once, then approve it with the pull request. | 12 | Pass |
| Check every change | 3 | Pass |
| Exit code 2 stops CI when a new process gets a secret name. | 13 | Pass |
| Supported files | 2 | Section label |
| Supported files and limits | 4 | Pass |
| .env and .env.* | 3 | File-type label |
| Docker Compose | 2 | File-type label |
| GitHub Actions | 2 | File-type label |
| Kubernetes workloads | 2 | File-type label |
| Limits | 1 | Section label |
| What it does not do | 5 | Pass |
| It does not read secret stores. | 6 | Pass |
| It does not decrypt values. | 5 | Pass |
| It does not watch running processes. | 6 | Pass |
| It does not guess vendor behavior. | 6 | Pass |
| Start with your repository | 4 | Section label |
| Install the local CLI | 4 | Pass |
| Copy command | 2 | Result-naming button |
| Install command copied. | 3 | Success feedback |
| Copy failed. Select the command and copy it. | 8 | Recovery feedback |
| Then run secret-injection-diff scan. | 4 | Pass |
| Scroll sideways to read the full command and process path. | 10 | Mobile terminal instruction |
| Map secret names to processes before code merges. | 8 | Pass |
| v0.1.0 · build 2026-08-28 | 4 | Build label |
| Terms | 1 | Navigation label |
| Built by Param Factory | 4 | Attribution link |

No line exceeds 22 words. No line contains a banned marketing word. The first screen reads aloud in one breath.

## Terminology

| Concept | One term |
| --- | --- |
| A configured secret label | secret name |
| A program or job that receives it | process |
| A secret name in a standalone dotenv file | declaration |
| How a process receives a name | delivery method |
| The approved access list | baseline |
| A supported configuration format | file type |
| The isolated example | demo |

Catalog description: “Check which processes get secret names before code merges.” (56 characters)

## Error page

| Copy | Words | Result |
| --- | ---: | --- |
| Error 404 | 2 | Plain status label |
| Page not found | 3 | Plain heading; no product jargon |
| The page may have moved, or the address may be wrong. | 11 | Pass |
| Return home | 2 | Result-naming action |
