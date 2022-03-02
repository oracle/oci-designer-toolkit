#!/usr/bin/python

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitTfStateFileParser"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import json
from common.okitLogging import getLogger

# Configure logging
logger = getLogger()

class OkitTfStateFileParser(object):
    tf_map = {
        "oci_database_autonomous_database": "autonomous_databases",
        "oci_core_volume":                  "block_storage_volumes",
        "oci_identity_compartment":         "compartments",
        "oci_database_db_system":           "database_systems",
        "oci_core_default_dhcp_options":    "dhcp_options",
        "oci_core_dhcp_options":            "dhcp_options",
        "oci_core_drg":                     "dynamic_routing_gateways",
        "oci_file_storage_file_system":     "file_storage_systems",
        "oci_core_instance":                "instances",
        "oci_core_internet_gateway":        "internet_gateways",
        "oci_load_balancer_load_balancer":  "load_balancers",
        "oci_core_local_peering_gateway":   "local_peering_gateways",
        "oci_core_nat_gateway":             "nat_gateways",
        "oci_core_network_security_group":  "network_security_groups",
        "oci_objectstorage_bucket":         "object_storage_buckets",
        "oci_core_default_route_table":     "route_tables",
        "oci_core_route_table":             "route_tables",
        "oci_core_default_security_list":   "security_lists",
        "oci_core_security_list":           "security_lists",
        "oci_core_service_gateway":         "service_gateways",
        "oci_core_subnet":                  "subnets",
        "oci_core_vcn":                     "virtual_cloud_networks"
    }

    def __init__(self, source_json=None):
        self.source_json = source_json
        self.okit_json = self.initialiseOkitJson()
        if self.source_json is not None:
            self.parse()

    def initialiseOkitJson(self):
        okitjson = {
            "metadata": {
                "okit_model_id": None
            },
            "compartments": [
                {
                    "id": "var.compartment_id",
                    "name": "okit-root",
                    "compartment_id": None,
                    "parent_id": "canvas",
                    "display_name": "okit-root"
                }
            ]
        }
        return okitjson

    def parse(self, source_json=None):
        if source_json is not None:
            self.source_json = source_json
        
        self.okit_json = self.initialiseOkitJson()
        result_json = {"okit_json": {}, "warnings": {}}

        if self.source_json is not None:
            managed_resources = [r for r in self.source_json["resources"] if r["mode"] == "managed"]
            for resource in managed_resources:
                okit_list = self.tf_map.get(resource["type"], None)
                if okit_list is None:
                    result_json["warnings"][resource["type"]] = f'Unknown Resource Type {resource["type"]}'
                    logger.warn(result_json["warnings"][resource["type"]])
                else:
                    for instance in resource["instances"]:
                        okit_resource = instance["attributes"]
                        # Update for required 
                        okit_resource["resource_name"] = resource["name"]
                        self.okit_json["metadata"]["okit_model_id"] = okit_resource.get('freeform_tags',{}).get("okit_model_id", self.okit_json["metadata"]["okit_model_id"])
                        okit_reference = okit_resource.get('freeform_tags',{}).get("okit_reference", None)
                        if "manage_default_resource_id" in okit_resource:
                            # okit_resource["vcn_id"] = okit_resource["manage_default_resource_id"]
                            okit_resource["default"] = True
                            okit_resource["dependencies"] = instance["dependencies"]
                            # del okit_resource["manage_default_resource_id"]
                        if okit_reference is not None:
                            okit_resource["okit_reference"] = okit_reference
                        # Add to list
                        if okit_list not in self.okit_json:
                            self.okit_json[okit_list] = [okit_resource]
                        else:
                            self.okit_json[okit_list].append(okit_resource)
            # Post Process to resolve Defaults
            for key, val in self.okit_json.items(): 
                if key in ["dhcp_options", "route_tables", "security_lists"]:
                    for okit_resource in val:
                        if "manage_default_resource_id" in okit_resource:
                            for dependency in okit_resource["dependencies"]:
                                parts = dependency.split(".")
                                if parts[0] == "oci_core_vcn":
                                    vcn = [vcn for vcn in self.okit_json["virtual_cloud_networks"] if vcn["resource_name"] == parts[-1]]
                                    if len(vcn) > 0:
                                        okit_resource["vcn_id"] = vcn[0]["id"]
                                        del okit_resource["manage_default_resource_id"]
            result_json["okit_json"] = self.okit_json
            logger.info("Parsed Resources")

        return result_json
