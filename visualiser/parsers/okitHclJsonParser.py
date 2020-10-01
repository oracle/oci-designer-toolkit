#!/usr/bin/python

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "OkitHclJsonParser"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import json
from common.okitLogging import getLogger

# Configure logging
logger = getLogger()


class OkitHclJsonParser(object):
    tf_map = {
        "oci_database_autonomous_database": "autonomous_databases",
        "oci_core_volume":                  "block_storage_volumes",
        "oci_identity_compartment":         "compartments",
        "oci_database_db_system":           "database_systems",
        "oci_core_drg":                     "dynamic_routing_gateways",
        "oci_file_storage_file_system":     "file_storage_systems",
        "oci_core_instance":                "instances",
        "oci_core_internet_gateway":        "internet_gateways",
        "oci_load_balancer_load_balancer":  "load_balancers",
        "oci_core_local_peering_gateway":   "local_peering_gateways",
        "oci_core_nat_gateway":             "nat_gateways",
        "oci_core_network_security_group":  "network_security_groups",
        "oci_objectstorage_bucket":         "object_storage_buckets",
        "oci_core_route_table":             "route_tables",
        "oci_core_default_security_list":   "security_lists",
        "oci_core_security_list":           "security_lists",
        "oci_core_service_gateway":         "service_gateways",
        "oci_core_subnet":                  "subnets",
        "oci_core_vcn":                     "virtual_cloud_networks"
    }

    def __init__(self, hcl_json=None):
        self.hcl_json = hcl_json
        self.okit_json = self.initialiseOkitJson()
        if self.hcl_json is not None:
            self.parse()


    def initialiseOkitJson(self):
        okitjson = {
            "compartments": [
                {
                    "id": "var.compartment_id",
                    "name": "okit-root",
                    "compartment_id": None,
                    "parent_id": "canvas",
                    "display_name": "okit-root"
                }
            ],
            "autonomous_databases": [],
            "block_storage_volumes": [],
            "database_systems": [],
            "dynamic_routing_gateways": [],
            "fast_connects": [],
            "file_storage_systems": [],
            "instances": [],
            "instance_pools": [],
            "internet_gateways": [],
            "ipsec_connections": [],
            "load_balancers": [],
            "local_peering_gateways": [],
            "nat_gateways": [],
            "network_security_groups": [],
            "object_storage_buckets": [],
            "oke_clusters": [],
            "remote_peering_connections": [],
            "route_tables": [],
            "security_lists": [],
            "service_gateways": [],
            "subnets": [],
            "virtual_cloud_networks": [],
            "web_application_firewalls": []
        }
        return okitjson


    def processOddities(self, artefact):
        # Instance
        if "create_vnic_details" in artefact:
            artefact["vnics"] = artefact["create_vnic_details"]
            del artefact["create_vnic_details"]

        # Default Security List
        if "manage_default_resource_id" in artefact:
            id = artefact["manage_default_resource_id"].split(".")
            id[-1] = id[-1][-3:]
            artefact["vcn_id"] = ".".join(id)
            del artefact["manage_default_resource_id"]
        return artefact


    def processUnknown(self, resource_key, artefact_json):
        if resource_key == "oci_core_network_security_group_security_rule":
            # Process Security Group Rules
            logger.info("Looking For NSG - {0!s:s}".format(self.replaceReferenceSyntax(artefact_json["network_security_group_id"])))
            for nsg in self.okit_json["network_security_groups"]:
                if nsg["id"] == self.replaceReferenceSyntax(artefact_json["network_security_group_id"]):
                    del artefact_json["network_security_group_id"]
                    del artefact_json["id"]
                    if "security_rules" in nsg:
                        nsg["security_rules"].append(artefact_json)
                    else:
                        nsg["security_rules"] = [artefact_json]
                    break
        else:
            return False
        return True


    def postParse(self):
        for instance in self.okit_json["instances"]:
            if isinstance(instance["metadata"], list):
                instance["metadata"] = instance["metadata"][0]
            if isinstance(instance["source_details"], list):
                instance["source_details"] = instance["source_details"][0]


    def parse(self, hcl_json=None):
        if hcl_json is not None:
            self.hcl_json = hcl_json

        self.okit_json = self.initialiseOkitJson()
        result_json = {"okit_json": {}, "warnings": {}}

        if self.hcl_json is not None:
            # Loop through resources looking for simple matches
            logger.info("Processing Simple Mapped Resources")
            for resource in self.hcl_json["resource"]:
                for resource_key, resource_value in resource.items():
                    if resource_key in self.tf_map:
                        for artefact in resource_value:
                            for artefact_key, artefact_value in artefact.items():
                                for artefact_json in artefact_value:
                                    artefact_json["id"] = "{0!s:s}.{1!s:s}.id".format(resource_key, artefact_key)
                                    self.okit_json[self.tf_map[resource_key]].append(self.processOddities(artefact_json))
            # Loop through resources looking for complex matches
            logger.info("Processing Complex Unmapped Resources")
            for resource in self.hcl_json["resource"]:
                for resource_key, resource_value in resource.items():
                    if resource_key not in self.tf_map:
                        for artefact in resource_value:
                            for artefact_key, artefact_value in artefact.items():
                                for artefact_json in artefact_value:
                                    artefact_json["id"] = "{0!s:s}.{1!s:s}.id".format(resource_key, artefact_key)
                                    if not self.processUnknown(resource_key, artefact_json):
                                        logger.warn("Unknown Resource {0!s:s}".format(resource_key))
                                        result_json["warnings"][resource_key] = "Unknown Resource {0!s:s}".format(resource_key)
            self.postParse()
            result_json["okit_json"] = self.standardiseIds(self.okit_json)
            logger.info("Parsed Resources")
        return result_json


    def standardiseIds(self, json_data={}):
        if isinstance(json_data, dict):
            for key, val in json_data.items():
                logger.debug('{0!s:s} : {1!s:s}'.format(key, val))
                if isinstance(val, dict):
                    json_data[key] = self.standardiseIds(val)
                elif key == 'id' or key.endswith('_id') or key.endswith('_ids'):
                    if isinstance(val, list):
                        json_data[key] = [self.replaceReferenceSyntax(id) for id in val]
                    elif val is not None:
                        json_data[key] = self.replaceReferenceSyntax(val)
                elif isinstance(val, list):
                    json_data[key] = [self.standardiseIds(element) for element in val]
        elif isinstance(json_data, list):
            json_data = [self.standardiseIds(element) for element in json_data]
        return json_data


    def replaceReferenceSyntax(self, value):
        return value.replace('$', '').replace('{', '').replace('}', '').replace(' ', '')
