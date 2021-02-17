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
        "Backend",
        "BackendSet",
        "BootVolume",
        "BootVolumeAttachment",
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
        "PrivateIp",
        "PublicIp",
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
            for resource_type, resource_list in resources.items():
                logger.info("Processing Resource : {0!s:s}".format(resource_type))
                if resource_type in map_keys:
                    if resource_type == "Instance":
                        resource_list = self.instances(resource_list, resources)
                    elif resource_type == "LoadBalancer":
                        resource_list = self.loadbalancers(resource_list, resources)
                    response_json[self.DISCOVER_OKIT_MAP[resource_type]] = resource_list
        return response_json

    def instances(self, instances, resources):
        # Exclude OKE Instances
        instances = [i for i in instances if 'oke-cluster-id' not in i['metadata']]
        for instance in instances:
            instance["source_details"]["os"] = ''
            instance["source_details"]["version"] = ''
            if ("source_details" in instance and "image_id" in instance["source_details"]):
                images = [i for i in resources["Image"] if i["id"] == instance["source_details"]["image_id"]]
                if len(images):
                    instance["source_details"]["os"] = images[0]["operating_system"]
                    instance["source_details"]["version"] = images[0]["operating_system_version"]
            if "metadata" in instance and "user_data" in instance["metadata"]:
                instance["metadata"]["user_data"] = userDataDecode(instance["metadata"]["user_data"])
            # Add Attached Block Storage Volumes
            instance['block_storage_volume_ids'] = [va['volume_id'] for va in resources["VolumeAttachment"] if va['instance_id'] == instance['id']] if "VolumeAttachment" in resources else []
            # Add Vnic Attachments
            instance['vnics'] = [va for va in resources["VnicAttachment"] if va['instance_id'] == instance['id']]
            # Get Volume Attachments as a single call and loop through them to see if they are associated with the instance.
            boot_volume_attachments = [va for va in resources["BootVolumeAttachment"] if va['instance_id'] == instance['id']]
            boot_volumes = [va for va in resources["BootVolume"] if va['id'] == boot_volume_attachments[0]['boot_volume_id']] if len(boot_volume_attachments) else []
            instance['boot_volume_size_in_gbs'] = boot_volumes[0]['size_in_gbs'] if len(boot_volumes) else 0
            instance['is_pv_encryption_in_transit_enabled'] = boot_volume_attachments[0]['is_pv_encryption_in_transit_enabled'] if len(boot_volume_attachments) else False
        return instances

    def loadbalancers(self, loadbalancers, resources):
        for lb in loadbalancers:
            lb["instance_ids"] = []
            for backend_set, backends in lb["backend_sets"].items():
                for backend in backends["backends"]:
                    ip_addresses = [ip for ip in resources["PrivateIp"] if ip["ip_address"] == backend["ip_address"]]
                    lb["instance_ids"].extend([va["instance_id"] for va in resources["VnicAttachment"] if va['vnic_id'] == ip_addresses[0]['vnic_id']] if len(ip_addresses) else [])
        return loadbalancers

    def ip_to_instance(self, ip, resources):
        return
