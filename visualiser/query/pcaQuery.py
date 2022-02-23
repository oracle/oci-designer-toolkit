#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
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
from common.okitLogging import getLogger
from common.okitCommon import userDataDecode
from facades.ociConnection import OCIConnection

# Configure logging
logger = getLogger()

class PCAQuery(OCIConnection):

    SUPPORTED_RESOURCES = [
        "Compartment", # Must be first because we will use the resulting list to query other resources in the selected and potentially child compartments
        "AvailabilityDomain", 
        "Bucket", 
        "DHCPOptions", 
        "Drg", 
        "FileSystem", 
        # "Group", 
        "Instance", 
        "InternetGateway",
        "LocalPeeringGateway",
        "MountTarget",
        "NatGateway", 
        "NetworkSecurityGroup", 
        # "Policy", 
        "RouteTable", 
        "SecurityList", 
        "Subnet", 
        # "User", 
        "Vcn",
        "Volume"
    ]

    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(PCAQuery, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)
        self.dropdown_json = {}
        self.resource_map = {
            "AvailabilityDomain": {
                "method": self.availability_domains, 
                "client": "identity", 
                "array": "availability_domains"
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
            "FileSystem": {
                "method": self.file_systems, 
                "client": "filestorage", 
                "array": "file_systems"
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
            "Vcn": {
                "method": self.virtual_cloud_networks, 
                "client": "network", 
                "array": "virtual_cloud_networks"
                }, 
            "Volume": {
                "method": self.block_storage_volumes, 
                "client": "volume", 
                "array": "block_storage_volumes"
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
        response_json = {}
        for resource in self.SUPPORTED_RESOURCES:
            logger.info(f'>>>>>>>>>>>> Processing {resource}')
            self.resource_map[resource]["method"]()
        # Remove Availability Domains
        self.dropdown_json.pop('availability_domains', None)
        return self.dropdown_json
    
    def tenancy_compartments(self):
        resource_map = self.resource_map["Compartment"]
        client = self.clients[resource_map["client"]]
        # All Compartments
        results = oci.pagination.list_call_get_all_results(client.list_compartments, compartment_id=self.tenancy_ocid, compartment_id_in_subtree=self.sub_compartments).data
        # Convert to Json object
        self.all_compartments = self.toJson(results)
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
            self.query_compartments = query_compartment_ids
            self.dropdown_json[array] = [c for c in self.all_compartments if c['id'] in query_compartment_ids]
        else:
            for compartment_id in self.query_compartments:
                results = oci.pagination.list_call_get_all_results(client.list_compartments, compartment_id=compartment_id).data
                # Convert to Json object
                resources = self.toJson(results)
                self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def availability_domains(self):
        resource_map = self.resource_map["AvailabilityDomain"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_availability_domains, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
            self.dropdown_json[array] = resources
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
        for availability_domain in self.dropdown_json.get('availability_domains', []):
            for compartment_id in self.query_compartments:
                results = oci.pagination.list_call_get_all_results(client.list_file_systems, compartment_id=compartment_id, availability_domain=availability_domain['name']).data
                # Convert to Json object
                resources = self.toJson(results)
                self.dropdown_json[array].extend(resources)
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
            self.dropdown_json[array].extend(resources)
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
        for availability_domain in self.dropdown_json.get('availability_domains', []):
            for compartment_id in self.query_compartments:
                results = oci.pagination.list_call_get_all_results(client.list_mount_targets, compartment_id=compartment_id, availability_domain=availability_domain['name']).data
                # Convert to Json object
                resources = self.toJson(results)
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
            self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def object_storage_buckets(self):
        resource_map = self.resource_map["Bucket"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        namespace = str(client.get_namespace().data)
        for compartment_id in self.query_compartments:
            results = oci.pagination.list_call_get_all_results(client.list_buckets, namespace_name=namespace, compartment_id=compartment_id).data
            # Convert to Json object
            resources = self.toJson(results)
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
