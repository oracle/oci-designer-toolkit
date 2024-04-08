/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export const layoutEngineConfig = {
    "containers": [
        "drg", 
        "group",
        "load_balancer", 
        "subnet", 
        "vault",
        "vcn"
    ],
    "ignore": [
        "boot_volume_attachment", 
        "compartment", 
        "identity_user_group_membership", 
        "network_security_group_security_rule", 
        "load_balancer_backend",
        "volume_attachment", 
        "vnic_attachment"
    ]
}