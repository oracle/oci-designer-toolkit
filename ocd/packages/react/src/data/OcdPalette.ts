/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export const palette = {
    "providers": [
        {
            "title": "OCI",
            "provider": "oci",
            "class": "oci-provider",
            // NOTE: a resource's `class` is load-bearing — the drop handler
            // (OcdDocument.addOciResource) PascalCases it to resolve the model
            // resource (e.g. 'oci-instance' -> OciModelResources.OciInstance).
            // The class MUST therefore match an exported OCI model resource name.
            // Entries marked `// TODO icon` use the closest existing oci-* icon
            // for display only and need a dedicated icon (roadmap A3); the class
            // itself still resolves to the correct model resource.
            "groups": [
                {
                    "title": "Containers",
                    "class": "oci-container",
                    "resources": [
                        {
                            "container": true,
                            "title": "OKE Cluster",
                            "class": "oci-oke-cluster"
                        },
                        {
                            "container": true,
                            "title": "OKE Node Pool",
                            "class": "oci-oke-node-pool"
                        }
                    ]
                },
                {
                    "title": "Compute",
                    "class": "oci-compute",
                    "resources": [
                        {
                            "container": false,
                            "title": "Instance",
                            "class": "oci-instance"
                        }
                    ]
                },
                {
                    "title": "Storage",
                    "class": "oci-storage",
                    "resources": [
                        {
                            "container": false,
                            "title": "Volume",
                            "class": "oci-volume"
                        },
                        {
                            "container": false,
                            "title": "Bucket",
                            "class": "oci-bucket"
                        }
                    ]
                },
                {
                    "title": "File Storage",
                    "class": "oci-storage",
                    "resources": [
                        {
                            "container": true,
                            "title": "File System",
                            "class": "oci-file-system"
                        },
                        {
                            "container": false,
                            "title": "Mount Target",
                            "class": "oci-mount-target"
                        },
                        {
                            "container": false,
                            "title": "File System Export Set",
                            "class": "oci-file-system-export-set" // TODO icon: no dedicated oci-file-system-export-set
                        }
                    ]
                },
                {
                    "title": "Networking",
                    "class": "oci-network",
                    "resources": [
                        {
                            "container": true,
                            "title": "Vcn",
                            "class": "oci-vcn"
                        },
                        {
                            "container": true,
                            "title": "Subnet",
                            "class": "oci-subnet"
                        },
                        {
                            "container": false,
                            "title": "Route Table",
                            "class": "oci-route-table"
                        },
                        {
                            "container": false,
                            "title": "Security List",
                            "class": "oci-security-list"
                        },
                        {
                            "container": false,
                            "title": "DHCP Options",
                            "class": "oci-dhcp-options"
                        },
                        {
                            "container": false,
                            "title": "Network Security Group",
                            "class": "oci-network-security-group"
                        },
                        {
                            "container": false,
                            "title": "IPSec Connection",
                            "class": "oci-ipsec"
                        },
                        {
                            "container": false,
                            "title": "Customer Premise Equipment",
                            "class": "oci-cpe"
                        },
                        {
                            "container": false,
                            "title": "Remote Peering Connection",
                            "class": "oci-remote-peering-connection"
                        }
                    ]
                },
                {
                    "title": "Load Balancing",
                    "class": "oci-network",
                    "resources": [
                        {
                            "container": true,
                            "title": "Load Balancer",
                            "class": "oci-load-balancer"
                        },
                        {
                            "container": false,
                            "title": "Load Balancer Backend Set",
                            "class": "oci-load-balancer-backend-set"
                        },
                        {
                            "container": false,
                            "title": "Load Balancer Listener",
                            "class": "oci-load-balancer-listener"
                        },
                        {
                            "container": true,
                            "title": "Network Load Balancer",
                            "class": "oci-network-load-balancer"
                        }
                    ]
                },
                {
                    "title": "Gateways",
                    "class": "oci-network",
                    "resources": [
                        {
                            "container": false,
                            "title": "Internet Gateway",
                            "class": "oci-internet-gateway"
                        },
                        {
                            "container": false,
                            "title": "NAT Gateway",
                            "class": "oci-nat-gateway"
                        },
                        {
                            "container": false,
                            "title": "Local Peering Gateway",
                            "class": "oci-local-peering-gateway"
                        },
                        {
                            "container": true,
                            "title": "Dynamic Routing Gateway",
                            "class": "oci-drg"
                        },
                        {
                            "container": false,
                            "title": "Dynamic Routing Gateway Attachment",
                            "class": "oci-drg-attachment"
                        },
                        {
                            "container": false,
                            "title": "DRG Route Table",
                            "class": "oci-drg-route-table" // TODO icon: no dedicated oci-drg-route-table (using drg icon)
                        },
                        {
                            "container": false,
                            "title": "DRG Route Distribution",
                            "class": "oci-drg-route-distribution" // TODO icon: no dedicated oci-drg-route-distribution (using drg icon)
                        },
                        {
                            "container": false,
                            "title": "Service Gateway",
                            "class": "oci-service-gateway"
                        }
                    ]
                },
                {
                    "title": "Database",
                    "class": "oci-database",
                    "resources": [
                        {
                            "container": false,
                            "title": "Autonomous Database",
                            "class": "oci-autonomous-database"
                        },
                        {
                            "container": false,
                            "title": "Database System",
                            "class": "oci-db-system"
                        },
                        {
                            "container": false,
                            "title": "MySQL Database System",
                            "class": "oci-mysql-db-system"
                        },
                        {
                            "container": false,
                            "title": "NoSQL Table",
                            "class": "oci-nosql-table"
                        }
                    ]
                },
                {
                    "title": "Analytics",
                    "class": "oci-compute",
                    "resources": [
                        {
                            "container": false,
                            "title": "Analytics Instance",
                            "class": "oci-analytics-instance"
                        }
                    ]
                },
                {
                    "title": "Integration",
                    "class": "oci-compute",
                    "resources": [
                        {
                            "container": false,
                            "title": "Integration Instance",
                            "class": "oci-integration-instance"
                        },
                        {
                            "container": false,
                            "title": "Queue",
                            "class": "oci-queue"
                        },
                        {
                            "container": true,
                            "title": "API Gateway",
                            "class": "oci-api-gateway"
                        },
                        {
                            "container": false,
                            "title": "API Deployment",
                            "class": "oci-api-deployment"
                        }
                    ]
                },
                {
                    "title": "Data Science",
                    "class": "oci-compute",
                    "resources": [
                        {
                            "container": true,
                            "title": "DataScience Project",
                            "class": "oci-datascience-project"
                        },
                        {
                            "container": false,
                            "title": "DataScience Notebook Session",
                            "class": "oci-datascience-notebook-session"
                        }
                    ]
                },
                {
                    "title": "Identity",
                    "class": "oci-identity",
                    "resources": [
                        {
                            "container": false,
                            "title": "Bastion",
                            "class": "oci-bastion"
                        },
                        {
                            "container": false,
                            "title": "Dynamic Group",
                            "class": "oci-dynamic-group"
                        },
                        {
                            "container": true,
                            "title": "Group",
                            "class": "oci-group"
                        },
                        {
                            "container": false,
                            "title": "User",
                            "class": "oci-user"
                        },
                        {
                            "container": false,
                            "title": "Policy",
                            "class": "oci-policy"
                        }
                    ]
                },
                {
                    "title": "Vault / Security",
                    "class": "oci-identity",
                    "resources": [
                        {
                            "container": true,
                            "title": "Vault",
                            "class": "oci-vault"
                        },
                        {
                            "container": false,
                            "title": "Secret",
                            "class": "oci-secret"
                        },
                        {
                            "container": false,
                            "title": "Key",
                            "class": "oci-key"
                        },
                        {
                            "container": false,
                            "title": "Web Application Firewall",
                            "class": "oci-web-app-firewall"
                        }
                    ]
                },
                {
                    "title": "DNS",
                    "class": "oci-network",
                    "resources": [
                        {
                            "container": false,
                            "title": "DNS Zone",
                            "class": "oci-dns-zone"
                        }
                    ]
                },
                {
                    "title": "Observability",
                    "class": "oci-identity",
                    "resources": [
                        {
                            "container": false,
                            "title": "Log Group",
                            "class": "oci-log-group"
                        },
                        {
                            "container": false,
                            "title": "Monitoring Alarm",
                            "class": "oci-monitoring-alarm"
                        },
                        {
                            "container": false,
                            "title": "Notification Topic",
                            "class": "oci-notification-topic"
                        },
                        {
                            "container": false,
                            "title": "Streaming Stream",
                            "class": "oci-streaming-stream"
                        },
                        {
                            "container": false,
                            "title": "Service Connector",
                            "class": "oci-service-connector"
                        },
                        {
                            "container": false,
                            "title": "Events Rule",
                            "class": "oci-events-rule"
                        }
                    ]
                },
                {
                    "title": "Functions / Serverless",
                    "class": "oci-compute",
                    "resources": [
                        {
                            "container": false,
                            "title": "Functions Application",
                            "class": "oci-functions-application"
                        }
                    ]
                },
                {
                    "title": "Governance",
                    "class": "oci-identity",
                    "resources": [
                        {
                            "container": false,
                            "title": "Budget",
                            "class": "oci-budget"
                        }
                    ]
                }
            ]
        },
        {
            "title": "Edge Cloud",
            "provider": "oci",
            "class": "oci-provider",
            "groups": [
                {
                    "title": "Containers",
                    "class": "oci-container",
                    "resources": [
                        {
                            "container": true,
                            "title": "OKE Cluster",
                            "class": "oci-oke-cluster"
                        },
                        {
                            "container": true,
                            "title": "OKE Node Pool",
                            "class": "oci-oke-node-pool"
                        }
                    ]
                },
                {
                    "title": "Compute",
                    "class": "oci-compute",
                    "resources": [
                        {
                            "container": false,
                            "title": "Instance",
                            "class": "oci-instance"
                        },
                        // {
                        //     "container": false,
                        //     "title": "Analytics Instance",
                        //     "class": "oci-analytics-instance"
                        // }
                    ]
                },
                {
                    "title": "Networking",
                    "class": "oci-network",
                    "resources": [
                        // {
                        //     "container": true,
                        //     "title": "Network Load Balancer",
                        //     "class": "oci-network-load-balancer"
                        // },
                        {
                            "container": true,
                            "title": "Vcn",
                            "class": "oci-vcn"
                        },
                        {
                            "container": true,
                            "title": "Subnet",
                            "class": "oci-subnet"
                        },
                        {
                            "container": false,
                            "title": "Route Table",
                            "class": "oci-route-table"
                        },
                        {
                            "container": false,
                            "title": "Security List",
                            "class": "oci-security-list"
                        },
                        {
                            "container": false,
                            "title": "DHCP Options",
                            "class": "oci-dhcp-options"
                        },
                        {
                            "container": false,
                            "title": "Network Security Group",
                            "class": "oci-network-security-group"
                        },
                        {
                            "container": true,
                            "title": "Load Balancer",
                            "class": "oci-load-balancer"
                        },
                        {
                            "container": false,
                            "title": "Load Balancer Backend Set",
                            "class": "oci-load-balancer-backend-set"
                        },
                        {
                            "container": false,
                            "title": "Load Balancer Listener",
                            "class": "oci-load-balancer-listener"
                        }
                    ]
                },
                {
                    "title": "Gateways",
                    "class": "oci-network",
                    "resources": [
                        {
                            "container": false,
                            "title": "Internet Gateway",
                            "class": "oci-internet-gateway"
                        },
                        {
                            "container": false,
                            "title": "NAT Gateway",
                            "class": "oci-nat-gateway"
                        },
                        {
                            "container": false,
                            "title": "Local Peering Gateway",
                            "class": "oci-local-peering-gateway"
                        },
                        {
                            "container": true,
                            "title": "Dynamic Routing Gateway",
                            "class": "oci-drg"
                        },
                        {
                            "container": false,
                            "title": "Dynamic Routing Gateway Attachment",
                            "class": "oci-drg-attachment"
                        }
                    ]
                },
                {
                    "title": "Storage",
                    "class": "oci-storage",
                    "resources": [
                        {
                            "container": false,
                            "title": "Volume",
                            "class": "oci-volume"
                        },
                        // {
                        //     "container": false,
                        //     "title": "File System",
                        //     "class": "oci-file-system"
                        // },
                        // {
                        //     "container": false,
                        //     "title": "Mount Target",
                        //     "class": "oci-mount-target"
                        // }
                    ]
                },
                {
                    "title": "Identity",
                    "class": "oci-identity",
                    "resources": [
                        // {
                        //     "container": false,
                        //     "title": "Bastion",
                        //     "class": "oci-bastion"
                        // },
                        // {
                        //     "container": true,
                        //     "title": "Vault",
                        //     "class": "oci-vault"
                        // },
                        // {
                        //     "container": false,
                        //     "title": "Secret",
                        //     "class": "oci-secret"
                        // },
                        // {
                        //     "container": false,
                        //     "title": "Key",
                        //     "class": "oci-key"
                        // },
                        {
                            "container": false,
                            "title": "Dynamic Group",
                            "class": "oci-dynamic-group"
                        },
                        {
                            "container": true,
                            "title": "Group",
                            "class": "oci-group"
                        },
                        {
                            "container": false,
                            "title": "User",
                            "class": "oci-user"
                        }
                    ]
                }
            ]
        },
        // {
        //     "title": "Compute Cloud@Customer",
        //     "provider": "oci",
        //     "class": "oci-provider",
        //     "groups": [
        //         // {
        //         //     "title": "Containers",
        //         //     "class": "oci-container",
        //         //     "resources": [
        //         //         {
        //         //             "container": true,
        //         //             "title": "OKE Cluster",
        //         //             "class": "oci-oke-cluster"
        //         //         },
        //         //         {
        //         //             "container": true,
        //         //             "title": "OKE Node Pool",
        //         //             "class": "oci-oke-node-pool"
        //         //         }
        //         //     ]
        //         // },
        //         {
        //             "title": "Compute",
        //             "class": "oci-compute",
        //             "resources": [
        //                 {
        //                     "container": false,
        //                     "title": "Instance",
        //                     "class": "oci-instance"
        //                 },
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "Analytics Instance",
        //                 //     "class": "oci-analytics-instance"
        //                 // }
        //             ]
        //         },
        //         {
        //             "title": "Networking",
        //             "class": "oci-network",
        //             "resources": [
        //                 // {
        //                 //     "container": true,
        //                 //     "title": "Network Load Balancer",
        //                 //     "class": "oci-network-load-balancer"
        //                 // },
        //                 {
        //                     "container": true,
        //                     "title": "Vcn",
        //                     "class": "oci-vcn"
        //                 },
        //                 {
        //                     "container": true,
        //                     "title": "Subnet",
        //                     "class": "oci-subnet"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Route Table",
        //                     "class": "oci-route-table"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Security List",
        //                     "class": "oci-security-list"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "DHCP Options",
        //                     "class": "oci-dhcp-options"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Network Security Group",
        //                     "class": "oci-network-security-group"
        //                 },
        //                 {
        //                     "container": true,
        //                     "title": "Load Balancer",
        //                     "class": "oci-load-balancer"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Load Balancer Backend Set",
        //                     "class": "oci-load-balancer-backend-set"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Load Balancer Listener",
        //                     "class": "oci-load-balancer-listener"
        //                 }
        //             ]
        //         },
        //         {
        //             "title": "Gateways",
        //             "class": "oci-network",
        //             "resources": [
        //                 {
        //                     "container": false,
        //                     "title": "Internet Gateway",
        //                     "class": "oci-internet-gateway"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "NAT Gateway",
        //                     "class": "oci-nat-gateway"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Local Peering Gateway",
        //                     "class": "oci-local-peering-gateway"
        //                 },
        //                 {
        //                     "container": true,
        //                     "title": "Dynamic Routing Gateway",
        //                     "class": "oci-drg"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Dynamic Routing Gateway Attachment",
        //                     "class": "oci-drg-attachment"
        //                 }
        //             ]
        //         },
        //         {
        //             "title": "Storage",
        //             "class": "oci-storage",
        //             "resources": [
        //                 {
        //                     "container": false,
        //                     "title": "Volume",
        //                     "class": "oci-volume"
        //                 },
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "File System",
        //                 //     "class": "oci-file-system"
        //                 // },
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "Mount Target",
        //                 //     "class": "oci-mount-target"
        //                 // }
        //             ]
        //         },
        //         {
        //             "title": "Identity",
        //             "class": "oci-identity",
        //             "resources": [
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "Bastion",
        //                 //     "class": "oci-bastion"
        //                 // },
        //                 // {
        //                 //     "container": true,
        //                 //     "title": "Vault",
        //                 //     "class": "oci-vault"
        //                 // },
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "Secret",
        //                 //     "class": "oci-secret"
        //                 // },
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "Key",
        //                 //     "class": "oci-key"
        //                 // },
        //                 {
        //                     "container": false,
        //                     "title": "Dynamic Group",
        //                     "class": "oci-dynamic-group"
        //                 },
        //                 {
        //                     "container": true,
        //                     "title": "Group",
        //                     "class": "oci-group"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "User",
        //                     "class": "oci-user"
        //                 }
        //             ]
        //         }
        //     ]
        // },
        // {
        //     "title": "Private Cloud Appliance",
        //     "provider": "oci",
        //     "class": "oci-provider",
        //     "groups": [
        //         // {
        //         //     "title": "Containers",
        //         //     "class": "oci-container",
        //         //     "resources": [
        //         //         {
        //         //             "container": true,
        //         //             "title": "OKE Cluster",
        //         //             "class": "oci-oke-cluster"
        //         //         },
        //         //         {
        //         //             "container": true,
        //         //             "title": "OKE Node Pool",
        //         //             "class": "oci-oke-node-pool"
        //         //         }
        //         //     ]
        //         // },
        //         {
        //             "title": "Compute",
        //             "class": "oci-compute",
        //             "resources": [
        //                 {
        //                     "container": false,
        //                     "title": "Instance",
        //                     "class": "oci-instance"
        //                 },
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "Analytics Instance",
        //                 //     "class": "oci-analytics-instance"
        //                 // }
        //             ]
        //         },
        //         {
        //             "title": "Networking",
        //             "class": "oci-network",
        //             "resources": [
        //                 // {
        //                 //     "container": true,
        //                 //     "title": "Network Load Balancer",
        //                 //     "class": "oci-network-load-balancer"
        //                 // },
        //                 {
        //                     "container": true,
        //                     "title": "Vcn",
        //                     "class": "oci-vcn"
        //                 },
        //                 {
        //                     "container": true,
        //                     "title": "Subnet",
        //                     "class": "oci-subnet"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Route Table",
        //                     "class": "oci-route-table"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Security List",
        //                     "class": "oci-security-list"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "DHCP Options",
        //                     "class": "oci-dhcp-options"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Network Security Group",
        //                     "class": "oci-network-security-group"
        //                 },
        //                 {
        //                     "container": true,
        //                     "title": "Load Balancer",
        //                     "class": "oci-load-balancer"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Load Balancer Backend Set",
        //                     "class": "oci-load-balancer-backend-set"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Load Balancer Listener",
        //                     "class": "oci-load-balancer-listener"
        //                 }
        //             ]
        //         },
        //         {
        //             "title": "Gateways",
        //             "class": "oci-network",
        //             "resources": [
        //                 {
        //                     "container": false,
        //                     "title": "Internet Gateway",
        //                     "class": "oci-internet-gateway"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "NAT Gateway",
        //                     "class": "oci-nat-gateway"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Local Peering Gateway",
        //                     "class": "oci-local-peering-gateway"
        //                 },
        //                 {
        //                     "container": true,
        //                     "title": "Dynamic Routing Gateway",
        //                     "class": "oci-drg"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Dynamic Routing Gateway Attachment",
        //                     "class": "oci-drg-attachment"
        //                 }
        //             ]
        //         },
        //         {
        //             "title": "Storage",
        //             "class": "oci-storage",
        //             "resources": [
        //                 {
        //                     "container": false,
        //                     "title": "Volume",
        //                     "class": "oci-volume"
        //                 },
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "File System",
        //                 //     "class": "oci-file-system"
        //                 // },
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "Mount Target",
        //                 //     "class": "oci-mount-target"
        //                 // }
        //             ]
        //         },
        //         {
        //             "title": "Identity",
        //             "class": "oci-identity",
        //             "resources": [
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "Bastion",
        //                 //     "class": "oci-bastion"
        //                 // },
        //                 // {
        //                 //     "container": true,
        //                 //     "title": "Vault",
        //                 //     "class": "oci-vault"
        //                 // },
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "Secret",
        //                 //     "class": "oci-secret"
        //                 // },
        //                 // {
        //                 //     "container": false,
        //                 //     "title": "Key",
        //                 //     "class": "oci-key"
        //                 // },
        //                 {
        //                     "container": false,
        //                     "title": "Dynamic Group",
        //                     "class": "oci-dynamic-group"
        //                 },
        //                 {
        //                     "container": true,
        //                     "title": "Group",
        //                     "class": "oci-group"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "User",
        //                     "class": "oci-user"
        //                 }
        //             ]
        //         }
        //     ]
        // },
        {
            "title": "AWS",
            "provider": "aws",
            "class": "aws-provider",
            "groups": [
                {
                    "title": "Networking",
                    "class": "aws-network",
                    "resources": [
                        {
                            "container": true,
                            "title": "VPC",
                            "class": "aws-vpc"
                        },
                        {
                            "container": true,
                            "title": "Subnet",
                            "class": "aws-subnet"
                        },
                        {
                            "container": false,
                            "title": "Internet Gateway",
                            "class": "aws-internet-gateway"
                        },
                        {
                            "container": false,
                            "title": "Security Group",
                            "class": "aws-security-group"
                        }
                    ]
                },
                {
                    "title": "Compute",
                    "class": "aws-compute",
                    "resources": [
                        {
                            "container": false,
                            "title": "Instance",
                            "class": "aws-instance"
                        }
                    ]
                }
            ]
        },
        // {
        //     "title": "Azure",
        //     "provider": "azure",
        //     "class": "azure-provider",
        //     "groups": [
        //         {
        //             "title": "Compute",
        //             "class": "azure-compute",
        //             "resources": [
        //                 {
        //                     "container": false,
        //                     "title": "Virtual Machine",
        //                     "class": "azure-virtual-machine"
        //                 }
        //             ]
        //         },
        //         {
        //             "title": "Networking",
        //             "class": "azure-network",
        //             "resources": [
        //                 {
        //                     "container": true,
        //                     "title": "Virtual Network",
        //                     "class": "azure-virtual-network"
        //                 },
        //                 {
        //                     "container": true,
        //                     "title": "Subnet",
        //                     "class": "azure-subnet"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Load Balancer",
        //                     "class": "azure-load-balancer"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "DNS Zone",
        //                     "class": "azure-dns-zone"
        //                 },
        //             ]
        //         },
        //         {
        //             "title": "Database",
        //             "class": "azure-database",
        //             "resources": [
        //                 {
        //                     "container": false,
        //                     "title": "Sql Server",
        //                     "class": "azure-mssql-server"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Oracle Exadata Database@Azure",
        //                     "class": "azure-oracle-exadata-infrastructure"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Oracle Autonomous Database@Azure",
        //                     "class": "azure-oracle-autonomous-database"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Oracle VM Cluster Database@Azure",
        //                     "class": "azure-oracle-cloud-vm-cluster"
        //                 },
        //             ]
        //         },
        //         {
        //             "title": "Containers",
        //             "class": "azure-containers",
        //             "resources": [
        //                 {
        //                     "container": false,
        //                     "title": "Container Registry",
        //                     "class": "azure-container-registry"
        //                 },
        //                 {
        //                     "container": false,
        //                     "title": "Kubernetes Service",
        //                     "class": "azure-kubernetes-cluster"
        //                 },
        //             ]
        //         },
        //     ]
        // },
        {
            "title": "Google",
            "provider": "google",
            "class": "google-provider",
            "groups": [
                {
                    "title": "Networking",
                    "class": "google-network",
                    "resources": [
                        {
                            "container": true,
                            "title": "Virtual Private Cloud",
                            "class": "google-compute-network"
                        },
                        {
                            "container": true,
                            "title": "Subnetwork",
                            "class": "google-compute-subnetwork"
                        },
                        {
                            "container": false,
                            "title": "Firewall",
                            "class": "google-compute-firewall"
                        },
                        {
                            "container": false,
                            "title": "Router",
                            "class": "google-compute-router"
                        },
                    ]
                },
                {
                    "title": "Compute",
                    "class": "google-compute",
                    "resources": [
                        {
                            "container": false,
                            "title": "Instance",
                            "class": "google-compute-instance"
                        },
                    ]
                },
                {
                    "title": "Storage",
                    "class": "google-storage",
                    "resources": [
                        {
                            "container": false,
                            "title": "Bucket",
                            "class": "google-storage-bucket"
                        },
                    ]
                },
                {
                    "title": "Database",
                    "class": "google-database",
                    "resources": [
                        {
                            "container": false,
                            "title": "Oracle Exadata Database@Google",
                            "class": "google-oracle-database-cloud-exadata-infrastructure"
                        },
                        {
                            "container": false,
                            "title": "Oracle Autonomous Database@Google",
                            "class": "google-oracle-database-autonomous-database"
                        },
                        {
                            "container": false,
                            "title": "Oracle VM Cluster Database@Google",
                            "class": "google-oracle-database-cloud-vm-cluster"
                        },
                    ]
                },
            ]
        },
        {
            "title": "General",
            "provider": "general",
            "class": "general-provider",
            "groups": [
                {
                    "title": "Shapes",
                    "class": "general-shapes",
                    "resources": [
                        {
                            "container": true,
                            "title": "Rectangle",
                            "class": "general-rectangle"
                        }
                    ]
                },
            ]
        },
    ]
}