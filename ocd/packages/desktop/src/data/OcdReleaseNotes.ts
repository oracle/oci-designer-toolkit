/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export const releaseNotes = `[![License: UPL](https://img.shields.io/badge/license-UPL-green)](https://img.shields.io/badge/license-UPL-green) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=oracle_oci-designer-toolkit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=oracle_oci-designer-toolkit)
# September 2024 Release (Version 0.64.0)
____
**Update 0.64.0**: This update addresses the following issues.
1. OKIT-Web: Resolve issue where save dialog did not display existing content (#717)
2. OKIT-Web: Fix for underlying AuthLib api change.
____
Welcome to the September 2024 release of OKIT. This release is aim primarily at the desktop OKIT OCD Beta extending the current functionality and improving 
it's useability. We have now added some basic resources for Azure and Google to allow for the design of Multi Cloud solutions. The current resources will be expaned onces the appropriate Terraform provider is available.

## OKIT - Open Cloud Designer
1. Parse AzuraRM Terraform schema and generate OCD Resource Schema entries. (#OKIT-272)
3. Write AzureRM Model Generator. (#OKIT-273)
4. Write AzureRM Properties Generator. (#OKIT-274)
5. Write AzureRM Terraform Generator. (#OKIT-275)
6. Write AzureRM Markdown Generator. (#OKIT-276)
7. Write AzureRM Validator Generator. (#OKIT-277)
8. Write AzureRM Tabular Generator. (#OKIT-278)
9. Parse Google Terraform schema and generate OCD Resource Schema entries. (#OKIT-284)
10. Write Google Model Generator. (#OKIT-285)
11. Write Google Properties Generator. (#OKIT-286)
12. Write Google Terraform Generator. (#OKIT-287)
13. Write Google Markdown Generator. (#OKIT-288)
14. Write Google Validator Generator. (#OKIT-289)
15. Write Google Tabular Generator. (#OKIT-290)
16. Create Library View which will allow users to select pre-defined Reference Architectures. (#OKIT-304)

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

`
