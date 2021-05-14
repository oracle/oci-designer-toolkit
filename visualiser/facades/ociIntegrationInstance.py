#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociIntegrationInstance"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIIntegrationInstanceConnection

# Configure logging
logger = getLogger()


class OCIIntegrationInstances(OCIIntegrationInstanceConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.integration_instances_json = []
        super(OCIIntegrationInstances, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        integration_instances = oci.pagination.list_call_get_all_results(self.client.list_integration_instances, compartment_id=compartment_id).data

        # Convert to Json object
        integration_instances_json = self.toJson(integration_instances)
        logger.debug(str(integration_instances_json))

        # Filter results
        self.integration_instances_json = self.filterJsonObjectList(integration_instances_json, filter)
        logger.debug(str(self.integration_instances_json))

        return self.integration_instances_json
