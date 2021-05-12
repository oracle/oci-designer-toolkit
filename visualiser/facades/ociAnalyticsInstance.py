#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociAnalyticsInstance"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIAnalyticsInstanceConnection

# Configure logging
logger = getLogger()


class OCIAnalyticsInstances(OCIAnalyticsInstanceConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.analytics_instances_json = []
        super(OCIAnalyticsInstances, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        analytics_instances = oci.pagination.list_call_get_all_results(self.client.list_analytics_instances, compartment_id=compartment_id).data

        # Convert to Json object
        analytics_instances_json = self.toJson(analytics_instances)
        logger.debug(str(analytics_instances_json))

        # Filter results
        self.analytics_instances_json = self.filterJsonObjectList(analytics_instances_json, filter)
        logger.debug(str(self.analytics_instances_json))

        return self.analytics_instances_json
