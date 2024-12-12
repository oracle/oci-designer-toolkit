/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export const releaseNotes = `[![License: UPL](https://img.shields.io/badge/license-UPL-green)](https://img.shields.io/badge/license-UPL-green) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=oracle_oci-designer-toolkit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=oracle_oci-designer-toolkit)
# November 2024 Release (Version 0.66.1)
____
**Update 0.66.1**: This update addresses the following issues.
1. Update main README to de-emphasise Docker
____
Welcome to the November 2024 release of OKIT. This release switches the exiat Create React App based build format to Vite and Electron Forge.

## OKIT (Web) Features

## OKIT - Open Cloud Designer
1. OKIT-Ocd: Convert @ocd/core to ES6 Module (#OKIT-307)
1. OKIT-Ocd: Convert @ocd/model to ES6 Module (#OKIT-308)
1. OKIT-Ocd: Convert @ocd/query to ES6 Module (#OKIT-309)
1. OKIT-Ocd: Convert @ocd/export to ES6 Module (#OKIT-310)
1. OKIT-Ocd: Convert @ocd/import to ES6 Module (#OKIT-311)
1. OKIT-Ocd: Convert @ocd/codegen to ES6 Module (#OKIT-312)
1. OKIT-Ocd: Convert @ocd/codegen-cli to ES6 Module (#OKIT-313)
1. OKIT-Ocd: Convert @ocd/cli to ES6 Module (#OKIT-314)
1. OKIT-Ocd: Convert @ocd/desktop to ES6 Module (#OKIT-315)
1. OKIT-Ocd: Switch build process from Create React App / Webpack to Vite (#OKIT-305)
1. OKIT-Ocd: Switch to Electron Forge for building.

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
