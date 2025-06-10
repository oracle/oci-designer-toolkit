[![License: UPL](https://img.shields.io/badge/license-UPL-green)](https://img.shields.io/badge/license-UPL-green) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=oracle_oci-designer-toolkit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=oracle_oci-designer-toolkit)
# April 2025 Release (Version 0.69.1)
____
**Update 0.69.1**: This update addresses the following issues.
1. OKIT-Classic: Missed updates from okitweb to okitserver
____
Welcome to the April 2025 release of OKIT. This release restructures the git repository to clearly identify Classic code.

## OKIT Classic Features
1. OKIT-Classic: (OKIT-321) Restructure Repository to move exist OKIT files to okitclassinc Subdirectory.
```diff
- This modification will require any existing users to change their environment variables and any start scripts they use. The documentation and associated scripts within the repository have been updated and the user must follow the new instructions.
```
