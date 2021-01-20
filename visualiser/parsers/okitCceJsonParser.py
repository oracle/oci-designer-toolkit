#!/usr/bin/python

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitCCEJsonParser"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import json
import uuid
from common.okitLogging import getLogger
from parsers.okitParser import OkitParser

# Configure logging
logger = getLogger()

class OkitCceJsonParser(OkitParser):
    ROOT_COMPARTMENT_ID = "cce-root-comp"
    NETWORK_SERVICE = "Network"
    COMPUTE_SERVICE = "Compute"
    STORAGE_SERVICE = "Storage"
    LOADBALANCER_SERVICE = "Load Balancer"

    def __init__(self, cce_json=None):
        super(OkitCceJsonParser, self).__init__(cce_json)

    def parse(self, source_json):
        if source_json is not None:
            self.source_json = source_json

        self.okit_json = self.initialiseOkitJson()
        result_json = {"okit_json": {}, "warnings": {}}

        if self.source_json is not None:
            self.okit_json["title"] = self.source_json["label"]
            # Set Root Compartment Id
            self.okit_json["compartments"][0]["id"] = self.ROOT_COMPARTMENT_ID
            for config in self.source_json["configs"]:
                self.parseConfig(config)

            result_json["okit_json"] = self.okit_json

        return result_json

    def parseConfig(self, config):
        compartment = {
            "compartment_id": self.ROOT_COMPARTMENT_ID,
            "id": self.generateId("comp"),
            "display_name": "cce-comp-{0!s:s}".format(config["presetID"]),
            "description": config["label"]
        }
        self.okit_json["compartments"].append(compartment)
        # Process Networks
        for network in [s for s in config["services"] if s["label"] == self.NETWORK_SERVICE]:
            self.parseNetwork(network, compartment["id"])
        # Process Compute
        for compute in [s for s in config["services"] if s["label"] == self.COMPUTE_SERVICE]:
            self.parseCompute(compute, compartment["id"])
        # Process Storage
        for storage in [s for s in config["services"] if s["label"] == self.STORAGE_SERVICE]:
            self.parseStorage(storage, compartment["id"])
        # Process Load Balancers
        for loadbalancer in [s for s in config["services"] if s["label"] == self.LOADBALANCER_SERVICE]:
            self.parseLoadBalancer(loadbalancer, compartment["id"])
        return

    def parseNetwork(self, network, compartment_id):
        # Create VCN / Subnet for each network item
        for item in network["items"]:
            vcn = {
                "compartment_id": compartment_id,
                "id": self.generateId("vcn"),
                "display_name": "cce-vcn-{0!s:s}-{1!s:s}".format(network["id"], item["sku"]),
                "sku": item["sku"]
            }
            self.okit_json["virtual_cloud_networks"].append(vcn)
            subnet = {
                "compartment_id": compartment_id,
                "vcn_id": vcn["id"],
                "id": self.generateId("subnet"),
                "display_name": "cce-subnet-{0!s:s}-{1!s:s}".format(network["id"], item["sku"]),
                "sku": item["sku"]
            }
            self.okit_json["subnets"].append(subnet)
        return

    def parseCompute(self, compute, compartment_id):
        # Create Instance for each compute item
        for item in compute["items"]:
            instance = {
                "compartment_id": compartment_id,
                "id": self.generateId("instance"),
                "display_name": "cce-vcn-{0!s:s}-{1!s:s}".format(compute["id"], item["sku"]),
                "sku": item["sku"]
            }
            self.okit_json["instances"].append(instance)
        return

    def parseStorage(self, storage, compartment_id):
        # Create Block Volume for each storage item
        for item in storage["items"]:
            blockvolume = {
                "compartment_id": compartment_id,
                "id": self.generateId("blockstoragevolume"),
                "display_name": "cce-block-storage-{0!s:s}-{1!s:s}".format(storage["id"], item["sku"]),
                "sku": item["sku"]
            }
            self.okit_json["block_storage_volumes"].append(blockvolume)
        return

    def parseLoadBalancer(self, loadbalancer, compartment_id):
        # Create Load Balancer for each loadbalancer item
        for item in loadbalancer["items"]:
            loadbalancer = {
                "compartment_id": compartment_id,
                "id": self.generateId("loadbalancer"),
                "display_name": "cce-loadbalancer-{0!s:s}-{1!s:s}".format(loadbalancer["id"], item["sku"]),
                "sku": item["sku"]
            }
            self.okit_json["load_balancers"].append(loadbalancer)
            # Add to first subnet of first vcn for this compartment
            vcn_id = [vcn for vcn in self.okit_json["virtual_cloud_networks"] if vcn["compartment_id"] == compartment_id][0]["id"]
            subnet_id = [subnet for subnet in self.okit_json["subnets"] if subnet["vcn_id"] == vcn_id][0]["id"]
            loadbalancer["subnet_ids"] = [subnet_id]
        return

    def generateId(self, type):
        return "okit-{0!s:s}-{1!s:s}".format(type, str(uuid.uuid4()))
