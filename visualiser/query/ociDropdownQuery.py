#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociDropdownQuery"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import json
import oci
import re

from discovery import OciResourceDiscoveryClient

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
        "Region"
    ]
    DISCOVER_OKIT_MAP = {
        "Region": "regions"
    }
    VALID_LIFECYCLE_STATES = [
        "RUNNING",
        "STARTING",
        "STOPPING",
        "STOPPED",
        "AVAILABLE",
        "ACTIVE",
        "PROVISIONING",
        "UPDATING",
        "CREATING",
        "INACTIVE",
        "ALLOCATED"
    ]

    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIDropdownQuery, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        pass

    def executeQuery(self, regions, compartments, include_sub_compartments=False, **kwargs):
        logger.info('Request : {0!s:s}'.format(str(regions)))
        logger.info('Request : {0!s:s}'.format(str(compartments)))
        logger.info('Request : {0!s:s}'.format(str(self.config)))
        logger.info('Request : {0!s:s}'.format(str(include_sub_compartments)))
        if self.instance_principal:
            self.config['tenancy'] = self.getTenancy()
        discovery_client = OciResourceDiscoveryClient(self.config, self.signer, include_resource_types=self.SUPPORTED_RESOURCES)
        # Get Supported Resources
        response = self.response_to_json(discovery_client.get_all_resources())
        logger.debug(f"Response : {response}")
        logger.debug('Response JSON : {0!s:s}'.format(json.dumps(response, indent=2)))
        # Get All Compartment
        all_compartments = self.response_to_json(discovery_client.all_compartments)
        # Filter Compartments to those specifically queried
        queried_compartments = [c for c in all_compartments if c["id"] in compartments]
        if include_sub_compartments:
            for id in compartments:
                queried_compartments.extend([c for c in all_compartments if c["id"] in discovery_client.get_subcompartment_ids(id)])
        response_json = self.convert(response, queried_compartments)

        return response_json

    def response_to_json(self, data):
        # # simple hack to convert to json
        # return str(results).replace("'",'"')
        # more robust hack to convert to json
        json_str = re.sub("'([0-9a-zA-Z-\.]*)':", '"\g<1>":', str(data))
        json_str = re.sub("'([0-9a-zA-Z-_\.]*)': '([0-9a-zA-Z-_\.]*)'", '"\g<1>": "\g<2>"', json_str)
        #return json.dumps(json.loads(json_str), indent=2)
        return json.loads(json_str)

    def convert(self, discovery_data, compartments):
        response_json = {
            "compartments": compartments
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
                # logger.info(jsonToFormattedString(resource_list))
                if resource_type in map_keys:
                    if resource_type == "Drg":
                        resource_list = self.dynamic_routing_gateways(resource_list, resources)
                    elif resource_type == "FileSystem":
                        resource_list = self.file_storage_systems(resource_list, resources)
                    elif resource_type == "Instance":
                        resource_list = self.instances(resource_list, resources)
                    elif resource_type == "LoadBalancer":
                        resource_list = self.loadbalancers(resource_list, resources)
                    elif resource_type == "MySqlDbSystem":
                        resource_list = self.mysql_database_systems(resource_list, resources)
                    elif resource_type == "NetworkSecurityGroup":
                        resource_list = self.network_security_group(resource_list, resources)
                    elif resource_type == "Bucket":
                        resource_list = self.object_storage_buckets(resource_list, resources)
                    elif resource_type == "Cluster":
                        resource_list = self.oke_clusters(resource_list, resources)
                    elif resource_type == "RouteTable":
                        resource_list = self.route_tables(resource_list, resources)
                    elif resource_type == "ServiceGateway":
                        resource_list = self.service_gateways(resource_list, resources)
                    # Check Life Cycle State
                    response_json[self.DISCOVER_OKIT_MAP[resource_type]] = [r for r in resource_list if "lifecycle_state" not in r or r["lifecycle_state"] in self.VALID_LIFECYCLE_STATES]
                    #response_json[self.DISCOVER_OKIT_MAP[resource_type]] = resource_list
        return response_json

    def dynamic_routing_gateways(self, drgs, resources):
        for drg in drgs:
            attachments = [a for a in resources.get("DrgAttachment", []) if a["drg_id"] == drg["id"]]
            drg["vcn_id"] = attachments[0]["vcn_id"] if len(attachments) else ""
            drg["route_table_id"] = attachments[0]["route_table_id"] if len(attachments) else ""
        return drgs

    def file_storage_systems(self, file_storage_systems, resources):
        for fs in file_storage_systems:
            fs["exports"] = [e for e in resources.get("Export", []) if e["file_system_id"] == fs["id"]]
            export_set_ids = [e["export_set_id"] for e in fs["exports"]]
            export_sets = [e for e in resources.get("ExportSet", []) if e["id"] in export_set_ids]
            fs["mount_targets"] = [m for m in resources.get("MountTarget", []) if m["export_set_id"] in export_set_ids]
            for mt in fs["mount_targets"]:
                ess = [e for e in export_sets if e["id"] == mt["export_set_id"]]
                mt["export_set"] = ess[0] if len(ess) else {}
        return file_storage_systems

    def instances(self, instances, resources):
        # Exclude OKE Instances
        instances = [i for i in instances if 'oke-cluster-id' not in i['metadata']]
        for instance in instances:
            instance["source_details"]["os"] = ''
            instance["source_details"]["version"] = ''
            if ("source_details" in instance and "image_id" in instance["source_details"]):
                logger.debug(f'Image Id : {instance["source_details"]["image_id"]}')
                images = [i for i in resources.get("Image", []) if i["id"] == instance["source_details"]["image_id"]]
                for i in resources.get("Image", []):
                    logger.debug(f'Image Id - {i["id"]} - {i["id"] == instance["source_details"]["image_id"]}')
                if len(images):
                    instance["source_details"]["os"] = images[0]["operating_system"]
                    instance["source_details"]["version"] = images[0]["operating_system_version"]
            if "metadata" in instance and "user_data" in instance["metadata"]:
                instance["metadata"]["user_data"] = userDataDecode(instance["metadata"]["user_data"])
            # Add Attached Block Storage Volumes
            instance['block_storage_volume_ids'] = [va['volume_id'] for va in resources.get("VolumeAttachment", []) if va['instance_id'] == instance['id']]
            # Add Vnic Attachments
            attachments_vnic_ids = [va["vnic_id"] for va in resources.get("VnicAttachment", []) if va['instance_id'] == instance['id']]
            instance['vnics'] = [vnic for vnic in resources.get("Vnic", []) if vnic["id"] in attachments_vnic_ids]
            # Get Volume Attachments as a single call and loop through them to see if they are associated with the instance.
            boot_volume_attachments = [va for va in resources.get("BootVolumeAttachment", []) if va['instance_id'] == instance['id']]
            boot_volumes = [va for va in resources.get("BootVolume", []) if va['id'] == boot_volume_attachments[0]['boot_volume_id']] if len(boot_volume_attachments) else []
            instance['boot_volume_size_in_gbs'] = boot_volumes[0]['size_in_gbs'] if len(boot_volumes) else 0
            instance['is_pv_encryption_in_transit_enabled'] = boot_volume_attachments[0]['is_pv_encryption_in_transit_enabled'] if len(boot_volume_attachments) else False
        return instances

    def loadbalancers(self, loadbalancers, resources):
        for lb in loadbalancers:
            lb["instance_ids"] = []
            for backend_set, backends in lb["backend_sets"].items():
                for backend in backends["backends"]:
                    ip_addresses = [ip for ip in resources.get("PrivateIp", []) if ip["ip_address"] == backend["ip_address"]]
                    lb["instance_ids"].extend([va["instance_id"] for va in resources.get("VnicAttachment", []) if va['vnic_id'] == ip_addresses[0]['vnic_id']] if len(ip_addresses) else [])
        return loadbalancers

    def mysql_database_systems(self, database_systems, resources):
        for db_system in database_systems:
            # Trim version to just the number
            db_system["mysql_version"] = db_system["mysql_version"].split('-')[0]
        return database_systems

    def network_security_group(self, nsgs, resources):
        for nsg in nsgs:
            nsg["security_rules"] = [r for r in resources.get("NetworkSecurityGroupSecurityRule", []) if r["network_security_group_id"] == nsg["id"]]
        return nsgs

    def object_storage_buckets(self, buckets, resources):
        for bucket in buckets:
            bucket["display_name"] = bucket["name"]
        return buckets

    def oke_clusters(self, clusters, resources):
        for cluster in clusters:
            cluster["pools"] = [p for p in resources.get("NodePool", []) if p["cluster_id"] == cluster["id"]]
        return clusters

    def route_tables(self, route_tables, resources):
        rule_type_map = {'internetgateway': 'internet_gateways',
                         'natgateway':'nat_gateways',
                         'localpeeringgateway': 'local_peering_gateways',
                         'dynamicroutinggateway': 'dynamic_routing_gateways',
                         'drg': 'dynamic_routing_gateways',
                         'privateip':'private_ips',
                         'servicegateway': 'service_gateways'}
        for route_table in route_tables:
            for rule in route_table.get('route_rules', []):
                if len(rule['network_entity_id']) > 0:
                    rule['target_type'] = rule_type_map[rule['network_entity_id'].split('.')[1]]
                else:
                    rule['target_type'] = ''

        return route_tables

    def service_gateways(self, gateways, resources):
        for gateway in gateways:
            if gateway["route_table_id"] is None:
                gateway["route_table_id"] = ""
                for service in gateway['services']:
                    service_elements = service['service_name'].split()
                    del service_elements[1]
                    gateway['service_name'] = " ".join(service_elements)
                    # At the moment we only have 2 optiona All or OCI Object Storage hence we just need the first 3 characters
                    gateway['service_name'] = service_elements[0]
        return gateways

    def ip_to_instance(self, ip, resources):
        return
