#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociVmCluster"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIDatabaseConnection

# Configure logging
logger = getLogger()


class OCIVmClusters(OCIDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, exadata_infrastructure_id=None):
        self.compartment_id = compartment_id
        self.exadata_infrastructure_id = exadata_infrastructure_id
        self.vm_clusters_json = []
        super(OCIVmClusters, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        # if 'lifecycle_state' not in filter:
        #    filter['lifecycle_state'] = ["PROVISIONING", "AVAILABLE", "UPDATING", "FAILED", "MAINTENANCE_IN_PROGRESS"]

        # vm_clusters = oci.pagination.list_call_get_all_results(self.client.list_vm_clusters, compartment_id=compartment_id, exadata_infrastructure_id=self.exadata_infrastructure_id).data
        vm_clusters = oci.pagination.list_call_get_all_results(self.client.list_vm_clusters, compartment_id=compartment_id).data
        logger.debug(f'>>>> VM Clusters: {vm_clusters}')

        # Convert to Json object
        vm_clusters_json = self.toJson(vm_clusters)
        logger.debug(str(vm_clusters_json))

        # Filter results
        self.vm_clusters_json = self.filterJsonObjectList(vm_clusters_json, filter)
        logger.debug(str(self.vm_clusters_json))

        return self.vm_clusters_json
