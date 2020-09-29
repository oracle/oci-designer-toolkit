#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociRemotePeeringConnection"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCIRemotePeeringConnections(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.remote_peering_connections_json = []
        super(OCIRemotePeeringConnections, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = ["PROVISIONING", "AVAILABLE"]

        remote_peering_connections = oci.pagination.list_call_get_all_results(self.client.list_remote_peering_connections, compartment_id=compartment_id).data
        # Convert to Json object
        remote_peering_connections_json = self.toJson(remote_peering_connections)
        logger.debug(str(remote_peering_connections_json))

        # Filter results
        self.remote_peering_connections_json = self.filterJsonObjectList(remote_peering_connections_json, filter)
        logger.debug(str(self.remote_peering_connections_json))

        return self.remote_peering_connections_json

