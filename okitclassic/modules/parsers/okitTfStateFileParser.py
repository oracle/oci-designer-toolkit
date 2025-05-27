#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitTfStateFileParser"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import json
from warnings import catch_warnings
from common.okitLogging import getLogger
from common.okitCommon import jsonToFormattedString

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
        "oci_mysql_mysql_db_system":        "mysql_database_systems",
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

    tf_ref_map = {
        "oci_core_vnic_attachment":      "oci_core_vnic_attachment",
        "oci_file_storage_export":       "oci_file_storage_export",
        "oci_file_storage_export_set":   "oci_file_storage_export_set",
        "oci_file_storage_mount_target": "oci_file_storage_mount_target",
        "oci_load_balancer_backend":     "oci_load_balancer_backend",
        "oci_load_balancer_backend_set": "oci_load_balancer_backend_set",
        "oci_load_balancer_listener":    "oci_load_balancer_listener"
    }

    removes_keys = ["state", "time_created", "timeouts", "sensitive_attributes", "private", "dependencies"]

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
                    # "id": "var.compartment_id",
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
        known_map = self.tf_map.copy()
        known_map.update(self.tf_ref_map)

        if self.source_json is not None:
            managed_resources = [r for r in self.source_json["resources"] if r["mode"] == "managed"]
            for resource in managed_resources:
                okit_list = known_map.get(resource["type"], None)
                if okit_list is None:
                    result_json["warnings"][resource["type"]] = f'Unknown Resource Type {resource["type"]}'
                    logger.warn(result_json["warnings"][resource["type"]])
                else:
                    for instance in resource["instances"]:
                        okit_resource = instance["attributes"]
                        # Update for required 
                        okit_resource["resource_name"] = resource["name"]
                        self.okit_json["metadata"]["okit_model_id"] = okit_resource.get('freeform_tags',{}).get("okit_model_id", self.okit_json["metadata"]["okit_model_id"])
                        # Convert Defined Tags
                        defined_tags = {}
                        for k, v in okit_resource.get("defined_tags", {}).items():
                            nk = k.split('.')
                            if nk[0] not in defined_tags:
                                defined_tags[nk[0]] = {}
                            defined_tags[nk[0]][nk[1]] = v
                        okit_resource["defined_tags"] = defined_tags
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
            # for key, val in self.okit_json.items(): 
            #     if key in ["dhcp_options", "route_tables", "security_lists"]:
            #         for okit_resource in val:
            #             if "manage_default_resource_id" in okit_resource:
            #                 for dependency in okit_resource["dependencies"]:
            #                     parts = dependency.split(".")
            #                     if parts[0] == "oci_core_vcn":
            #                         vcn = [vcn for vcn in self.okit_json["virtual_cloud_networks"] if vcn["resource_name"] == parts[-1]]
            #                         if len(vcn) > 0:
            #                             okit_resource["vcn_id"] = vcn[0]["id"]
            #                             del okit_resource["manage_default_resource_id"]
            # Post Process Results
            for key, val in self.okit_json.items():
                try:
                    func = getattr(self, key)
                    func(val)
                except AttributeError as e:
                    # Ask for Forgiveness
                    logger.info(f"No post processing for {key}")
            # Remove Unwanted Keys
            for k, val in self.okit_json.items():
                if isinstance(val, list):
                    for okit_resource in val:
                        for key in self.removes_keys:
                            try:
                                del okit_resource[key]
                            except KeyError as e:
                                # Ignore
                                pass
            # Remove Reference Resources
            for key in self.tf_ref_map:
                try:
                    logger.info(f'Removing {key}')
                    self.okit_json.pop(key, None)
                except KeyError as e:
                    # Ignore
                    pass
            # Assign Response
            result_json["okit_json"] = self.okit_json
            logger.info("Parsed Resources")
    
        return result_json

    def dhcp_options(self, val, **kwargs):
        for okit_resource in val:
            if "manage_default_resource_id" in okit_resource:
                for dependency in okit_resource["dependencies"]:
                    parts = dependency.split(".")
                    if parts[0] == "oci_core_vcn":
                        vcn = [vcn for vcn in self.okit_json["virtual_cloud_networks"] if vcn["resource_name"] == parts[-1]]
                        if len(vcn) > 0:
                            okit_resource["vcn_id"] = vcn[0]["id"]
                            del okit_resource["manage_default_resource_id"]
        return
    
    def instances(self, val, **kwargs):
        for okit_resource in val:
            # Primary Vnic
            okit_resource["vnic_attachments"] = okit_resource.get("create_vnic_details", [])
            okit_resource.pop("create_vnic_details", None)
            # Secondary Vnics
            vnic_attachments = [va for va in self.okit_json.get("oci_core_vnic_attachment", []) if va["instance_id"] == okit_resource["id"]]
            for va in vnic_attachments:
                okit_resource["vnic_attachments"].extend(va.get("create_vnic_details", []))
        return

    def load_balancers(self, val, **kwargs):
        for okit_resource in val:
            okit_resource["backend_sets"] = [r for r in self.okit_json.get("oci_load_balancer_backend_set", []) if r["load_balancer_id"] == okit_resource["id"]]
            okit_resource["listeners"] = [r for r in self.okit_json.get("oci_load_balancer_listener", []) if r["load_balancer_id"] == okit_resource["id"]]
            backend_ips = [backend["ip_address"] for backend_set in okit_resource["backend_sets"] for backend in backend_set["backend"]]
            lb_backends = [r for r in self.okit_json.get("oci_load_balancer_backend", []) if r["load_balancer_id"] == okit_resource["id"]]
            logger.info(jsonToFormattedString(lb_backends))
            for backend_set in okit_resource["backend_sets"]:
                backend_set["backends"] = [dict(backend) for backend in lb_backends if backend["backendset_name"] == backend_set["name"]]
                del backend_set["backend"]
                for backend in backend_set["backends"]:
                    del backend["backendset_name"]
                    del backend["load_balancer_id"]
                    del backend["id"]
                del backend_set["load_balancer_id"]
                del backend_set["id"]
            for listener in okit_resource["listeners"]:
                del listener["load_balancer_id"]
                del listener["id"]
            okit_resource["shape_details"] = okit_resource["shape_details"][0] if len(okit_resource["shape_details"]) > 0 else {}

    def route_tables(self, val, **kwargs):
        for okit_resource in val:
            if "manage_default_resource_id" in okit_resource:
                for dependency in okit_resource["dependencies"]:
                    parts = dependency.split(".")
                    if parts[0] == "oci_core_vcn":
                        vcn = [vcn for vcn in self.okit_json["virtual_cloud_networks"] if vcn["resource_name"] == parts[-1]]
                        if len(vcn) > 0:
                            okit_resource["vcn_id"] = vcn[0]["id"]
                            del okit_resource["manage_default_resource_id"]
        return

    def security_lists(self, val, **kwargs):
        for okit_resource in val:
            if "manage_default_resource_id" in okit_resource:
                for dependency in okit_resource["dependencies"]:
                    parts = dependency.split(".")
                    if parts[0] == "oci_core_vcn":
                        vcn = [vcn for vcn in self.okit_json["virtual_cloud_networks"] if vcn["resource_name"] == parts[-1]]
                        if len(vcn) > 0:
                            okit_resource["vcn_id"] = vcn[0]["id"]
                            del okit_resource["manage_default_resource_id"]
        return
