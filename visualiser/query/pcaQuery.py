#!/usr/bin/python

# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "PCAQuery"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import json
import oci
import re

from discovery import OciResourceDiscoveryClient

from common.okitCommon import jsonToFormattedString
from common.okitCommon import logJson
from common.okitCommon import standardiseIds
from common.okitCommon import jsonToFormattedString
from common.okitCommon import userDataDecode
from common.okitLogging import getLogger
from common.okitCommon import userDataDecode
from facades.ociConnection import OCIConnection

# Configure logging
logger = getLogger()

class PCAQuery(OCIConnection):
    LIFECYCLE_STATES = [
        "ACTIVE", 
        "AVAILABLE", 
        "RUNNING", 
        "STARTING", 
        "STOPPING", 
        "STOPPED", 
        "CREATING_IMAGE",
        "PROVISIONING", 
        "UPDATING", 
        "INACTIVE", 
        "ALLOCATED", 
        "VALIDATING", 
        "VALIDATED"
        ]
    SUPPORTED_RESOURCES = [
        "Compartment", # Must be first because we will use the resulting list to query other resources in the selected and potentially child compartments
        "Bucket", 
        "CustomerDnsZone",
        "DHCPOptions", 
        "Drg", 
        "FileSystem", 
        "Group", 
        "Instance", 
        "InternetGateway",
        "LocalPeeringGateway",
        "MountTarget",
        "NatGateway", 
        "NetworkSecurityGroup", 
        "Policy", 
        "RouteTable", 
        "SecurityList", 
        "Subnet", 
        "User", 
        "Vcn",
        "Volume"
    ]
    ANCILLARY_RESOURCES = [
        "AvailabilityDomain", 
        "BootVolume",
        "BootVolumeAttachment", 
        "Export",
        "Image", 
        # "UserGroupMembership",
        "VnicAttachment", 
        "VolumeAttachment", 
    ]

    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(PCAQuery, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)
        self.ancillary_resources = {}
        self.dropdown_json = {}
        self.resource_map = {
            "AvailabilityDomain": {
                "method": self.availability_domains, 
                "client": "identity", 
                "array": "availability_domains"
                }, 
            "BootVolume": {
                "method": self.boot_volumes, 
                "client": "volume", 
                "array": "boot_volumes"
                },
            "BootVolumeAttachment": {
                "method": self.boot_volume_attachments, 
                "client": "compute", 
                "array": "boot_volume_attachments"
                },
            "Bucket": {
                "method": self.object_storage_buckets, 
                "client": "object", 
                "array": "object_storage_buckets"
                }, 
            "Compartment": {
                "method": self.compartments, 
                "client": "identity", 
                "array": "compartments"
                }, 
            "CustomerDnsZone": {
                "method": self.dns_zones, 
                "client": "dns", 
                "array": "dns_zones"
                }, 
            "DHCPOptions": {
                "method": self.dhcp_options, 
                "client": "network", 
                "array": "dhcp_options"
                }, 
            "Drg": {
                "method": self.dynamic_routing_gateways, 
                "client": "network", 
                "array": "dynamic_routing_gateways"
                }, 
            "Export": {
                "method": self.exports, 
                "client": "filestorage", 
                "array": "exports"
                }, 
            "FileSystem": {
                "method": self.file_systems, 
                "client": "filestorage", 
                "array": "file_systems"
                }, 
            "Group": {
                "method": self.groups, 
                "client": "identity", 
                "array": "groups"
                }, 
            "Image": {
                "method": self.images, 
                "client": "compute", 
                "array": "images"
                },
            "Instance": {
                "method": self.instances, 
                "client": "compute", 
                "array": "instances"
                }, 
            "InternetGateway": {
                "method": self.internet_gateways, 
                "client": "network", 
                "array": "internet_gateways"
                }, 
            "LocalPeeringGateway": {
                "method": self.local_peering_gateways, 
                "client": "network", 
                "array": "local_peering_gateways"
                },
            "MountTarget": {
                "method": self.mount_targets, 
                "client": "filestorage", 
                "array": "mount_targets"
                }, 
            "NatGateway": {
                "method": self.nat_gateways, 
                "client": "network", 
                "array": "nat_gateways"
                }, 
            "NetworkSecurityGroup": {
                "method": self.network_security_groups, 
                "client": "network", 
                "array": "network_security_groups"
                }, 
            "Policy": {
                "method": self.policies, 
                "client": "identity", 
                "array": "policys"
                }, 
            "RouteTable": {
                "method": self.route_tables, 
                "client": "network", 
                "array": "route_tables"
                }, 
            "SecurityList": {
                "method": self.security_lists, 
                "client": "network", 
                "array": "security_lists"
                }, 
            "Subnet": {
                "method": self.subnets, 
                "client": "network", 
                "array": "subnets"
                }, 
            "User": {
                "method": self.users, 
                "client": "identity", 
                "array": "users"
                }, 
            "UserGroupMembership": {
                "method": self.user_group_memberships, 
                "client": "identity", 
                "array": "user_group_memberships"
                }, 
            "Vcn": {
                "method": self.virtual_cloud_networks, 
                "client": "network", 
                "array": "virtual_cloud_networks"
                }, 
            "VnicAttachment": {
                "method": self.vnic_attachments, 
                "client": "compute", 
                "array": "vnic_attachments"
                },
            "Volume": {
                "method": self.block_storage_volumes, 
                "client": "volume", 
                "array": "block_storage_volumes"
                },
            "VolumeAttachment": {
                "method": self.volume_attachments, 
                "client": "compute", 
                "array": "volume_attachments"
                }
        }
        # Load Tenancy OCID
        self.getTenancy()
        # Set Single Compartment
        self.sub_compartments = False

    def connect(self):
        logger.info(f'<<< Connecting PCA Clients >>> {self.cert_bundle}')
        self.clients = {
            "volume": oci.core.BlockstorageClient(config=self.config, signer=self.signer),
            "compute": oci.core.ComputeClient(config=self.config, signer=self.signer),
            "object": oci.object_storage.ObjectStorageClient(config=self.config, signer=self.signer),
            "filestorage": oci.file_storage.FileStorageClient(config=self.config, signer=self.signer),
            "identity": oci.identity.IdentityClient(config=self.config, signer=self.signer),
            "dns": oci.dns.DnsClient(config=self.config, signer=self.signer),
            # "container": oci.container_engine.ContainerEngineClient(config=self.config, signer=self.signer),
            # "database": oci.database.DatabaseClient(config=self.config, signer=self.signer),
            # "limits":  oci.limits.LimitsClient(config=self.config, signer=self.signer),
            # "loadbalancer": oci.load_balancer.LoadBalancerClient(config=self.config, signer=self.signer),
            # "mysqlaas": oci.mysql.MysqlaasClient(config=self.config, signer=self.signer),
            # "mysqldb": oci.mysql.DbSystemClient(config=self.config, signer=self.signer),
            "network": oci.core.VirtualNetworkClient(config=self.config, signer=self.signer)
        }
        if self.cert_bundle is not None:
            for client in self.clients.values():
                client.base_client.session.verify = self.cert_bundle

    def executeQuery(self, regions=None, compartments=[], include_sub_compartments=False, **kwargs):
        logger.info(f'PCA Querying - Region: {regions}')
        logger.info(f'PCA Querying - Compartment: {compartments} {include_sub_compartments}')
        if self.instance_principal:
            self.config['tenancy'] = self.getTenancy()
        if regions is None:
            regions = [self.config['region']]
            logger.info(f'No Region Specified using - Region: {regions}')
        if "cert-bundle" in self.config:
            cert_bundle = self.config["cert-bundle"]
        else:
            cert_bundle = None
        logger.info(f'cert_bundle={cert_bundle}')
        self.sub_compartments = include_sub_compartments
        self.query_compartments = compartments
        self.top_level_compartments = compartments
        response_json = {}
        # Query Compartments
        logger.info(f'>>>>>>>> Querying Compartments')
        self.compartments()
        # Process Supporting Resources
        logger.info(f'>>>>>>>>>> Processing Ancillary Resources')
        for resource in self.ANCILLARY_RESOURCES:
            try:
                logger.info(f'>>>>>>>>>>>> Querying {resource}')
                self.resource_map[resource]["method"]()
            except Exception as e:
                logger.warn(e)
        # Query Resources
        logger.info(f'>>>>>>>>>> Processing Supported Resources')
        for resource in [r for r in self.SUPPORTED_RESOURCES if r != "Compartment"]:
            try:
                logger.info(f'>>>>>>>>>>>> Querying {resource}')
                queried_resources = self.resource_map[resource]["method"]()
                logger.info(f'>>>>>>>>>>>>>>>> Found {len(queried_resources)} {resource}')
            except Exception as e:
                logger.warn(e)
        # Remove Availability Domains
        self.dropdown_json.pop('availability_domains', None)
        # Filter
        filtered_resources = {}
        for k, v in self.dropdown_json.items():
            filtered_resources[k] = [r for r in self.dropdown_json[k] if  r.get('lifecycle_state', "AVAILABLE") in self.LIFECYCLE_STATES]
        self.dropdown_json = filtered_resources
        return self.dropdown_json
    
    # Ancillary Resources
    def availability_domains(self):
        resource_map = self.resource_map["AvailabilityDomain"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.ancillary_resources[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_availability_domains, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.ancillary_resources[array] = resources
        return self.ancillary_resources[array]

    def boot_volumes(self):
        resource_map = self.resource_map["BootVolume"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.ancillary_resources[array] = []
        for availability_domain in self.ancillary_resources.get('availability_domains', []):
            for compartment_id in self.query_compartments:
                results = oci.pagination.list_call_get_all_results(client.list_boot_volumes, compartment_id=compartment_id, availability_domain=availability_domain['name']).data
                # Convert to Json object
                resources = self.toJson(results)
                self.ancillary_resources[array].extend(resources)
        return self.ancillary_resources[array]

    def boot_volume_attachments(self):
        resource_map = self.resource_map["BootVolumeAttachment"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.ancillary_resources[array] = []
        for availability_domain in self.ancillary_resources.get('availability_domains', []):
            for compartment_id in self.query_compartments:
                results = oci.pagination.list_call_get_all_results(client.list_boot_volume_attachments, compartment_id=compartment_id, availability_domain=availability_domain['name']).data
                # Convert to Json object
                resources = self.toJson(results)
                self.ancillary_resources[array].extend(resources)
        return self.ancillary_resources[array]

    def exports(self):
        resource_map = self.resource_map["Export"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.ancillary_resources[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_exports, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.ancillary_resources[array].extend(resources)
        return self.ancillary_resources[array]

    def images(self):
        resource_map = self.resource_map["Image"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Images
        results = oci.pagination.list_call_get_all_results(client.list_images, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.ancillary_resources[array] = resources
        return self.ancillary_resources[array]

    def user_group_memberships(self):
        resource_map = self.resource_map["UserGroupMembership"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.ancillary_resources[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_user_group_memberships, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.ancillary_resources[array].extend(resources)
        return self.ancillary_resources[array]

    def vnic_attachments(self):
        resource_map = self.resource_map["VnicAttachment"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.ancillary_resources[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_vnic_attachments, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.ancillary_resources[array].extend(resources)
        return self.ancillary_resources[array]

    def volume_attachments(self):
        resource_map = self.resource_map["VolumeAttachment"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.ancillary_resources[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_volume_attachments, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.ancillary_resources[array].extend(resources)
        return self.ancillary_resources[array]

    # Supported Resources
    def tenancy_compartments(self):
        resource_map = self.resource_map["Compartment"]
        client = self.clients[resource_map["client"]]
        # All Compartments
        results = oci.pagination.list_call_get_all_results(client.list_compartments, compartment_id=self.tenancy_ocid, compartment_id_in_subtree=self.sub_compartments).data
        # Convert to Json object
        self.all_compartments = self.toJson(results)
        # Add Tenancy Root to list
        results = client.get_compartment(compartment_id=self.tenancy_ocid).data
        tenancy_root = self.toJson(results)
        self.all_compartments.append(tenancy_root)
        self.all_compartment_ids = [c['id'] for c in self.all_compartments]
        return 
    
    def child_compartments(self, compartments):
        query_compartment_ids = [id for id in compartments]
        for id in compartments:
            children = [c['id'] for c in self.all_compartments if c['compartment_id'] == id]
            query_compartment_ids.extend(self.child_compartments(children))
        return query_compartment_ids

    def compartments(self):
        resource_map = self.resource_map["Compartment"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        if self.sub_compartments:
            self.tenancy_compartments()
            query_compartment_ids = self.child_compartments(self.query_compartments)
            self.dropdown_json[array] = [c for c in self.all_compartments if c['id'] in query_compartment_ids]
            # Extend compartments to include Sub compartments
            self.query_compartments = query_compartment_ids
        else:
            for compartment_id in self.query_compartments:
                results = client.get_compartment(compartment_id=compartment_id).data
                # Convert to Json object
                resources = self.toJson(results)
                self.dropdown_json[array].append(resources)
        for compartment in self.dropdown_json[array]:
            if compartment['id'] in self.top_level_compartments:
                compartment['compartment_id'] = None
        return self.dropdown_json[array]

    def block_storage_volumes(self):
        resource_map = self.resource_map["Volume"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_volumes, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def dhcp_options(self):
        resource_map = self.resource_map["DHCPOptions"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_dhcp_options, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def dns_zones(self):
        resource_map = self.resource_map["CustomerDnsZone"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_zones, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def dynamic_routing_gateways(self):
        resource_map = self.resource_map["Drg"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_drgs, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def file_systems(self):
        resource_map = self.resource_map["FileSystem"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for availability_domain in self.ancillary_resources.get('availability_domains', []):
            for compartment_id in self.query_compartments:
                results = oci.pagination.list_call_get_all_results(client.list_file_systems, compartment_id=compartment_id, availability_domain=availability_domain['name']).data
                # Convert to Json object
                resources = self.toJson(results)
                self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def groups(self):
        resource_map = self.resource_map["Group"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_groups, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        # Add Users in Group
        for resource in self.dropdown_json[array]:
            results = oci.pagination.list_call_get_all_results(client.list_user_group_memberships, compartment_id=resource['compartment_id'], group_id=resource['id']).data
            # Convert to Json object
            user_group_memberships = self.toJson(results)
            # resource['user_ids'] = [u['id'] for u in self.ancillary_resources['user_group_memberships'] if u['group_id'] == resource['id']]
            resource['user_ids'] = [u['user_id'] for u in user_group_memberships if u['group_id'] == resource['id']]
        return self.dropdown_json[array]

    def instances(self):
        resource_map = self.resource_map["Instance"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_instances, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            # Filter on Lifecycle State
            resources = [r for r in resources if r['lifecycle_state'] in self.LIFECYCLE_STATES]
            # Get OS and Version
            self.dropdown_json[array].extend(resources)
        # Add Attachments and Additional Data
        for resource in self.dropdown_json[array]:
            # Add OS & Version
            image_id = resource.get('source_details', {}).get('image_id', '')
            resource['source_details']['os'] = ''
            resource['source_details']['version'] = ''
            if image_id != '':
                images = [r for r in self.ancillary_resources['images'] if r['id'] == image_id]
                if len(images) > 0:
                    image = images[0]
                    resource['source_details']['os'] = image['operating_system']
                    resource['source_details']['version'] = image['operating_system_version']
            # Decode Cloud Init Yaml
            if resource.get('metadata', None) is None:
                resource['metadata'] = {}
            user_data = resource.get('metadata', {}).get('user_data', '')
            if user_data != '':
                resource['metadata']['user_data'] = userDataDecode(user_data)
            # Add Vnic Attachments
            resource['vnics'] = sorted([va for va in self.ancillary_resources['vnic_attachments'] if va['instance_id'] == resource['id']], key=lambda k: k['nic_index'])
            # Add Volume Attachments
            resource['block_storage_volume'] = [va for va in self.ancillary_resources['volume_attachments'] if va['instance_id'] == resource['id']]
            # Add Boot Volume Details
            boot_volume_attachments = [r for r in self.ancillary_resources['boot_volume_attachments'] if r['id'] == resource['id']]
            if len(boot_volume_attachments) > 0:
                boot_volume_attachment = boot_volume_attachments[0]
                resource['is_pv_encryption_in_transit_enabled'] = boot_volume_attachment['is_pv_encryption_in_transit_enabled']
                boot_volumes = [r for r in self.ancillary_resources['boot_volumes'] if r['id'] == boot_volume_attachment['boot_volume_id']]
                if len(boot_volumes) > 0:
                    boot_volume = boot_volumes[0]
                    resource['boot_volume_size_in_gbs'] = boot_volume['size_in_gbs']
        return self.dropdown_json[array]
    
    def internet_gateways(self):
        resource_map = self.resource_map["InternetGateway"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_internet_gateways, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def local_peering_gateways(self):
        resource_map = self.resource_map["LocalPeeringGateway"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_local_peering_gateways, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def mount_targets(self):
        resource_map = self.resource_map["MountTarget"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for availability_domain in self.ancillary_resources.get('availability_domains', []):
            for compartment_id in self.query_compartments:
                results = oci.pagination.list_call_get_all_results(client.list_mount_targets, compartment_id=compartment_id, availability_domain=availability_domain['name']).data
                # Convert to Json object
                resources = self.toJson(results)
                for resource in resources:
                    resource["exports"] = []
                    for eid in [e["id"] for e in self.ancillary_resources["exports"] if e["export_set_id"] == resource["export_set_id"]]:
                        export = client.get_export(export_id=eid).data
                        resource["exports"].append(self.toJson(export))
                self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def nat_gateways(self):
        resource_map = self.resource_map["NatGateway"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_nat_gateways, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def network_security_groups(self):
        resource_map = self.resource_map["NetworkSecurityGroup"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_network_security_groups, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def object_storage_buckets(self):
        resource_map = self.resource_map["Bucket"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        namespace = str(client.get_namespace().data)
        # Required because previous call returns wrong information for PCA
        namespace = self.config.get('namespace', namespace)
        logger.debug(f'Namespace {namespace}')
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_buckets, namespace_name=namespace, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def policies(self):
        resource_map = self.resource_map["Policy"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_policies, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def route_tables(self):
        resource_map = self.resource_map["RouteTable"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_route_tables, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        # Post Process Map Rule Target Type
        rule_type_map = {'internetgateway': 'internet_gateway',
                         'natgateway':'nat_gateway',
                         'localpeeringgateway': 'local_peering_gateway',
                         'dynamicroutinggateway': 'dynamic_routing_gateway',
                         'drg': 'drg_attachment',
                        #  'drg': 'dynamic_routing_gateway',
                         'privateip':'private_ip',
                         'servicegateway': 'service_gateway',
                         'vcn': 'vcn'}
        for route_table in self.dropdown_json[array]:
            for rule in route_table.get('route_rules', []):
                if len(rule['network_entity_id']) > 0:
                    rule['target_type'] = rule_type_map[rule['network_entity_id'].split('.')[1]]
                else:
                    rule['target_type'] = ''
                if rule['target_type'] == 'service_gateway':
                    if rule['destination'].startswith('all-') and rule['destination'].endswith('services-network'):
                        rule['destination'] = 'all_services_destination'
                    else:
                        rule['destination'] = 'objectstorage_services_destination'
        return self.dropdown_json[array]

    def security_lists(self):
        resource_map = self.resource_map["SecurityList"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_security_lists, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def subnets(self):
        resource_map = self.resource_map["Subnet"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_subnets, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            for resource in resources:
                if resource['dns_label'] is None:
                    resource['dns_label'] = ''
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def users(self):
        resource_map = self.resource_map["User"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_users, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def virtual_cloud_networks(self):
        resource_map = self.resource_map["Vcn"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_vcns, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            for resource in resources:
                if resource['dns_label'] is None:
                    resource['dns_label'] = ''
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def deduplicate(self, resources, key):
        seen = []
        deduped = []
        for r in resources:
            if r[key] not in seen:
                deduped.append(r)
                seen.append(r[key])
        return deduped
