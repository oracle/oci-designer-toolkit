#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
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
        "DbSystemShape", 
        "DbVersion", 
        "CpeDeviceShape", 
        "FastConnectProviderService", 
        "Image",
        "ImageShapeCompatibility",
        "MySQLShape", 
        "MySQLVersion", 
        "MySQLConfiguration", 
        "LoadBalancerShape", 
        "ClusterOptions"
    ]
    DISCOVER_OKIT_MAP = {
        "Service": "services", 
        "Shape": "shapes", 
        "DbSystemShape": "db_system_shapes", 
        "DbVersion": "db_versions", 
        "CpeDeviceShape": "cpe_device_shapes", 
        "FastConnectProviderService": "fast_connect_provider_services", 
        "Image": "images",
        "MySQLShape": "mysql_shapes", 
        "MySQLVersion": "mysql_versions", 
        "MySQLConfiguration": "mysql_configurations", 
        "LoadBalancerShape": "loadbalancer_shapes", 
        "ClusterOptions": "kubernetes_versions"
    }

    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIDropdownQuery, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        pass

    def executeQuery(self, regions=None, **kwargs):
        logger.info('Querying Dropdowns')
        if self.instance_principal:
            self.config['tenancy'] = self.getTenancy()
        if regions is None:
            regions = [self.config['region']]
        discovery_client = OciResourceDiscoveryClient(self.config, self.signer, regions=regions, include_resource_types=self.SUPPORTED_RESOURCES, compartments=[self.config['tenancy']])
        # Get Supported Resources
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
                    if resource_type == "Image":
                        resource_list = self.images(resource_list, resources)
                    elif resource_type == "Shape":
                        resource_list = self.shapes(resource_list, resources)                       
                    response_json[self.DISCOVER_OKIT_MAP[resource_type]] = resource_list
        return response_json

    def images(self, images, resources):
        # logger.info(f'Processing Images - Shape Compatibility: {resources.get("ImageShapeCompatibility", [])}')
        shapes = [s["shape"] for s in resources.get("ImageShapeCompatibility", [])]
        ids = [s["image_id"] for s in resources.get("ImageShapeCompatibility", [])]
        # logger.info(f'Processing Images - Compatibility Ids: {ids}')
        # logger.info(f'Processing Images - Shape: {shapes}')
        # logger.info(f'Processing Images - Shape: {sorted(shapes)}')
        for image in images:
            # logger.info(f'Image Id: {image["id"]} in/out {image["id"] in ids}')
            image["shapes"] = [s["shape"] for s in resources.get("ImageShapeCompatibility", []) if s["image_id"] == image["id"]]
        return images
    
    def shapes(self, shapes, resources):
        seen = []
        deduplicated = []
        for shape in shapes:
            if shape['shape'] not in seen:
                shape['sort_key'] = shape['shape']
                if 'ocpus' in shape:
                    split_shape = shape['shape'].split('.')
                    shape['sort_key'] = "{0:s}-{1:s}-{2:03n}-{3:03n}".format(split_shape[0], split_shape[1], shape['ocpus'], shape['memory_in_gbs'])
                deduplicated.append(shape)
                seen.append(shape['shape'])
        return sorted(deduplicated, key=lambda k: k['sort_key'])
