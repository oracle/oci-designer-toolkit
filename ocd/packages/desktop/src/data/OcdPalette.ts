/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export const palette = {
    "providers": [
        {
            "title": "OCI",
            "provider": "oci",
            "class": "oci-provider",
            "groups": [
                // {
                //     "title": "Containers",
                //     "class": "oci-container",
                //     "resources": [
                //         {
                //             "container": true,
                //             "title": "OKE Cluster",
                //             "class": "oci-oke-cluster"
                //         },
                //         {
                //             "container": true,
                //             "title": "OKE Node Pool",
                //             "class": "oci-oke-node-pool"
                //         }
                //     ]
                // },
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
                        // {
                        //     "container": false,
                        //     "title": "MySQL Database System",
                        //     "class": "oci-mysql-db-system"
                        // },
                        // {
                        //     "container": false,
                        //     "title": "NoSQL Database",
                        //     "class": "oci-nosql-table"
                        // }
                    ]
                },
                {
                    "title": "Networking",
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
                            "title": "Network Security Group",
                            "class": "oci-network-security-group"
                        },
                        {
                            "container": false,
                            "title": "DHCP Options",
                            "class": "oci-dhcp-options"
                        },
                        {
                            "container": false,
                            "title": "IPSec Connection",
                            "class": "oci-ipsec"
                        },
                        // {
                        //     "container": false,
                        //     "title": "Remote Peering Connection",
                        //     "class": "oci-remote-peering-connection"
                        // },
                        {
                            "container": false,
                            "title": "Customer Premise Equipment",
                            "class": "oci-cpe"
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
                            "title": "Service Gateway",
                            "class": "oci-service-gateway"
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
        //     "title": "AWS",
        //     "provider": "aws",
        //     "class": "aws-provider",
        //     "groups": []
        // },
        {
            "title": "Azure",
            "provider": "aws",
            "class": "azure-provider",
            "groups": [
                // {
                //     "title": "Compute",
                //     "class": "azure-compute",
                //     "resources": [
                //         {
                //             "container": false,
                //             "title": "Auto Managed VM",
                //             "class": "azure-instance"
                //         }
                //     ]
                // }
            ]
        },
        // {
        //     "title": "Google",
        //     "provider": "google",
        //     "class": "google-provider",
        //     "groups": []
        // }
    ]
}