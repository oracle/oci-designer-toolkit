#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociResourceSearch"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import base64
import oci
import time

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIResourceSearchConnection

# Configure logging
logger = getLogger()


class OCIResourceSearchs(OCIResourceSearchConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.resource_searchs_json = []
        self.resource_searchs_obj = []
        super(OCIResourceSearchs, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        resource_searchs = oci.pagination.list_call_get_all_results(self.client.list_resource_types).data
        # Convert to Json object
        resource_searchs_json = self.toJson(resource_searchs)
        logJson(resource_searchs_json)

        # Add filter
        if filter is None:
            filter = {}

        # if 'lifecycle_state' not in filter:
        #     filter['lifecycle_state'] = ["PROVISIONING", "AVAILABLE", "UPDATING"]

        # Filter results
        self.resource_searchs_json = self.filterJsonObjectList(resource_searchs_json, filter)
        logger.debug(str(self.resource_searchs_json))

        # Build List of ResourceSearch Objects
        self.resource_searchs_obj = []
        for resource_search in self.resource_searchs_json:
            self.resource_searchs_obj.append(OCIResourceSearch(self.config, self.configfile, self.profile, resource_search))
        return self.resource_searchs_json


