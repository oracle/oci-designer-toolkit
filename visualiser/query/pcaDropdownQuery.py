#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "PCADropdownQuery"
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
from facades.ociShape import OCIShapes

# Configure logging
logger = getLogger()

class PCADropdownQuery(OCIConnection):

    SUPPORTED_RESOURCES = [
        # "Service", 
        "Shape", 
        # "DbSystemShape", 
        # "DbVersion", 
        # "CpeDeviceShape", 
        # "FastConnectProviderService", 
        "Image",
        # "ImageShapeCompatibility",
        # "Instance",
        # "MySQLShape", 
        # "MySQLVersion", 
        # "MySQLConfiguration", 
        # "LoadBalancerShape", 
        # "ClusterOptions"
    ]

    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(PCADropdownQuery, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)
        self.dropdown_json = {}
        self.clients = {
            "compute": oci.core.ComputeClient(config=self.config, signer=self.signer),
            # "container": oci.container_engine.ContainerEngineClient(config=self.config, signer=self.signer),
            # "database": oci.database.DatabaseClient(config=self.config, signer=self.signer),
            # "limits":  oci.limits.LimitsClient(config=self.config, signer=self.signer),
            # "loadbalancer": oci.load_balancer.LoadBalancerClient(config=self.config, signer=self.signer),
            # "mysqlaas": oci.mysql.MysqlaasClient(config=self.config, signer=self.signer),
            # "mysqldb": oci.mysql.DbSystemClient(config=self.config, signer=self.signer),
            "network": oci.core.VirtualNetworkClient(config=self.config, signer=self.signer)
        }
        if 'cert-bundle' in self.config:
            for client in self.clients.values():
                client.base_client.session.verify = self.config['cert-bundle']
        self.resource_map = {
            "Service": {
                "method": self.services, 
                "client": "limits", 
                "array": "services"
                }, 
            "Shape": {
                "method": self.shapes, 
                "client": "compute", 
                "array": "shapes"
                }, 
            "DbSystemShape": {
                "method": self.db_system_shapes, 
                "client": "database", 
                "array": "db_system_shapes"
                }, 
            "DbVersion": {
                "method": self.db_versions, 
                "client": "database", 
                "array": "db_versions"
                }, 
            "CpeDeviceShape": {
                "method": self.cpe_device_shapes, 
                "client": "network", 
                "array": "cpe_device_shapes"
                }, 
            "FastConnectProviderService": {
                "method": self.fast_connect_provider_services, 
                "client": "network", 
                "array": "fast_connect_provider_services"
                }, 
            "Image": {
                "method": self.images, 
                "client": "compute", 
                "array": "images"
                },
            "MySQLShape": {
                "method": self.mysql_shapes, 
                "client": "mysqlaas", 
                "array": "mysql_shapes"
                }, 
            "MySQLVersion": {
                "method": self.mysql_versions, 
                "client": "mysqlaas", "array": 
                "mysql_versions"
                }, 
            "MySQLConfiguration": {
                "method": self.mysql_configurations, 
                "client": "mysqlaas", 
                "array": "mysql_configurations"
                }, 
            "LoadBalancerShape": {
                "method": self.loadbalancer_shapes, 
                "client": "loadbalancer", 
                "array": "loadbalancer_shapes"
                }, 
            "ClusterOptions": {
                "method": self.kubernetes_versions, 
                "client": "container", 
                "array": "kubernetes_versions"
                }
        }
        # Load Tenancy OCID
        self.getTenancy()

    def connect(self):
        pass

    def executeQuery(self, regions=None, **kwargs):
        logger.info(f'Querying Dropdowns - Region: {regions} {self}')
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
        include_sub_compartments = True
        response_json = {}
        for resource in self.SUPPORTED_RESOURCES:
            self.resource_map[resource]["method"]()
        return self.dropdown_json

    def cpe_device_shapes(self):
        resource_map = self.resource_map["CpeDeviceShape"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # CPE Shapes
        results = oci.pagination.list_call_get_all_results(client.list_cpe_device_shapes).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        return self.dropdown_json[array]

    def db_system_shapes(self):
        resource_map = self.resource_map["DbSystemShape"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        results = oci.pagination.list_call_get_all_results(client.list_db_system_shapes, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = sorted(self.deduplicate(resources, 'shape'), key=lambda k: k['shape'])
        return self.dropdown_json[array]

    def db_versions(self):
        resource_map = self.resource_map["DbVersion"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        results = oci.pagination.list_call_get_all_results(client.list_db_versions, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        return self.dropdown_json[array]

    def fast_connect_provider_services(self):
        resource_map = self.resource_map["FastConnectProviderService"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        return resources

    def images(self):
        resource_map = self.resource_map["Image"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Images
        results = oci.pagination.list_call_get_all_results(client.list_images, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        for r in resources:
            r['sort_key'] = f"{r['operating_system']} {r['operating_system_version']}"
        self.dropdown_json[array] = sorted(self.deduplicate(resources, 'sort_key'), key=lambda k: k['sort_key'])
        for r in self.dropdown_json[array]:
            r['shapes'] = [s.shape for s in oci.pagination.list_call_get_all_results(client.list_image_shape_compatibility_entries, image_id=r['id']).data]
        return self.dropdown_json[array]

    def kubernetes_versions(self):
        resource_map = self.resource_map["ClusterOptions"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        results = client.get_cluster_options('all').data.kubernetes_versions
        # Convert to Json object
        resources = [{"name": v, "version": v} for v in results]
        self.dropdown_json[array] = resources
        return self.dropdown_json[array]

    def loadbalancer_shapes(self):
        resource_map = self.resource_map["LoadBalancerShape"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Query
        results = oci.pagination.list_call_get_all_results(client.list_shapes, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        return self.dropdown_json[array]

    def mysql_shapes(self):
        resource_map = self.resource_map["MySQLShape"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Query
        results = oci.pagination.list_call_get_all_results(client.list_shapes, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        return self.dropdown_json[array]

    def mysql_versions(self):
        resource_map = self.resource_map["MySQLVersion"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Query
        results = oci.pagination.list_call_get_all_results(client.list_versions, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        return self.dropdown_json[array]

    def mysql_configurations(self):
        resource_map = self.resource_map["MySQLConfiguration"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Query
        results = oci.pagination.list_call_get_all_results(client.list_configurations, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        return self.dropdown_json[array]

    def services(self):
        resource_map = self.resource_map["Service"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Query
        results = oci.pagination.list_call_get_all_results(client.list_services, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = sorted(resources, key=lambda k: k['name'])
        for r in self.dropdown_json[array]:
            r['display_name'] = r['name']
        return self.dropdown_json[array]

    def shapes(self):
        resource_map = self.resource_map["Shape"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Instance Shapes
        results = oci.pagination.list_call_get_all_results(client.list_shapes, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = sorted(self.deduplicate(resources, 'shape'), key=lambda k: k['shape'])
        return self.dropdown_json[array]
    
    def deduplicate(self, resources, key):
        seen = []
        deduped = []
        for r in resources:
            if r[key] not in seen:
                deduped.append(r)
                seen.append(r[key])
        return deduped
