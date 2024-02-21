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
        }
    },
    "resourceLookupOverrides": {
        "common": {
            "nsg_ids": "network_security_group"
        },
    },
    "lookups": {
        "common": [],
        "oci_core_instance": [
            "shape"
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