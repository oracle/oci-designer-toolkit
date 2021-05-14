#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociDataIntegrationWorkspace"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIDataIntegrationWorkspaceConnection

# Configure logging
logger = getLogger()


class OCIDataIntegrationWorkspaces(OCIDataIntegrationWorkspaceConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.data_integration_workspaces_json = []
        super(OCIDataIntegrationWorkspaces, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        data_integration_workspaces = oci.pagination.list_call_get_all_results(self.client.list_data_integration_workspaces, compartment_id=compartment_id).data

        # Convert to Json object
        data_integration_workspaces_json = self.toJson(data_integration_workspaces)
        logger.debug(str(data_integration_workspaces_json))

        # Filter results
        self.data_integration_workspaces_json = self.filterJsonObjectList(data_integration_workspaces_json, filter)
        logger.debug(str(self.data_integration_workspaces_json))

        return self.data_integration_workspaces_json
