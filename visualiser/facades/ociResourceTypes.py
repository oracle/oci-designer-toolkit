#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociResourceTypes"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import jsonToFormattedString
from facades.ociConnection import OCIResourceSearchConnection

# Configure logging
logger = getLogger()


class OCIResourceTypes(OCIResourceSearchConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        self.resource_type_json = []
        self.resource_types_json = []
        self.resource_types_obj = []
        super(OCIResourceTypes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, filter=None):
        if filter is None:
            filter = {}

        resource_types = oci.pagination.list_call_get_all_results(self.client.list_resource_types).data

        # Convert to Json object
        resource_types_json = self.toJson(resource_types)
        logger.debug(str(resource_types_json))

        # Filter results
        self.resource_types_json = self.filterJsonObjectList(resource_types_json, filter)
        logger.debug(jsonToFormattedString(self.resource_types_json))

        return self.resource_types_json

    def get(self, name):
        resource_type = self.client.get_resource_type(name=name).data
        # Convert to Json object
        self.resource_type_json = self.toJson(resource_type)
        logger.debug(jsonToFormattedString(self.resource_type_json))

        return self.resource_type_json
