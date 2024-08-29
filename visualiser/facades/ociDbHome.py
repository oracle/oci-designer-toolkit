#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociDbHome"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIDatabaseConnection

# Configure logging
logger = getLogger()


class OCIDbHomes(OCIDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, vm_cluster_id=None):
        self.compartment_id = compartment_id
        self.vm_cluster_id = vm_cluster_id
        self.db_homes_json = []
        super(OCIDbHomes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        # if 'lifecycle_state' not in filter:
        #     filter['lifecycle_state'] = 'AVAILABLE'

        db_homes = oci.pagination.list_call_get_all_results(self.client.list_db_homes, compartment_id=compartment_id).data if self.vm_cluster_id is None else oci.pagination.list_call_get_all_results(self.client.list_db_homes, compartment_id=compartment_id, vm_cluster_id=self.vm_cluster_id).data

        # Convert to Json object
        db_homes_json = self.toJson(db_homes)
        logger.debug(str(db_homes_json))

        # Filter results
        self.db_homes_json = self.filterJsonObjectList(db_homes_json, filter)
        logger.debug(str(self.db_homes_json))

        return self.db_homes_json
