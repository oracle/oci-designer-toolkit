#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociVirtualCircuit"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCIVirtualCircuits(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.virtual_circuits_json = []
        super(OCIVirtualCircuits, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = ["PROVISIONING", "AVAILABLE"]

        virtual_circuits = oci.pagination.list_call_get_all_results(self.client.list_virtual_circuits, compartment_id=compartment_id).data
        # Convert to Json object
        virtual_circuits_json = self.toJson(virtual_circuits)
        logger.debug(str(virtual_circuits_json))

        # Filter results
        self.virtual_circuits_json = self.filterJsonObjectList(virtual_circuits_json, filter)
        logger.debug(str(self.virtual_circuits_json))

        return self.virtual_circuits_json
