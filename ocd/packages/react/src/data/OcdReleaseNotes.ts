/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export const releaseNotes = `[![License: UPL](https://img.shields.io/badge/license-UPL-green)](https://img.shields.io/badge/license-UPL-green) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=oracle_oci-designer-toolkit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=oracle_oci-designer-toolkit)
# April 2025 Release (Version 0.69.0)
____
**Update 0.69.0**: This update addresses the following issues.
____
Welcome to the April 2025 release of OKIT. This release extends the number of resources supported within OKIT-Desktop whilst restructuring the git repository to clearly identify Classic code.

## OKIT Classic Features
1. OKIT-Classic: (OKIT-321) Restructure Repository to move exist OKIT files to okitclassinc Subdirectory.
\`\`\`diff
- This modification will require any existing users to change their environment variables and any start scripts they use. The documentation and associated scripts within the repository have been updated and the user must follow the new instructions.
\`\`\`
## OKIT Desktop Features
1. OKIT-Desktop: Add new OCI Resources
    1. Bastion (OKIT-322)
    2. Vault (OKIT-323)
    3. Key (OKIT-324)
    4. Secret (OKIT-325)
    5. Data Science Project (OKIT-331)
    6. Data Science Notebook Session (OKIT-332)
    7. Integration Instance (OKIT-333)

___**Available Resources**___

| Resource                       | Properties | Terraform | Validation | Query   | Query Only |
| ------------------------------ | :--------: | :-------: | :--------: | :-----: | :--------: |
| VCN                            | &check;    | &check;   |            | &check; |            |
| Subnet                         | &check;    | &check;   |            | &check; |            |
| Security List                  | &check;    | &check;   |            | &check; |            |
| Route Table                    | &check;    | &check;   |            | &check; |            |
| DHCP Options                   | &check;    | &check;   |            | &check; |            |
| Internet Gateway               | &check;    | &check;   |            | &check; |            |
| NAT Gateway                    | &check;    | &check;   |            | &check; |            |
| Instance                       | &check;    | &check;   |            | &check; |            |
| Autonomous Database            | &check;    | &check;   |            | &check; |            |
| Load Balancer                  | &check;    | &check;   |            | &check; |            |
| Load Balancer Backend Set      | &check;    | &check;   |            | &check; |            |
| Load Balancer Backend          | &check;    | &check;   |            | &check; |            |
| Load Balancer Backend Listener | &check;    | &check;   |            | &check; |            |
| Block Volume                   | &check;    | &check;   |            | &check; |            |
| Volume Attachment              | &check;    | &check;   |            | &check; |            |
| Boot Volumes                   | &check;    | &check;   |            | &check; | &check;    |
| Boot Volumes Attachment        | &cross;    | &check;   |            | &check; | &check;    |
| Customer Premises Equipment    | &check;    | &check;   |            | &check; |            |
| Database System                | &check;    | &check;   |            | &check; |            |
| Service Gateway                | &check;    | &check;   |            | &check; |            |
| DRG                            | &check;    | &check;   |            | &check; |            |
| Local Peering                  | &check;    | &check;   |            | &check; |            |
| IPSec VPN                      | &check;    | &check;   |            | &check; |            |
| Dynamic Groups                 | &check;    | &check;   |            | &check; |            |
| Groups                         | &check;    | &check;   |            |         |            |
| Users                          | &check;    | &check;   |            |         |            |
| Bastion                        | &check;    | &check;   |            |         |            |
| Vault                          | &check;    | &check;   |            |         |            |
| Key                            | &check;    | &check;   |            |         |            |
| Secret                         | &check;    | &check;   |            |         |            |
| Data Science Project           | &check;    | &check;   |            |         |            |
| Data Science Notebook Session  | &check;    | &check;   |            |         |            |
| Integration Instance           | &check;    | &check;   |            |         |            |

`
