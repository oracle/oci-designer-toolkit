#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "OCIDropdownQuery"
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

class OCIDropdownQuery(OCIConnection):

    SUPPORTED_RESOURCES = [
        "Service", 
        "Shape", 
        "DataScienceNotebookSessionShape",
        "DbSystemShape", 
        "DbVersion", 
        "CpeDeviceShape", 
        "FastConnectProviderService", 
        "GiVersion",
        "Image",
        "ImageShapeCompatibility",
        "Instance",
        "InstanceAgentAvailablePlugin",
        "MySQLShape", 
        "MySQLVersion", 
        "MySQLConfiguration", 
        "NodePoolOptions",
        "PodShape",
        "LoadBalancerShape", 
        "ClusterOptions",
        "VolumeBackupPolicy"
    ]
    DISCOVER_OKIT_MAP = {
        "Service": "services", 
        "Shape": "shapes", 
        "DataScienceNotebookSessionShape": "data_science_notebook_session_shapes",
        "DbSystemShape": "db_system_shapes", 
        "DbVersion": "db_versions", 
        "CpeDeviceShape": "cpe_device_shapes", 
        "FastConnectProviderService": "fast_connect_provider_services", 
        "GiVersion": "gi_versions",
        "Image": "images",
        "InstanceAgentAvailablePlugin": "instance_agent_plugins",
        "MySQLShape": "mysql_shapes", 
        "MySQLVersion": "mysql_versions", 
        "MySQLConfiguration": "mysql_configurations", 
        "NodePoolOptions": "node_pool_options",
        "PodShape": "pod_shapes",
        "LoadBalancerShape": "loadbalancer_shapes", 
        "ClusterOptions": "kubernetes_versions",
        "VolumeBackupPolicy": "volume_backup_policy"
    }

    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIDropdownQuery, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        pass

    def executeQuery(self, regions=None, **kwargs):
        logger.info(f'OCI Querying Dropdowns - Region: {regions}')
        if self.instance_principal:
            self.config['tenancy'] = self.getTenancy()
        if regions is None:
            regions = [self.config['region']]
            logger.info(f'No Region Specified using - Region: {regions}')
        include_sub_compartments = True
        logger.info(f'Resources {self.SUPPORTED_RESOURCES}')
        discovery_client = OciResourceDiscoveryClient(self.config, signer=self.signer, cert_bundle=self.cert_bundle, regions=regions, include_resource_types=self.SUPPORTED_RESOURCES, compartments=[self.config['tenancy']], include_sub_compartments=include_sub_compartments)
        # Get Supported Resources
        # logger.debug(f'Discovery Response {discovery_client.get_all_resources()}')
        response = self.response_to_json(discovery_client.get_all_resources())
        logger.debug('Response JSON : {0!s:s}'.format(jsonToFormattedString(response)))
        response_json = self.convert(response)
        return response_json

    def response_to_json(self, data):
        # # simple hack to convert to json
        # return str(results).replace("'",'"')
        # more robust hack to convert to json
        json_str = re.sub("'([0-9a-zA-Z-\.]*)':", '"\g<1>":', str(data))
        json_str = re.sub("'([0-9a-zA-Z-_\.]*)': '([0-9a-zA-Z-_\.]*)'", '"\g<1>": "\g<2>"', json_str)
        #return json.dumps(json.loads(json_str), indent=2)
        return json.loads(json_str)

    def convert(self, discovery_data):
        response_json = {}
        map_keys = self.DISCOVER_OKIT_MAP.keys()
        for region, resources in discovery_data.items():
            logger.info("Processing Region : {0!s:s} {1!s:s}".format(region, resources.keys()))
            for resource_type, resource_list in resources.items():
                logger.info("Processing Resource : {0!s:s}".format(resource_type))
                # logger.info(jsonToFormattedString(resource_list))
                if resource_type in map_keys:
                    logger.info(f'Resource Type : {resource_type}')
                    if resource_type == "ClusterOptions":
                        resource_list = self.cluster_options(resource_list, resources)                       
                    elif resource_type == "DataScienceNotebookSessionShape":
                        resource_list = self.data_science_notebook_session_shapes(resource_list, resources)                       
                    elif resource_type == "DbSystemShape":
                        resource_list = self.db_system_shapes(resource_list, resources)                       
                    elif resource_type == "Image":
                        resource_list = self.images(resource_list, resources)
                    elif resource_type == "InstanceAgentAvailablePlugin":
                        resource_list = self.instance_agent_plugins(resource_list, resources)                       
                    elif resource_type == "LoadBalancerShape":
                        resource_list = self.load_balancer_shapes(resource_list, resources)                       
                    elif resource_type == "MySQLShape":
                        resource_list = self.mysql_shapes(resource_list, resources)                       
                    elif resource_type == "PodShape":
                        resource_list = self.pod_shapes(resource_list, resources)                       
                    # elif resource_type == "NodePoolOptions":
                    #     logger.info(jsonToFormattedString(resource_list))
                    elif resource_type == "Shape":
                        resource_list = self.shapes(resource_list, resources)
                        response_json["compute_shapes"] = resource_list                       
                        response_json["shapes_list"] = [r["shape"] for r in resource_list]                       
                    elif resource_type == "VolumeBackupPolicy":
                        resource_list = self.volume_backup_policies(resource_list, resources)                       
                    response_json[self.DISCOVER_OKIT_MAP[resource_type]] = resource_list
        return response_json

    def cluster_options(self, cluster_options, resources):
        return [{"id": kv, "display_name": kv, "name": kv, "version": kv} for kv in cluster_options[0]["kubernetes_versions"]]

    def data_science_notebook_session_shapes(self, session_shapes, resources):
        for shape in session_shapes:
            shape['id'] = shape['name']
            shape['display_name'] = shape['name']
        return session_shapes

    def db_system_shapes(self, db_system_shapes, resources):
        for shape in db_system_shapes:
            shape['id'] = shape['shape']
            shape['display_name'] = shape['name']
        return db_system_shapes

    def images(self, images, resources):
        # logger.info(f'Processing Images - Shape Compatibility: {resources.get("ImageShapeCompatibility", [])}')
        shapes = [s["shape"] for s in resources.get("ImageShapeCompatibility", [])]
        ids = [s["image_id"] for s in resources.get("ImageShapeCompatibility", [])]
        # logger.info(f'Processing Images - Compatibility Ids: {ids}')
        # logger.info(f'Processing Images - Shape: {shapes}')
        # logger.info(f'Processing Images - Shape: {sorted(shapes)}')
        for image in images:
            # logger.info(f'Image Id: {image["id"]} in/out {image["id"] in ids}')
            # logger.info(f'Image {image["display_name"]} Compartment {image["compartment_id"]}')
            image["shapes"] = [s["shape"] for s in resources.get("ImageShapeCompatibility", []) if s["image_id"] == image["id"]]
        return images
    
    def shapes(self, shapes, resources):
        seen = []
        deduplicated = []
        for shape in shapes:
            if shape['shape'] not in seen:
                shape['sort_key'] = shape['shape']
                shape['id'] = shape['shape']
                shape['display_name'] = shape['shape']
                if 'ocpus' in shape:
                    split_shape = shape['shape'].split('.')
                    shape['sort_key'] = "{0:s}-{1:s}-{2:03n}-{3:03n}".format(split_shape[0], split_shape[1], shape['ocpus'], shape['memory_in_gbs'])
                deduplicated.append(shape)
                seen.append(shape['shape'])
        # logger.info(sorted([s["shape"] for s in deduplicated]))
        return sorted(deduplicated, key=lambda k: k['sort_key'])

    def instance_agent_plugins(self, plugins, resources):
        # logger.info(f'Plugins {plugins}')
        # plugins = [p for p in plugins if p.get('status', '') in ['RUNNING', 'STOPPED']]
        # logger.info(f'Plug-ins {plugins}')
        return plugins

    def load_balancer_shapes(self, shapes, resources):
        for shape in shapes:
            shape['id'] = shape['name']
            shape['display_name'] = shape['name'].title()
        return shapes

    def mysql_shapes(self, shapes, resources):
        for shape in shapes:
            shape['id'] = shape['name']
            shape['display_name'] = shape['name'].title()
        return shapes

    def pod_shapes(self, shapes, resources):
        for shape in shapes:
            shape['id'] = shape['name']
            shape['display_name'] = shape['name']
        return shapes

    def volume_backup_policies(self, policies, resources):
        platform = ['Bronze', 'Silver', 'Gold']
        for policy in policies:
            policy['ocid'] = policy['id']
            policy['id'] = policy['display_name']
            if policy['compartment_id'] is None:
                # Platform
                policy['display_name'] = policy['display_name'].title()
                policy['sort_key'] = str(platform.index(policy['display_name']))
            else:
                policy['sort_key'] = policy['display_name']
        return sorted(policies, key=lambda k: k['sort_key'])
