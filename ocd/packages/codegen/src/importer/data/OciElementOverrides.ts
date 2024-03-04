/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdElementOverrides } from "../../types/OcdImporterData";

export const elementOverrides: OcdElementOverrides = {
    "defaults": {
        "common": {
            "availability_domain": '1',
            "fault_domain": "FAULT-DOMAIN-1",
            "license_model": "LICENSE_INCLUDED"
        },
        "oci_core_instance": {
            "shape": "VM.Standard.A1.Flex",
            "shape_config.memory_in_gbs": "6",
            "shape_config.ocpus": "1",
            "source_details.source_type": "image"
        },
        "oci_core_volume_attachment": {
            "attachment_type": "paravirtualized"
        },
        "oci_database_autonomous_database": {
            "db_workload": "OLTP",
            "is_auto_scaling_enabled": true
        },
        "oci_load_balancer_load_balancer": {
            "shape": "flexible",
            "ip_mode": "IPV4"
        },
        "oci_load_balancer_backend": {
            "weight": 1
        },
        "oci_load_balancer_backend_set": {
            "policy": "ROUND_ROBIN",
            "health_checker.interval_ms": "10000",
            "health_checker.port": "80",
            "health_checker.protocol": "HTTP",
            "health_checker.retries": "3",
            "health_checker.return_code": "200",
            "health_checker.timeout_in_millis": "3000",
            "health_checker.url_path": "/",
        },
        "oci_load_balancer_listener": {
            "port": "80",
            "protocol": "HTTP"
        }
    },
    "labels": {
        "common": {
            "cidr_blocks": "IPV4 CIDRs",
            "cpu_core_count": "OCPU Cores",
            "create_vnic_details": "Network Details",
            "data_storage_size_in_tbs": "Storage (in TBs)",
            "db_name": "Database Name",
            "dns_label": "DNS Label",
            "ipv6private_cidr_blocks": "IPV6 Private CIDRs",
            "is_ipv6enabled": "IPV6 Enabled"        
        },
        "oci_load_balancer_listener": {
            "default_backend_set_name": "Backend Set"
        }
    },
    "lookupOverrides": {
        "common": {
            "nsg_ids": {"list": "network_security_group", "element": "id"}
        },
        "oci_load_balancer_listener": {
            "default_backend_set_name": {"list": "load_balancer_backend_set", "element": "name"}
        }
    },
    "lookups": {
        "common": [],
        "oci_core_instance": [
            "shape"
        ],
        "oci_load_balancer_listener": [
            "default_backend_set_name"
        ],
    },
    "cacheLookups": {
        "common": {},
        "oci_core_instance": {
            "shape": "shapes",
            "source_details.source_id": "images"
        },
        "oci_database_autonomous_database": {
            "db_version": "autonomousDbVersions"
        },
        "oci_load_balancer_load_balancer": {
            "shape": "loadbalancerShapes"
        },
        "oci_load_balancer_listener": {
            "protocol": "listLoadbalancerProtocols"
        }
    },
    "staticLookups": {
        "common": [
            "availability_domain",
            "fault_domain"
        ],
        "oci_core_dhcp_options": [
            "options.type",
            "options.server_type",
            "domain_name_type",
        ],
        "oci_core_instance": [
            "source_details.source_type"
        ],
        "oci_core_network_security_group_security_rule": [
            "destination_type",
            "direction",
            "protocol",
            "source_type"        
        ],
        "oci_core_security_list": [
            "egress_security_rules.protocol",
            "egress_security_rules.destination_type",
            "ingress_security_rules.protocol",
            "ingress_security_rules.source_type",
        ],
        "oci_core_volume_attachment": [
            "attachment_type"
        ],
        "oci_database_autonomous_database": [
            "compute_model",
            "data_safe_status",
            "database_edition",
            "db_workload",
            "license_model"
        ],
        "oci_load_balancer_load_balancer": [
            "ip_mode"
        ],
        "oci_load_balancer_backend_set": [
            "policy",
            "health_checker.protocol"
        ],
    },
    "types": {
        "common": {},
        "oci_core_instance": {
            "assign_public_ip": ["bool"]
        },
        "oci_database_autonomous_database": {
            "whitelisted_ips": ["list", "string"]
        },
        "oci_load_balancer_listener": {
            "hostname_names": ["list", "string"]
        }
    },
    "maps": {
        "common": {},
        "oci_core_instance": {
            "metadata": {
                "attributes": {
                    "ssh_authorized_keys": {
                        "provider": "oci",
                        "key": "sshAuthorizedKeys",
                        "name": "ssh_authorized_keys",
                        "type": "string",
                        "subtype": "",
                        "required": false,
                        "label": "Authorised Keys",
                        "id": "metadata.ssh_authorized_keys",
                        "staticLookup": false,
                        "cacheLookup": false,
                        "lookup": false,
                        "lookupResource": "",
                        "conditional": false,
                        "condition": {}
                    },
                    "user_data": {
                        "provider": "oci",
                        "key": "userData",
                        "name": "user_data",
                        "type": "string",
                        "subtype": "code",
                        "required": false,
                        "label": "Cloud Init",
                        "id": "metadata.user_data",
                        "staticLookup": false,
                        "cacheLookup": false,
                        "lookup": false,
                        "lookupResource": "",
                        "conditional": false,
                        "condition": {}
                    }
                }
            }
        },
    }
}