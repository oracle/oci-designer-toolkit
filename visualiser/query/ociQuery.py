#!/usr/bin/python

# Copyright (c) 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociQuery"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import json
import oci
import re

from discovery import OciResourceDiscoveryClient

from common.okitCommon import logJson
from common.okitCommon import standardiseIds
from common.okitLogging import getLogger
from common.okitCommon import userDataDecode
from facades.ociConnection import OCIConnection

# Configure logging
logger = getLogger()

class OCIQuery(OCIConnection):

    SUPPORTED_RESOURCES = [
        "AnalyticsInstance",
        "AutonomousDatabase",
        "BootVolume",
        #"Cluster",
        "Cpe",
        "Database",
        "Drg",
        "DrgAttachment",
        "Image",
        "Instance",
        "InstancePool",
        "InternetGateway",
        "IPSecConnection",
        "IpSecConnectionTunnel",
        "LoadBalancer",
        "LocalPeeringGateway",
        "NatGateway",
        "NetworkSecurityGroup",
        "NetworkSecurityGroupSecurityRule",
        #"NodePool",
        "RemotePeeringConnection",
        "RouteTable",
        "SecurityList",
        "ServiceGateway",
        "Subnet",
        "Vcn",
        "Volume",
        "VolumeAttachment",
        "VnicAttachment"
    ]
    SUPPORTED_RESOURCES1 = ["Image"]
    DISCOVER_OKIT_MAP = {
        "AutonomousDatabase": "autonomous_databases",
        "Instance": "instances",
        "InternetGateway": "internet_gateways",
        "LoadBalancer": "load_balancers",
        "RouteTable": "route_tables",
        "SecurityList": "security_lists",
        "Subnet": "subnets",
        "Vcn": "virtual_cloud_networks"
    }

    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIQuery, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        pass

    def executeQuery(self, config_profile, regions, compartments, **kwargs):
        logger.info('Request : {0!s:s}'.format(str(config_profile)))
        logger.info('Request : {0!s:s}'.format(str(regions)))
        logger.info('Request : {0!s:s}'.format(str(compartments)))
        config = oci.config.from_file("~/.oci/config", profile_name=config_profile) # TODO use var for path
        discovery_client = OciResourceDiscoveryClient(config, regions=regions, include_resource_types=self.SUPPORTED_RESOURCES, compartments=compartments)
        response = discovery_client.get_all_resources()
        logger.info(f"Response : {response}")
        all_compartments = discovery_client.all_compartments
        logger.info('Response JSON : {0!s:s}'.format(json.dumps(self.response_to_json(response), indent=2)))

        response_json = self.convert(self.response_to_json(response), compartments, self.response_to_json(all_compartments))

        return response_json

    def response_to_json(self, data):
        # # simple hack to convert to json
        # return str(results).replace("'",'"')
        # more robust hack to convert to json
        json_str = re.sub("'([0-9a-zA-Z-\.]*)':", '"\g<1>":', str(data))
        json_str = re.sub("'([0-9a-zA-Z-_\.]*)': '([0-9a-zA-Z-_\.]*)'", '"\g<1>": "\g<2>"', json_str)
        #return json.dumps(json.loads(json_str), indent=2)
        return json.loads(json_str)

    def convert(self, discovery_data, compartments, all_compartments):
        response_json = {
            "compartments": [c for c in all_compartments if c["id"] in compartments]
        }
        compartment_ids = [c["id"] for c in response_json["compartments"]]
        # Set top level compartment parent to None
        for compartment in response_json["compartments"]:
            if compartment["compartment_id"] not in compartment_ids:
                compartment["compartment_id"] = None
        map_keys = self.DISCOVER_OKIT_MAP.keys()
        for region, resources in discovery_data.items():
            logger.info("Processing Region : {0!s:s} {1!s:s}".format(region, resources.keys()))
            for resource, list in resources.items():
                logger.info("Processing Resource : {0!s:s}".format(resource))
                if resource in map_keys:
                    if resource == "Instance":
                        list = self.instances(list, resources)
                    response_json[self.DISCOVER_OKIT_MAP[resource]] = list
        return response_json

    def instances(self, instances, resources):
        for instance in instances:
            if 'metadata' in instance and 'user_data' in instance['metadata']:
                instance["metadata"]["user_data"] = userDataDecode(instance['metadata']['user_data'])
        return instances
