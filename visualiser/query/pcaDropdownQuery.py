#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
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
        "VolumeBackupPolicy",
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
        self.resource_map = {
            "Compartment": {
                "method": self.compartments, 
                "client": "identity", 
                "array": "compartments"
                }, 
            "VolumeBackupPolicy": {
                "method": self.volume_backup_policy, 
                "client": "volume", 
                "array": "volume_backup_policy"
                }, 
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
        logger.info(f'<<< PCADropdownQuery Connecting PCA Clients >>> ')
        self.clients = {
            "volume": oci.core.BlockstorageClient(config=self.config, signer=self.signer),
            "compute": oci.core.ComputeClient(config=self.config, signer=self.signer),
            # "container": oci.container_engine.ContainerEngineClient(config=self.config, signer=self.signer),
            # "database": oci.database.DatabaseClient(config=self.config, signer=self.signer),
            "identity": oci.identity.IdentityClient(config=self.config, signer=self.signer),
            # "limits":  oci.limits.LimitsClient(config=self.config, signer=self.signer),
            # "loadbalancer": oci.load_balancer.LoadBalancerClient(config=self.config, signer=self.signer),
            # "mysqlaas": oci.mysql.MysqlaasClient(config=self.config, signer=self.signer),
            # "mysqldb": oci.mysql.DbSystemClient(config=self.config, signer=self.signer),
            "network": oci.core.VirtualNetworkClient(config=self.config, signer=self.signer)
        }
        if self.cert_bundle is not None:
            for client in self.clients.values():
                client.base_client.session.verify = self.cert_bundle

    def executeQuery(self, regions=None, **kwargs):
        logger.info(f'PCADropdownQuery PCA Querying Dropdowns - Region: {regions} {self}')
        if self.instance_principal:
            self.config['tenancy'] = self.getTenancy()
        if regions is None:
            regions = [self.config['region']]
            logger.info(f'No Region Specified using - Region: {regions}')
        if "cert-bundle" in self.config:
            cert_bundle = self.config["cert-bundle"]
        else:
            cert_bundle = None
        include_sub_compartments = True
        response_json = {}
        # Get All Compartments
        self.tenancy_compartments()
        # Process Dropdown Resources
        for resource in self.SUPPORTED_RESOURCES:
            self.resource_map[resource]["method"]()

        return self.dropdown_json

    def tenancy_compartments(self):
        logger.info(f'>> PCADropdownQuery - Getting Tenancy Compartments')
        resource_map = self.resource_map["Compartment"]
        client = self.clients[resource_map["client"]]
        # Get Tenancy
        tenancy = client.get_tenancy(tenancy_id=self.tenancy_ocid).data
        self.all_compartments = [self.toJson(tenancy)]
        # All Sub Compartments
        results = oci.pagination.list_call_get_all_results(client.list_compartments, compartment_id=self.tenancy_ocid, compartment_id_in_subtree=True).data
        # Convert to Json object
        # self.all_compartments = self.toJson(results)
        self.all_compartments.extend(self.toJson(results))
        self.all_compartment_ids = [c['id'] for c in self.all_compartments]
        logger.info(f'>> PCADropdownQuery - Getting Tenancy Compartments')
        logger.info(f'>>>>                - Found {len(self.all_compartment_ids)} Tenancy Compartments')
        return 
    
    def compartments(self):
        return
    
    def cpe_device_shapes(self):
        logger.info(f'>>>> PCADropdownQuery - Getting CPE Device Shapes')
        resource_map = self.resource_map["CpeDeviceShape"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # CPE Shapes
        results = oci.pagination.list_call_get_all_results(client.list_cpe_device_shapes).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])} CPE Device Shapes')
        return self.dropdown_json[array]

    def db_system_shapes(self):
        logger.info(f'>>>> PCADropdownQuery - Getting DB System Shapes')
        resource_map = self.resource_map["DbSystemShape"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        results = oci.pagination.list_call_get_all_results(client.list_db_system_shapes, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = sorted(self.deduplicate(resources, 'shape'), key=lambda k: k['shape'])
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])} DB System Shapes')
        return self.dropdown_json[array]

    def db_versions(self):
        logger.info(f'>>>> PCADropdownQuery - Getting DB Versions')
        resource_map = self.resource_map["DbVersion"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        results = oci.pagination.list_call_get_all_results(client.list_db_versions, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])} DB Versions')
        return self.dropdown_json[array]

    def fast_connect_provider_services(self):
        resource_map = self.resource_map["FastConnectProviderService"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])}')
        return resources

    def images(self):
        logger.info(f'>>>> PCADropdownQuery - Getting Images')
        resource_map = self.resource_map["Image"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        # results = oci.pagination.list_call_get_all_results(client.list_images, compartment_id=self.tenancy_ocid).data
        cnt = 0
        for compartment_id in self.all_compartment_ids:
            cnt += 1
            logger.info(f'>>>>>>>> PCADropdownQuery - {cnt} Getting Images in {compartment_id}')
            # Images
            results = oci.pagination.list_call_get_all_results(client.list_images, compartment_id=compartment_id).data
            # results = oci.pagination.list_call_get_all_results(client.list_images, compartment_id=self.tenancy_ocid).data
            # Convert to Json object
            resources = self.toJson(results)
            for r in resources:
                r['sort_key'] = f"{r['operating_system']} {r['operating_system_version']} {r['display_name']}"
            deduplicated  = sorted(self.deduplicate(resources, 'sort_key'), key=lambda k: k['sort_key'])
            not_found = False
            for r in deduplicated:
                if not_found:
                    r['shapes'] = self.dropdown_json['shapes']
                else:
                    try:
                        logger.info('>> Reading Shape Data For Image')
                        r['shapes'] = [s.shape for s in oci.pagination.list_call_get_all_results(client.list_image_shape_compatibility_entries, image_id=r['id']).data]
                    except oci.exceptions.ServiceError as e:
                        not_found = True
                        r['shapes'] = self.dropdown_json['shapes']
            self.dropdown_json[array].extend([r for r in deduplicated if r['lifecycle_state'] in self.LIFECYCLE_STATES])
        logger.info(f'>>>>>>                - Found {len(deduplicated)} Images')
        return self.dropdown_json[array]

    def kubernetes_versions(self):
        logger.info(f'>>>> PCADropdownQuery - Getting K8 Versions')
        resource_map = self.resource_map["ClusterOptions"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        results = client.get_cluster_options('all').data.kubernetes_versions
        # Convert to Json object
        resources = [{"name": v, "version": v} for v in results]
        self.dropdown_json[array] = resources
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])} K8 Versions')
        return self.dropdown_json[array]

    def loadbalancer_shapes(self):
        logger.info(f'>>>> PCADropdownQuery - Getting Loadbalancer Shapes')
        resource_map = self.resource_map["LoadBalancerShape"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Query
        results = oci.pagination.list_call_get_all_results(client.list_shapes, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])} Loadbalancer Shapes')
        return self.dropdown_json[array]

    def mysql_shapes(self):
        logger.info(f'>>>> PCADropdownQuery - Getting MySQL Shapes')
        resource_map = self.resource_map["MySQLShape"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Query
        results = oci.pagination.list_call_get_all_results(client.list_shapes, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])} MySQL Shapes')
        return self.dropdown_json[array]

    def mysql_versions(self):
        logger.info(f'>>>> PCADropdownQuery - Getting MySQL Versions')
        resource_map = self.resource_map["MySQLVersion"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Query
        results = oci.pagination.list_call_get_all_results(client.list_versions, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])} MySQL Versions')
        return self.dropdown_json[array]

    def mysql_configurations(self):
        logger.info(f'>>>> PCADropdownQuery - Getting MySQL Configurations')
        resource_map = self.resource_map["MySQLConfiguration"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Query
        results = oci.pagination.list_call_get_all_results(client.list_configurations, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = resources
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])} MySQL Configurations')
        return self.dropdown_json[array]

    def services(self):
        logger.info(f'>>>> PCADropdownQuery - Getting Services')
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
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])} Services')
        return self.dropdown_json[array]

    def shapes(self):
        logger.info(f'>>>> PCADropdownQuery - Getting Compute Shapes')
        resource_map = self.resource_map["Shape"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Query
        results = oci.pagination.list_call_get_all_results(client.list_shapes, compartment_id=self.tenancy_ocid).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array] = sorted(self.deduplicate(resources, 'shape'), key=lambda k: k['shape'])
        for resource in self.dropdown_json[array]:
            resource['display_name'] = resource['shape']
            resource['sort_key'] = resource['shape']
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])} Compute Shapes')
        return self.dropdown_json[array]
    
    def volume_backup_policy(self):
        logger.info(f'>>>> PCADropdownQuery - Getting Volume Backup Policies')
        resource_map = self.resource_map["VolumeBackupPolicy"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        # Query (Oracle)
        results = oci.pagination.list_call_get_all_results(client.list_volume_backup_policies).data
        # Convert to Json object
        resources = self.toJson(results)
        # Query (Custom)
        results = oci.pagination.list_call_get_all_results(client.list_volume_backup_policies, compartment_id=self.tenancy_ocid).data
        # Extend
        resources.extend(self.toJson(results))
        platform = ['Bronze', 'Silver', 'Gold']
        for policy in resources:
            policy['ocid'] = policy['id']
            policy['id'] = policy['display_name']
            if policy['compartment_id'] is None:
                # Platform
                policy['display_name'] = policy['display_name'].title()
                policy['sort_key'] = str(platform.index(policy['display_name']))
            else:
                policy['sort_key'] = policy['display_name']
        self.dropdown_json[array] = sorted(resources, key=lambda k: k['sort_key'])
        logger.info(f'>>>>>>                - Found {len(self.dropdown_json[array])} Volume Backup Policies')
        return self.dropdown_json[array]
    
    def deduplicate(self, resources, key):
        seen = []
        deduped = []
        for r in resources:
            if r[key] not in seen:
                deduped.append(r)
                seen.append(r[key])
        return deduped
