#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociPolicy"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIPolicyConnection

# Configure logging
logger = getLogger()


class OCIPolicys(OCIPolicyConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.policys_json = []
        super(OCIPolicys, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        policys = oci.pagination.list_call_get_all_results(self.client.list_policys, compartment_id=compartment_id).data

        # Convert to Json object
        policys_json = self.toJson(policys)
        logger.debug(str(policys_json))

        # Filter results
        self.policys_json = self.filterJsonObjectList(policys_json, filter)
        logger.debug(str(self.policys_json))

        return self.policys_json
