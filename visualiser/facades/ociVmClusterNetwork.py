#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociVmClusterNetwork"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIDatabaseConnection

# Configure logging
logger = getLogger()


class OCIVmClusterNetworks(OCIDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, exadata_infrastructure_id=None):
        self.compartment_id = compartment_id
        self.exadata_infrastructure_id = exadata_infrastructure_id
        self.vm_cluster_networks_json = []
        super(OCIVmClusterNetworks, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        # if 'lifecycle_state' not in filter:
        #     filter['lifecycle_state'] =  ["CREATING", "REQUIRES_VALIDATION", "VALIDATING", "VALIDATED", "VALIDATION_FAILED", "UPDATING", "ALLOCATED", "FAILED"]

        vm_cluster_networks = oci.pagination.list_call_get_all_results(self.client.list_vm_cluster_networks, compartment_id=compartment_id, exadata_infrastructure_id=self.exadata_infrastructure_id).data

        # Convert to Json object
        vm_cluster_networks_json = self.toJson(vm_cluster_networks)
        logger.debug(str(vm_cluster_networks_json))
        # Retrieve Full data
        for vm_cluster_network in vm_cluster_networks_json:
            vm_cluster_network.update(self.get(vm_cluster_network["id"]))

        # Filter results
        self.vm_cluster_networks_json = self.filterJsonObjectList(vm_cluster_networks_json, filter)
        logger.debug(str(self.vm_cluster_networks_json))

        return self.vm_cluster_networks_json

    def get(self, id=None):
        vm_cluster_network = self.client.get_vm_cluster_network(exadata_infrastructure_id=self.exadata_infrastructure_id, vm_cluster_network_id=id).data
        logger.debug('============================== Vm Cluster Network Raw ==============================')
        logger.debug(str(vm_cluster_network))
        # Convert to Json object
        vm_cluster_network_json = self.toJson(vm_cluster_network)
        logJson(vm_cluster_network_json)
        return vm_cluster_network_json
