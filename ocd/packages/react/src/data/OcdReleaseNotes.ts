/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export const releaseNotes = `[![License: UPL](https://img.shields.io/badge/license-UPL-green)](https://img.shields.io/badge/license-UPL-green) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=oracle_oci-designer-toolkit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=oracle_oci-designer-toolkit)
# June 2025 Release (Version 0.3.0)
____
**Update 0.3.0**: This update addresses the following issues.
1. Fix security list options issue where the fields were not being correctly hidden.
2. Fix issue where Documentation tab was not always highlighted correctly.

____
Welcome to the June 2025 release of OKIT. This release extends the number of resources supported within OKIT-Desktop whilst restructuring the git repository to clearly identify Classic code.

## OKIT Desktop Features
1. Rebrand to Edge Cloud Design Tool
2. Add feature to allow the user to specify that the Identity Resource should be split from non-identity resources and create multiple directories.
3. Option to Edit Lock resource, i.e. do not allow editting of fields if the lock is closed.
4. Save now always guarentees a ".okit" extension
5. Add Simple Theme framework.
6. Create Reducer based Contexts in readiness to improve code.
    1. Cache
    2. Console Config
    3. Theme
    4. Active File
7. Restructure build workflow to create Classic & Desktop releases.


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
