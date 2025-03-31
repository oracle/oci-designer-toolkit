import { TokenTypes } from '../terraform/types/TokenTypes.js'
import { Token } from '../terraform/Token.js'
export const lexerTestCases = [
    {
        description: ' Test Instance Simple Lexing',
        input: String.raw`
        terraform {
            required_version = ">= 1.5.0"
        }

        provider "oci" {
            tenancy_ocid     = var.tenancy_ocid
            user_ocid        = var.user_ocid
            fingerprint      = var.fingerprint
            private_key_path = var.private_key_path
            region           = var.region
        }
        data "oci_identity_region_subscriptions" "HomeRegion" {
            tenancy_id = var.tenancy_ocid
            filter {
                name = "is_home_region"
                values = [true]
            }
        }
        output "Home_Region_Name" {
            value = local.home_region
        }
        # ------ Create Vcn
        resource "oci_core_vcn" "OkitVcn1740741647019" {
            
            compartment_id = local.OkitCompartment1740741642869_id
            display_name = "Vcn 5009"
        
            cidr_blocks = ["10.0.0.0/16", "10.1.0.0/16"]
            is_ipv6enabled = false
            # Tags
            freeform_tags = {
                "ocd_version" : "0.2.7",
                "OKIT-Open-Cloud-Designer-Version" : "0.2.7"
            }
            
        
        }
        
        locals {
            OkitVcn1740741647019_default_security_list_id = oci_core_vcn.OkitVcn1740741647019.default_security_list_id
            OkitVcn1740741647019_default_dhcp_options_id = oci_core_vcn.OkitVcn1740741647019.default_dhcp_options_id
        
        }
        `,
        expect: [
            new Token(TokenTypes.TERRAFORM, 'TERRAFORM', 'terraform' ),
            new Token(TokenTypes.BRACEOPEN, 'BRACEOPEN', '{' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'required_version' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.STRING, 'STRING', '>= 1.5.0' ),
            new Token(TokenTypes.BRACECLOSE, 'BRACECLOSE', '}' ),

            new Token(TokenTypes.PROVIDER, 'PROVIDER', 'provider' ),
            new Token(TokenTypes.STRING, 'STRING', 'oci' ),
            new Token(TokenTypes.BRACEOPEN, 'BRACEOPEN', '{' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'tenancy_ocid' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'var.tenancy_ocid' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'user_ocid' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'var.user_ocid' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'fingerprint' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'var.fingerprint' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'private_key_path' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'var.private_key_path' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'region' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'var.region' ),
            new Token(TokenTypes.BRACECLOSE, 'BRACECLOSE', '}' ),

            new Token(TokenTypes.DATA, 'DATA', 'data' ),
            new Token(TokenTypes.STRING, 'STRING', 'oci_identity_region_subscriptions' ),
            new Token(TokenTypes.STRING, 'STRING', 'HomeRegion' ),
            new Token(TokenTypes.BRACEOPEN, 'BRACEOPEN', '{' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'tenancy_id' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'var.tenancy_ocid' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'filter' ),
            new Token(TokenTypes.BRACEOPEN, 'BRACEOPEN', '{' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'name' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.STRING, 'STRING', 'is_home_region' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'values' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.SQUAREBRACKETOPEN, 'BRACKETOPEN', '[' ),
            new Token(TokenTypes.BOOLEAN, 'BOOLEAN', 'true' ),
            new Token(TokenTypes.BRACECLOSE, 'BRACECLOSE', '}' ),
            new Token(TokenTypes.BRACECLOSE, 'BRACECLOSE', '}' ),

            new Token(TokenTypes.OUTPUT, 'OUTPUT', 'output' ),
            new Token(TokenTypes.STRING, 'STRING', 'Home_Region_Name' ),
            new Token(TokenTypes.BRACEOPEN, 'BRACEOPEN', '{' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'value' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'local.home_region' ),
            new Token(TokenTypes.BRACECLOSE, 'BRACECLOSE', '}' ),        
            new Token(TokenTypes.COMMENT, 'COMMENT', '# ------ Create Vcn' ),

            new Token(TokenTypes.RESOURCE, 'RESOURCE', 'resource' ),
            new Token(TokenTypes.STRING, 'STRING', 'oci_core_vcn' ),
            new Token(TokenTypes.STRING, 'STRING', 'OkitVcn1740741647019' ),
            new Token(TokenTypes.BRACEOPEN, 'BRACEOPEN', '{' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'compartment_id' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'local.OkitCompartment1740741642869_id' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'display_name' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.STRING, 'STRING', 'Vcn 5009' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'cidr_blocks' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.SQUAREBRACKETOPEN, 'BRACKETOPEN', '[' ),
            new Token(TokenTypes.STRING, 'STRING', '10.0.0.0/16' ),
            new Token(TokenTypes.COMMA, 'COMMA', ',' ),
            new Token(TokenTypes.STRING, 'STRING', '10.1.0.0/16' ),
            new Token(TokenTypes.SQUAREBRACKETCLOSE, 'BRACKETCLOSE', ']' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'is_ipv6enabled' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.BOOLEAN, 'BOOLEAN', 'false' ),
            new Token(TokenTypes.COMMENT, 'COMMENT', '# Tags' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'freeform_tags' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.BRACEOPEN, 'BRACEOPEN', '{' ),
            new Token(TokenTypes.STRING, 'STRING', 'ocd_version' ),
            new Token(TokenTypes.COLON, 'COLON', ':' ),
            new Token(TokenTypes.STRING, 'STRING', '0.2.7' ),
            new Token(TokenTypes.COMMA, 'COMMA', ',' ),
            new Token(TokenTypes.STRING, 'STRING', 'OKIT-Open-Cloud-Designer-Version' ),
            new Token(TokenTypes.COLON, 'COLON', ':' ),
            new Token(TokenTypes.STRING, 'STRING', '0.2.7' ),
            new Token(TokenTypes.BRACECLOSE, 'BRACECLOSE', '}' ),
            new Token(TokenTypes.BRACECLOSE, 'BRACECLOSE', '}' ),

            new Token(TokenTypes.LOCALS, 'LOCALS', 'locals' ),
            new Token(TokenTypes.BRACEOPEN, 'BRACEOPEN', '{' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'OkitVcn1740741647019_default_security_list_id' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'oci_core_vcn.OkitVcn1740741647019.default_security_list_id' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'OkitVcn1740741647019_default_dhcp_options_id' ),
            new Token(TokenTypes.ASSIGN, 'ASSIGN', '=' ),
            new Token(TokenTypes.IDENTIFIER, 'IDENTIFIER', 'oci_core_vcn.OkitVcn1740741647019.default_dhcp_options_id' ),
            new Token(TokenTypes.BRACECLOSE, 'BRACECLOSE', '}' ),
        ]
    },
    {
        description: ' Test Instance Block Lexing',
        input: String.raw`
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
        nsg_ids = [local.OkitNetworkSecurityGroup1708588799060_id]
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
        `,
        expect: ``
    },
    {
        description: ' Test Double Quote Lexing',
        input: String.raw`
resource "oci_core_instance" "OkitInstance1706530690079" {
    metadata = {
        user_data = base64encode("#cloud-config\npackages:\n  - git\n\nwrite_files:\n  - path: /etc/.bashrc\n    append: true\n    content: |\n      alias lh='ls -lash'\n      alias lt='ls -last'\n      alias env='/usr/bin/env | sort'\n      alias whatsmyip='curl -X GET https://www.whatismyip.net | grep ipaddress'\n\nruncmd:\n  # Set Firewall Rules\n  - sudo firewall-offline-cmd  --add-port=5000/tcp\n  - sudo systemctl restart firewalld\n\nfinal_message: \"**** The system is finally up, after $UPTIME seconds ****\"")
    }
}
        `,
        expect: ``
    },
    {
        description: ' Test Array Lexing',
        input: String.raw`
resource "oci_core_instance" "OkitInstance1706530690079" {
    create_vnic_details {
    
        assign_public_ip = false
    
        hostname_label = "ocdnginx1"
        nsg_ids = [local.OkitNetworkSecurityGroup1708588799060_id, local.OkitNetworkSecurityGroup_id]
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
        `,
        expect: ``
    },
    {
        description: 'Test Identity Block Lexing',
        input: `
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
        `,
        expect: ''
    },
    {
        description: 'Test Variable Block Parsing',
        input: `
    
variable "admin-p" {
    default = "WelcomE_-12345#"
    description = ""
}
        `,
        expect: ''
    },
]