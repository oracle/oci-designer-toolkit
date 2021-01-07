#!/usr/bin/python

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitParser"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import json
from common.okitLogging import getLogger

# Configure logging
logger = getLogger()

class OkitParser(object):
    def __init__(self, source_json=None):
        self.source_json = source_json
        self.okit_json = self.initialiseOkitJson()
        if self.source_json is not None:
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

    def parse(self):
        pass
