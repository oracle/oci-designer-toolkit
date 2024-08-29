#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociDbNode"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIDatabaseConnection

# Configure logging
logger = getLogger()


class OCIDbNodes(OCIDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, vm_cluster_id=None):
        self.compartment_id = compartment_id
        self.vm_cluster_id = vm_cluster_id
        self.db_nodes_json = []
        super(OCIDbNodes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        # if 'lifecycle_state' not in filter:
        #     filter['lifecycle_state'] = ["PROVISIONING", "AVAILABLE", "UPDATING", "STOPPING", "STOPPED", "STARTING"]

        db_nodes = oci.pagination.list_call_get_all_results(self.client.list_db_nodes, compartment_id=compartment_id).data if self.vm_cluster_id is None else oci.pagination.list_call_get_all_results(self.client.list_db_nodes, compartment_id=compartment_id, vm_cluster_id=self.vm_cluster_id).data
        # db_nodes = oci.pagination.list_call_get_all_results(self.client.list_db_nodes, compartment_id=compartment_id).data
        # logger.debug(f'DB Nodes : {db_nodes}')

        # Convert to Json object
        db_nodes_json = self.toJson(db_nodes)
        logger.debug(str(db_nodes_json))
        for db_node in db_nodes_json:
            # db_node.update(self.get(db_node["id"]))
            # Trim version to just the number
            db_node["vm_cluster_id"] = self.vm_cluster_id

        # Filter results
        self.db_nodes_json = self.filterJsonObjectList(db_nodes_json, filter)
        logger.debug(str(self.db_nodes_json))

        return self.db_nodes_json
