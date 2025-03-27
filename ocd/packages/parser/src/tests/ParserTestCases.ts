export const parserTestTests = [
    {
        description: 'Test Resource Block Parsing',
        input: `
# ------ Create Vcn
resource "oci_core_vcn" "OkitVcn1704881592637" {
    
    compartment_id = local.OkitCompartment1704709397851_id
    display_name = "ocdWebAppVCN"

    cidr_blocks = ["10.0.0.0/16"]
    dns_label = "ocdvcn"
    
    is_ipv6enabled = false
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}

# ------ Create Vcn
resource "oci_core_vcn" "OkitVcn1710854551242" {
    
    compartment_id = local.OkitCompartment1704709397851_id
    display_name = "ocdAppVCN"

    cidr_blocks = ["10.10.0.0/16"]
    dns_label = "vcnb"
    
    is_ipv6enabled = false
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}

# ------ Update Default Route Table
resource "oci_core_default_route_table" "OkitRouteTable1704881592638" {
    manage_default_resource_id = local.OkitVcn1704881592637_default_route_table_id
    display_name = "ocdputrt"
    route_rules {
        description = "Access Internet"
        destination = "0.0.0.0/0"
        destination_type = "CIDR_BLOCK"
        network_entity_id = local.OkitInternetGateway1704904637830_id
    }
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}



# ------ Create Route Table
resource "oci_core_route_table" "OkitRouteTable1704905350785" {
    
    compartment_id = local.OkitCompartment1704709397851_id
    display_name = "ocdprivrt"

    vcn_id = local.OkitVcn1704881592637_id
    route_rules {
        description = "NAT Internet Access"
        destination = "0.0.0.0/0"
        destination_type = "CIDR_BLOCK"
        network_entity_id = local.OkitNatGateway1704905104188_id
    }
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}


# ------ Update Default Route Table
resource "oci_core_default_route_table" "OkitRouteTable1710854551243" {
    manage_default_resource_id = local.OkitVcn1710854551242_default_route_table_id
    display_name = "ocdprivrt"
    route_rules {
        description = "All to NAT"
        destination = "0.0.0.0/0"
        destination_type = "CIDR_BLOCK"
        network_entity_id = local.OkitNatGateway1716308905251_id
    }
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}


# ------ Update Default Security List
resource "oci_core_default_security_list" "OkitSecurityList1704881592638" {
    manage_default_resource_id = local.OkitVcn1704881592637_default_security_list_id
    display_name = "ocdpubsl"
    egress_security_rules {
        description = "Default All Egress Rule"
        destination = "0.0.0.0/0"
        destination_type = "CIDR_BLOCK"
        protocol = "all"
        stateless = false
    # icmp_options is not defined. Type: object SubType:  Required: false
    # tcp_options is not defined. Type: object SubType:  Required: false
    # udp_options is not defined. Type: object SubType:  Required: false
    }
    ingress_security_rules {
        description = " Default SSH Ingress Rule"
        protocol = "6"
        source = "0.0.0.0/0"
        source_type = "CIDR_BLOCK"
        stateless = false
    # icmp_options is not defined. Type: object SubType:  Required: false
    # tcp_options is not defined. Type: object SubType:  Required: false
    # udp_options is not defined. Type: object SubType:  Required: false
    }
    ingress_security_rules {
        description = "Default Ingress Rule"
        protocol = "1"
        source = "0.0.0.0/0"
        source_type = "CIDR_BLOCK"
        stateless = false
    # icmp_options is not defined. Type: object SubType:  Required: false
    # tcp_options is not defined. Type: object SubType:  Required: false
    # udp_options is not defined. Type: object SubType:  Required: false
    }
    ingress_security_rules {
        description = "Default VCN Access Ingress Rule"
        protocol = "1"
        source = "10.0.0.0/16"
        source_type = "CIDR_BLOCK"
        stateless = false
    # icmp_options is not defined. Type: object SubType:  Required: false
    # tcp_options is not defined. Type: object SubType:  Required: false
    # udp_options is not defined. Type: object SubType:  Required: false
    }
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}


# ------ Create Security List
resource "oci_core_security_list" "OkitSecurityList1704905567633" {
    
    compartment_id = local.OkitCompartment1704709397851_id
    display_name = "ocdprivsl"

    vcn_id = local.OkitVcn1704881592637_id
    # egress_security_rules is not defined. Type: list SubType: object Required: false
    # ingress_security_rules is not defined. Type: list SubType: object Required: false
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}


# ------ Update Default Security List
resource "oci_core_default_security_list" "OkitSecurityList1710854551243" {
    manage_default_resource_id = local.OkitVcn1710854551242_default_security_list_id
    display_name = "ocdprivsl"
    egress_security_rules {
        description = "Default All Egress Rule"
        destination = "0.0.0.0/0"
        destination_type = "CIDR_BLOCK"
        protocol = "all"
        stateless = false
    # icmp_options is not defined. Type: object SubType:  Required: false
    # tcp_options is not defined. Type: object SubType:  Required: false
    # udp_options is not defined. Type: object SubType:  Required: false
    }
    ingress_security_rules {
        description = " Default SSH Ingress Rule"
        protocol = "6"
        source = "0.0.0.0/0"
        source_type = "CIDR_BLOCK"
        stateless = false
    # icmp_options is not defined. Type: object SubType:  Required: false
    # tcp_options is not defined. Type: object SubType:  Required: false
    # udp_options is not defined. Type: object SubType:  Required: false
    }
    ingress_security_rules {
        description = "Default Ingress Rule"
        protocol = "1"
        source = "0.0.0.0/0"
        source_type = "CIDR_BLOCK"
        stateless = false
    # icmp_options is not defined. Type: object SubType:  Required: false
    # tcp_options is not defined. Type: object SubType:  Required: false
    # udp_options is not defined. Type: object SubType:  Required: false
    }
    ingress_security_rules {
        description = "Default VCN Access Ingress Rule"
        protocol = "1"
        source = "10.0.0.0/16"
        source_type = "CIDR_BLOCK"
        stateless = false
    # icmp_options is not defined. Type: object SubType:  Required: false
    # tcp_options is not defined. Type: object SubType:  Required: false
    # udp_options is not defined. Type: object SubType:  Required: false
    }
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}

        `,
        expect: ``
    },
    {
        description: ' Test Locals Block Parsing',
        input: `

locals {
    OkitVcn1704881592637_id = oci_core_vcn.OkitVcn1704881592637.id
    OkitVcn1704881592637_default_route_table_id = oci_core_vcn.OkitVcn1704881592637.default_route_table_id
    OkitVcn1704881592637_default_security_list_id = oci_core_vcn.OkitVcn1704881592637.default_security_list_id
    OkitVcn1704881592637_default_dhcp_options_id = oci_core_vcn.OkitVcn1704881592637.default_dhcp_options_id

}

        `,
        expect: ``
    },
    {
        description: ' Test Output Block Parsing',
        input: `
output "Home_Region_Name" {
    value = local.home_region
}
        `,
        expect: ``
    },
    {
        description: ' Test Provider Block Parsing',
        input: `
# ------ Connect to Provider
provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}
provider "oci" {
    alias            = "home_region"
    tenancy_ocid     = var.tenancy_ocid
    user_ocid        = var.user_ocid
    fingerprint      = var.fingerprint
    private_key_path = var.private_key_path
    region           = local.home_region
}

        `,
        expect: ``
    },
    {
        description: ' Test Terraform Block Parsing',
        input: `
terraform {
    required_version = ">= 0.12.0"
}


        `,
        expect: ``
    },
    {
        description: ' Test Instance Block Parsing',
        input: `
# ------ Create Instance
resource "oci_core_instance" "OkitInstance1706530690079" {
    
    compartment_id = local.OkitCompartment1706541787587_id
    display_name = "ocdNGINX1"

    availability_domain = local.ad-1_name
    
    is_pv_encryption_in_transit_enabled = false
    metadata = {
        ssh_authorized_keys = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCXsddY92FNhp6jbm+NpnjGS7XlnYiETxTIyrcQFGm12Iu7Lcz78L4EMiuKBxUzXb0wwtcxHakk3QjNBA7cPIeMQfjcgksewCyfbmPtEosuuhWREp3wvscKo3ccE0lU6Y0BvqJvynXe1A4XWvHjRt99em/XmIRacZ+zNtvv+Nmk53/kk9yYmOXL5oRFX3KA06xNQaUXvPyTo/NLSu7h9kaQznRi7w+6vsu3BWociU5EMifqv3DImeFTPFpzgmC9CsxrM8Z5e7a5i/tIxQc45HsDyDQg/WVxb/c5BLe3UXZnkNxJyE/m+7fg9rcVaY4vzZeMMS1U5wAANuAeFJkYQH1KsyKdYY2NbjoHsnz6JGp/dZuxbZtjQpEYIHQ6Pnn7gEst0q8ZARqu/XMBmyvBWRKbxpnNejp2v/98XzV0PSWLT/z6alqFnS/Xe3gIbPQvdU0lTvUNPU26HNPVsQtejj0VmfHm2GpJG2uclLtOGykLBmNu1ybHPsNleIWKy9NlskiE4PNuEzfvGEIrK4Y0GYc1zRllbeiJ2DV737bZSZAMaRbvN0am0SfkugEH/VONWseOcWdSKPuyc0Yt2nH6fJN6SR8Pv1uBIgy6No8ySuzHtZES2wqpXgWsF7ee48VgY1sZ35+bisCFFTBZQoK5g119SM9y3QTkRhrfMG4ostEkkw== andrew.hopkinson@oracle.com"
        user_data = base64encode("#cloud-config\npackages:\n  - git\n\nwrite_files:\n  - path: /etc/.bashrc\n    append: true\n    content: |\n      alias lh='ls -lash'\n      alias lt='ls -last'\n      alias env='/usr/bin/env | sort'\n      alias whatsmyip='curl -X GET https://www.whatismyip.net | grep ipaddress'\n\nruncmd:\n  # Set Firewall Rules\n  - sudo firewall-offline-cmd  --add-port=5000/tcp\n  - sudo systemctl restart firewalld\n\nfinal_message: \"**** The system is finally up, after $UPTIME seconds ****\"")
    }
    
    
    shape = "VM.Standard.A1.Flex"
    agent_config {
        are_all_plugins_disabled = false
        is_management_disabled = false
        is_monitoring_disabled = false
    # pluginsConfig Type list SubType  Required false
    }
    create_vnic_details {
    
        assign_public_ip = false
    
        hostname_label = "ocdnginx1"
        nsg_ids = [local.OkitNetworkSecurityGroup1708588799060_id, local.OkitNetworkSecurityGroup1_id]
        skip_source_dest_check = false
        subnet_id = local.OkitSubnet1704905262946_id
    }
    shape_config {
        memory_in_gbs = 8
        ocpus = 2
    }
    source_details {
        boot_volume_size_in_gbs = 60
    
    
        source_id = local.OkitInstance1706530690079_image_id
        source_type = "image"
    }
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}

locals {
    OkitInstance1706530690079_id = oci_core_instance.OkitInstance1706530690079.id
    OkitInstance1706530690079_private_ip = oci_core_instance.OkitInstance1706530690079.private_ip
    OkitInstance1706530690079_public_ip = oci_core_instance.OkitInstance1706530690079.public_ip
        
}

        `,
        expect: ``
    },
    {
        description: 'Test Identity Block Parsing',
        input: `

        # ======================================================================
        # === Auto Generated Code All Edits Will Be Lost During Regeneration ===
        # ======================================================================
            
        
        # ------ Create Compartment
        resource "oci_identity_compartment" "OkitCompartment1704709397851" {
            provider       = oci.home_region
            compartment_id = var.compartment_ocid
            name = "network"
        
            description = "OCI Network Compartment"
            enable_delete = false
            # Tags
            freeform_tags = {
                "ocd_version" : "0.2.7",
                "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
                "ocd_design_name" : "OCD Beta Test Design",
                "yet_another_tag" : "Test"
            }
            
        
        }
        
        locals {
            OkitCompartment1704709397851_id = oci_identity_compartment.OkitCompartment1704709397851.id
            
        }
        
        
        
        
        # ------ Create Compartment
        resource "oci_identity_compartment" "OkitCompartment1706541787587" {
            provider       = oci.home_region
            compartment_id = var.compartment_ocid
            name = "infrastructure"
        
            description = "OCI Infrastructure Compartment"
            enable_delete = false
            # Tags
            freeform_tags = {
                "ocd_version" : "0.2.7",
                "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
                "ocd_design_name" : "OCD Beta Test Design",
                "yet_another_tag" : "Test"
            }
            
        
        }
        
        locals {
            OkitCompartment1706541787587_id = oci_identity_compartment.OkitCompartment1706541787587.id
            
        }
        
        
        
        
        # ------ Create Dynamic Group
        resource "oci_identity_dynamic_group" "OkitDynamicGroup1712678783480" {
            provider       = oci.home_region
            compartment_id = var.tenancy_ocid
            name = "OCDTestDynamicGroup"
        
            description = "OCD Test Dynamic Group"
            matching_rule = "All {All {instance.compartment.id = 'ocid1.compartment.oc1..aaaaaaaanydlskyuwx26ren4snt4ilismusxi5vtodh63p7yjmsixnd7ukia'}}"
            # Tags
            freeform_tags = {
                "ocd_version" : "0.2.7",
                "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
                "ocd_design_name" : "OCD Beta Test Design",
                "yet_another_tag" : "Test"
            }
            
        
        }
        
        locals {
            OkitDynamicGroup1712678783480_id = oci_identity_dynamic_group.OkitDynamicGroup1712678783480.id
            
        }
        
        
        
        
        # ------ Create Group
        resource "oci_identity_group" "OkitGroup1713779365385" {
            provider       = oci.home_region
            compartment_id = var.tenancy_ocid
            name = "OCDTestGroup"
        
            description = "Test Group"
            # Tags
            freeform_tags = {
                "ocd_version" : "0.2.7",
                "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
                "ocd_design_name" : "OCD Beta Test Design",
                "yet_another_tag" : "Test"
            }
            
        
        }
        
        locals {
            OkitGroup1713779365385_id = oci_identity_group.OkitGroup1713779365385.id
            
        }
        
        
        
        
        # ------ Create User
        resource "oci_identity_user" "OkitUser1713779390586" {
            provider       = oci.home_region
            compartment_id = var.tenancy_ocid
            name = "OcdUser"
        
            description = "Test user"
            email = "andrewhopkinson@duck.com"
            # Tags
            freeform_tags = {
                "ocd_version" : "0.2.7",
                "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
                "ocd_design_name" : "OCD Beta Test Design",
                "yet_another_tag" : "Test"
            }
            
        
        }
        
        locals {
            OkitUser1713779390586_id = oci_identity_user.OkitUser1713779390586.id
            
        }
        
        
        `,
        expect: ''
    },
    {
        description: 'Tes Variable Block Parsing',
        input: `
    
variable "admin-p" {
    default = "WelcomE_-12345#"
    description = ""
}
        `,
        expect: ''
    },
    {
        description: 'Test Route Table Parsing',
        input: `
# ------ Update Default Route Table
resource "oci_core_default_route_table" "OkitRouteTable1704881592638" {
    manage_default_resource_id = local.OkitVcn1704881592637_default_route_table_id
    display_name = "ocdputrt"
    route_rules {
        description = "Access Internet"
        destination = "0.0.0.0/0"
        destination_type = "CIDR_BLOCK"
        network_entity_id = local.OkitInternetGateway1704904637830_id
    }
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}

locals {
    OkitRouteTable1704881592638_id = oci_core_default_route_table.OkitRouteTable1704881592638.id
    
}


# ------ Create Route Table
resource "oci_core_route_table" "OkitRouteTable1704905350785" {
    
    compartment_id = local.OkitCompartment1704709397851_id
    display_name = "ocdprivrt"

    vcn_id = local.OkitVcn1704881592637_id
    route_rules {
        description = "NAT Internet Access"
        destination = "0.0.0.0/0"
        destination_type = "CIDR_BLOCK"
        network_entity_id = local.OkitNatGateway1704905104188_id
    }
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}

locals {
    OkitRouteTable1704905350785_id = oci_core_route_table.OkitRouteTable1704905350785.id
    
}




# ------ Update Default Route Table
resource "oci_core_default_route_table" "OkitRouteTable1710854551243" {
    manage_default_resource_id = local.OkitVcn1710854551242_default_route_table_id
    display_name = "ocdprivrt"
    route_rules {
        description = "All to NAT"
        destination = "0.0.0.0/0"
        destination_type = "CIDR_BLOCK"
        network_entity_id = local.OkitNatGateway1716308905251_id
    }
    # Tags
    freeform_tags = {
        "ocd_version" : "0.2.7",
        "OKIT-Open-Cloud-Designer-Version" : "0.2.7",
        "ocd_design_name" : "OCD Beta Test Design",
        "yet_another_tag" : "Test"
    }
    

}

locals {
    OkitRouteTable1710854551243_id = oci_core_default_route_table.OkitRouteTable1710854551243.id
    
}
        `,
        expect: ''
    },
]