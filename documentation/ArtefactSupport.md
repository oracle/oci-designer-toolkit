# Artifact Support

## Artifact Support Matrix
All Released Arifacts support the **Required** parameters allowing there creation through Terraform / Ansible and query 
using the oci python API.
 
Where functionality is missing it will be associated with **Optional** parameters.

The table below lists a summary of the current support status whilst the details can be found at the end of the document.

| Artifact                | Support | Version | Gaps |
| ----------------------- | ------- | ------- | ---- |
| **Containers**
| Compartment             | Full    | 0.2.0   | 
| **Network**
| Route Table             | Full    | 0.3.0   | 
| Network Security Groups | Full    | 0.4.0   |
| Security List           | Full    | 0.3.0   |
| Subnet                  | Full    | 0.3.0   | 
| Virtual Cloud Network   | Full    | 0.3.0   | 
| **Gateways**
| Dynamic Routing Gateway | Partial | 0.1.0   | [2](#dynamic-routing-gateway)
| Internet Gateway        | Full    | 0.2.0   | 
| Local Peering Gateway   | Full    | 0.2.0   | 
| NAT Gateway             | Full    | 0.2.0   | 
| Service Gateway         | Full    | 0.3.0   |
| **Storage**
| Block Storage Volume    | Partial | 0.5.0   | [2](#block-storage-volume)
| File Storage System     | Partial | 0.4.0   | [2](#file-storage-system)
| Object Storage Bucket   | Partial | 0.1.0   | [3](#object-storage-bucket)
| **Database**
| Autonomous Database     | Partial | 0.1.0   | [2](#autonomous-database)
| Database Systems        | Partial | 0.6.0   | [2](#database-systems)
| **Compute**
| Instance                | Partial | 0.3.0   | [3](#instance)
| Load Balancer           | Partial | 0.3.0   | [2](#loadbalancer)

## Artifact Support Matrix Gap Analysis

#### Containers

#### Network

#### Gateways

#### Storage
##### Block Storage Volume
- Key Management / Encryption
- Source Information for creation from backup.
##### File Storage System
- Key Management / Encryption
- Multiple Export / Mount Points
##### Object Storage Bucket
- Key Management / Encryption
- Metadata
- Events

#### Database
##### Autonomous Database
- Cloning (Includes all cloning functionality / Referencing)
- BYOL
##### Database Systems
- Backup Configuration
- Maintenance Window

#### Compute
##### Instance
- Existing Boot Volume can not be specified.
- Launch Options
- PV Encryption
##### Loadbalancer
- Health Checker Configuration
- Backend Host Configuration


