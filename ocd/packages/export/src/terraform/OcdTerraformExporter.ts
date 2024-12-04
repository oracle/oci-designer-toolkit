/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "@ocd/model"
import { OcdExporter, OutputDataStringArray } from "../OcdExporter.js"
import { OciExporter } from "./OciExporter.js"
import { AzureExporter } from "./AzureExporter.js"
import { GoogleExporter } from "./GoogleExporter.js"

interface ResourceMap extends Record<string, Record<string, string>> {}

export class OcdTerraformExporter extends OcdExporter {
    terraform: string = ''
    resourceFileMap: ResourceMap = {
        oci: {
            bastion: "oci_identity.tf",
            compartment: "oci_identity.tf",
            dynamic_group: "oci_identity.tf",
            group: "oci_identity.tf",
            key: "oci_identity.tf",
            user: "oci_identity.tf",
            vault: "oci_identity.tf",
            vault_secret: "oci_identity.tf",

            dhcp_options: "oci_networking.tf",
            drg: "oci_networking.tf",
            drg_attachment: "oci_networking.tf",
            internet_gateway: "oci_networking.tf",
            load_balancer: "oci_networking.tf",
            load_balancer_backend: "oci_networking.tf",
            load_balancer_backend_set: "oci_networking.tf",
            load_balancer_listener: "oci_networking.tf",
            local_peering_gateway: "oci_networking.tf",
            nat_gateway: "oci_networking.tf",
            network_firewall: "oci_networking.tf",
            network_load_balancer: "oci_networking.tf",
            network_security_group: "oci_networking.tf",
            network_security_group_security_rule: "oci_networking.tf",
            remote_peering_connection: "oci_networking.tf",
            route_table: "oci_networking.tf",
            security_list: "oci_networking.tf",
            service_gateway: "oci_networking.tf",
            subnet: "oci_networking.tf",
            vcn: "oci_networking.tf",

            bucket: "oci_storage.tf",
            file_system: "oci_storage.tf",
            mount_target: "oci_storage.tf",
            volume: "oci_storage.tf",
            volume_attachment: "oci_storage.tf",

            analytics_instance: "oci_compute.tf",
            autoscaling_configuration: "oci_compute.tf",
            data_science_project: "oci_compute.tf",
            instance: "oci_compute.tf",
            instance_configuration: "oci_compute.tf",
            instance_pool: "oci_compute.tf",
            oracle_digital_assistant: "oci_compute.tf",
            visual_builder_instance: "oci_compute.tf",

            autonomous_database: "oci_database.tf",
            db_system: "oci_database.tf",
            exadata_cloud_infrastructure: "oci_database.tf",
            mysql_db_system: "oci_database.tf",
            nosql_table: "oci_database.tf",

            cpe: "oci_customer.tf",
            ipsec: "oci_customer.tf",

            oke_cluster: "oci_container.tf",
            node_pool: "oci_container.tf",

            unknown: "oci_unspecified.tf"
        },
        azure: {
            dns_zone: "azure_networking.tf",
            load_balancer: "azure_networking.tf",
            subnet: "azure_networking.tf",
            virtual_network: "azure_networking.tf",

            virtual_machine: "azure_compute.tf",

            container_registry: "azure_container.tf",
            kubernetes_cluster: "azure_container.tf",

            unknown: "azure_unspecified.tf"
        }
    }
    export = (design: OcdDesign): OutputDataStringArray => {
        this.design = design
        const ociExporter = new OciExporter()
        const azureExporter = new AzureExporter()
        const googleExporter = new GoogleExporter()
        const outputData: OutputDataStringArray = {
            ...ociExporter.export(design),
            ...azureExporter.export(design),
            ...googleExporter.export(design),
            // ...this.exportOci(design),
            // ...this.exportAzure(design)
        }
        const allResources: string[] = Object.values(outputData).reduce((a, c) => [...a, ...c], [])
        this.terraform = allResources.join('\n')
        return outputData
    }
//     // Oci Methods
//     exportOci = (design: OcdDesign): OutputDataStringArray => {
//         // this.design = design
//         // Id to Terraform Resource Name Map
//         const idTFResourceMap: Record<string, string> = this.getOciResources().reduce((a, c) => {a[c.id] = c.terraformResourceName; return a}, {} as Record<string, string>)
//         console.debug('OcdTerraformExporter: ociExport: idTFResourceMap:', idTFResourceMap)
//         let outputData: OutputDataStringArray = {}
//         if (Object.keys(idTFResourceMap).length > 0) {
//             const uniqueFilenames = [...new Set(Object.values(this.resourceFileMap.oci))]
//             outputData = {
//                 "oci_provider.tf": [this.ociProvider()],
//                 "oci_provider_variables.tf": [this.ociProviderVariables()],
//                 "oci_connection.tfvars": [this.ociProviderTFVars()],
//                 "oci_metadata.tf": [this.ociMetadata()],
//                 ...uniqueFilenames.sort(OcdUtils.simpleSort).reduce((a, c) => {a[c] = [this.autoGeneratedNotice()]; return a}, {} as Record<string, string[]>),
//                 "oci_user_variables.tf": [this.ociUserVariables()],
//             }
//             // Id to Terraform Resource Name Map
//             // const idTFResourceMap: Record<string, string> = this.getResources().reduce((a, c) => {a[c.id] = c.terraformResourceName; return a}, {} as Record<string, string>)
//             // Generate OCI Terraform
//             Object.entries(design.model.oci.resources).forEach(([k, v]) => {
//                 const className = OcdUtils.toClassName('Oci', k)
//                 const filename = this.resourceFileMap.oci.hasOwnProperty(k) ? this.resourceFileMap.oci[k] : this.resourceFileMap.oci['unknown']
//                 // @ts-ignore
//                 v.forEach((r: OciResource) => {
//                     // @ts-ignore 
//                     const tfResource = new OciTerraformResources[className](r, idTFResourceMap)
//                     if (!outputData.hasOwnProperty(filename)) outputData[filename] = [this.autoGeneratedNotice()]
//                     outputData[filename].push(tfResource.generate(r, design))
//                 })
//             })
//             // const allResources: string[] = Object.values(outputData).reduce((a, c) => [...a, ...c], [])
//             // this.terraform = allResources.join('\n')
//         }
//         return outputData
//     }
//     ociProvider = () => {return `${this.autoGeneratedNotice()}
// terraform {
//     required_version = ">= 1.5.0"
// }

// # ------ Configure the OCI Provider
// provider "oci" {
//     tenancy_ocid     = var.tenancy_ocid
//     user_ocid        = var.user_ocid
//     fingerprint      = var.fingerprint
//     private_key_path = var.private_key_path
//     region           = var.region
// }

// # ------ Home Region Provider
// data "oci_identity_region_subscriptions" "HomeRegion" {
//     tenancy_id = var.tenancy_ocid
//     filter {
//         name = "is_home_region"
//         values = [true]
//     }
// }
// locals {
//     home_region = lookup(element(data.oci_identity_region_subscriptions.HomeRegion.region_subscriptions, 0), "region_name")
// }

// provider "oci" {
//     alias            = "home_region"
//     tenancy_ocid     = var.tenancy_ocid
//     user_ocid        = var.user_ocid
//     fingerprint      = var.fingerprint
//     private_key_path = var.private_key_path
//     region           = local.home_region
// }

// output "Home_Region_Name" {
//     value = local.home_region
// }
//     `}
//     ociProviderVariables = () => {return `${this.autoGeneratedNotice()}
// variable "tenancy_ocid" {
//     type = string
//     description = "OCID of the Tenancy where the defined resources will be created."
// }
// variable "user_ocid" {
//     type = string
//     description = "OCID of the User who will create the defined resources."
// }
// variable "fingerprint" {
//     type = string
//     description = "Fingerprint associated with the Private Key File."
// }
// variable "private_key_path" {
//     type = string
//     description = "Path to the user_ocid users Private Key File."
// }
// variable "region" {
//     type = string
//     description = "Name of the Region where the defined resources will be created."
// }
// variable "compartment_ocid" {
//     type = string
//     description = "OCID of the Compartment where the defined resources will be created."
// }
//     `}
//     ociProviderTFVars = (useConfig: boolean = false) => {return `${this.autoGeneratedNotice()}
// # -- Tenancy Information
// tenancy_ocid = "${useConfig ? 'Read from Config' : 'Enter your destination Tenancy OCID here, e.g. ocid1.tenancy.oc1....... (See ~/.oci/config->tenancy)'}"
// region = "${useConfig ? 'Read from Config' : 'Enter your destination Region Code, e.g. uk-london-1 (See ~/.oci/config->region)'}"
// compartment_ocid = "${useConfig ? 'Read from Config' : 'Enter your destination Compartment OCID here, e.g. ocid1.compartment.oc1......'}"

// # -- User Information
// user_ocid = "${useConfig ? 'Read from Config' : 'Enter your User OCID here, e.g. ocid1.user.oc1...... (See ~/.oci/config->user)'}"
// private_key_path = "${useConfig ? 'Read from Config' : 'Enter the absolute path to the Private Key file associated with the user_ocid. (See ~/.oci/config->key_file)'}"
// fingerprint = "${useConfig ? 'Read from Config' : 'Enter the fingerprint associated with the specified private_key_file. (See ~/.oci/config->fingerprint)'}"
//     `}
//     ociMetadata = () => {return `${this.autoGeneratedNotice()}
// # ----- Get Availability Domains
// data "oci_identity_availability_domains" "AvailabilityDomains" {
//     compartment_id = var.tenancy_ocid
// }
// # => Access via the "element" function will allow for wrap-arounf of the returned Availability Domain List. 
// # => This will allow the same code to be used in 3 AD Regions and 1 AD Regions.
// locals {
//     ad-1_name = element(data.oci_identity_availability_domains.AvailabilityDomains.availability_domains, 0).name
//     ad-2_name = element(data.oci_identity_availability_domains.AvailabilityDomains.availability_domains, 1).name
//     ad-3_name = element(data.oci_identity_availability_domains.AvailabilityDomains.availability_domains, 2).name
//     ad-1_id   = element(data.oci_identity_availability_domains.AvailabilityDomains.availability_domains, 0).id
//     ad-2_id   = element(data.oci_identity_availability_domains.AvailabilityDomains.availability_domains, 1).id
//     ad-3_id   = element(data.oci_identity_availability_domains.AvailabilityDomains.availability_domains, 2).id
// }
// # ------ Get All Service OCID
// data "oci_core_services" "AllRegionServices" {
//     filter {
//         name = "cidr_block"
//         values = ["all-*"]
//         regex = true
//     }
// }
// locals {
//     all_services_id          = data.oci_core_services.AllRegionServices.services[0].id
//     all_services_cidr_block  = data.oci_core_services.AllRegionServices.services[0].cidr_block
//     all_services_destination = data.oci_core_services.AllRegionServices.services[0].cidr_block
// }
// # ------ Get Object Storage Service OCID
// data "oci_core_services" "ObjectStorageRegionServices" {
//     filter {
//         name = "cidr_block"
//         values = ["\\\\w*objectstorage"]
//         regex = true
//     }
// }
// locals {
//     objectstorage_services_id          = data.oci_core_services.ObjectStorageRegionServices.services[0].id
//     objectstorage_services_cidr_block  = data.oci_core_services.ObjectStorageRegionServices.services[0].cidr_block
//     objectstorage_services_destination = data.oci_core_services.ObjectStorageRegionServices.services[0].cidr_block
// }
//     `}
//     ociUserVariables = () => {return `${this.autoGeneratedNotice()}
// ${this.design.model.oci.vars.map((v) => this.variableStatement(v)).join('')}
//     `}
//     // Azure Methods
//     exportAzure = (design: OcdDesign): OutputDataStringArray => {
//         // Id to Terraform Resource Name Map
//         const idTFResourceMap: Record<string, string> = this.getAzureResources().reduce((a, c) => {a[c.id] = c.terraformResourceName; return a}, {} as Record<string, string>)
//         console.debug('OcdTerraformExporter: azureExport: idTFResourceMap:', idTFResourceMap)
//         let outputData: OutputDataStringArray = {}
//         if (Object.keys(idTFResourceMap).length > 0) {
//             const uniqueFilenames = [...new Set(Object.values(this.resourceFileMap.azure))]
//             outputData = {
//                 "azure_provider.tf": [this.azureProvider()],
//                 "azure_provider_variables.tf": [this.azureProviderVariables()],
//                 // "azure_connection.tfvars": [this.azureProviderTFVars()],
//                 "azure_connection.tfvars": [this.azureProviderTFVars()],
//                 "azure_metadata.tf": [this.azureMetadata()],
//                 ...uniqueFilenames.sort(OcdUtils.simpleSort).reduce((a, c) => {a[c] = [this.autoGeneratedNotice()]; return a}, {} as Record<string, string[]>),
//                 // "azure_user_variables.tf": [this.azureUserVariables()],
//             }
//             // Generate OCI Terraform
//             Object.entries(design.model.azure.resources).forEach(([k, v]) => {
//                 const className = OcdUtils.toClassName('Azure', k)
//                 const filename = this.resourceFileMap.azure.hasOwnProperty(k) ? this.resourceFileMap.azure[k] : this.resourceFileMap.azure['unknown']
//                 // @ts-ignore
//                 v.forEach((r: OciResource) => {
//                     // @ts-ignore 
//                     const tfResource = new AzureTerraformResources[className](r, idTFResourceMap)
//                     if (!outputData.hasOwnProperty(filename)) outputData[filename] = [this.autoGeneratedNotice()]
//                     outputData[filename].push(tfResource.generate(r, design))
//                 })
//             })
//         }
//         return outputData
//     }
//     azureProvider = () => {return `${this.autoGeneratedNotice()}
// terraform {
//     required_version = ">= 1.5.0"
// }

// # ------ Configure the Microsoft Azure Provider
// provider "azurerm" {
//   features {}

//   client_id                   = var.azure_client_id
//   client_certificate_path     = var.azure_client_certificate_path
//   client_certificate_password = var.azure_client_certificate_password
//   tenant_id                   = var.azure_tenant_id
//   subscription_id             = var.azure_subscription_id
// }`
//     }
//     azureProviderVariables = () => {return `${this.autoGeneratedNotice()}
// variable "azure_tenant_id" {
//     type = string
//     description = "OCID of the Tenancy where the defined resources will be created."
// }
// variable "azure_client_id" {
//     type = string
//     description = "OCID of the User who will create the defined resources."
// }
// variable "azure_client_certificate_password" {
//     type = string
//     description = "Fingerprint associated with the Private Key File."
// }
// variable "azure_client_certificate_path" {
//     type = string
//     description = "Path to the user_ocid users Private Key File."
// }
// variable "azure_subscription_id" {
//     type = string
//     description = "OCID of the Compartment where the defined resources will be created."
// }
//     `}
//     azureProviderTFVars = (useConfig: boolean = false) => {return `${this.autoGeneratedNotice()}
// # -- Tenancy Information
// azure_tenant_id = "${useConfig ? 'Read from Config' : 'Enter your destination Tenancy OCID here, e.g. ocid1.tenancy.oc1....... (See ~/.oci/config->tenancy)'}"
// azure_subscription_id = "${useConfig ? 'Read from Config' : 'Enter your destination Compartment OCID here, e.g. ocid1.compartment.oc1......'}"

// # -- User Information
// azure_client_id = "${useConfig ? 'Read from Config' : 'Enter your User OCID here, e.g. ocid1.user.oc1...... (See ~/.oci/config->user)'}"
// azure_client_certificate_path = "${useConfig ? 'Read from Config' : 'Enter the absolute path to the Private Key file associated with the user_ocid. (See ~/.oci/config->key_file)'}"
// azure_client_certificate_password = "${useConfig ? 'Read from Config' : 'Enter the fingerprint associated with the specified private_key_file. (See ~/.oci/config->fingerprint)'}"
//     `}
//     azureMetadata = () => {return `${this.autoGeneratedNotice()}
// `
//     }
//     // Common
//     variableStatement = (v: OcdVariable) => {
//         return `variable "${v.name}" {
//     ${v.default !== '' ? `default = "${v.default}"` : ''}
//     description = "${v.description}"
// }
// `
//     }

//     autoGeneratedNotice = () => {return`
// # ======================================================================
// # === Auto Generated Code All Edits Will Be Lost During Regeneration ===
// # ======================================================================
//     `}
}

export default OcdTerraformExporter
