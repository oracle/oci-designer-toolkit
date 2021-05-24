#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociDhcpOption"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCIDhcpOptions(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.dhcp_options_json = []
        super(OCIDhcpOptions, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        dhcp_options = oci.pagination.list_call_get_all_results(self.client.list_dhcp_options, compartment_id=compartment_id).data

        # Convert to Json object
        dhcp_options_json = self.toJson(dhcp_options)
        logger.debug(str(dhcp_options_json))

        # Filter results
        self.dhcp_options_json = self.filterJsonObjectList(dhcp_options_json, filter)
        logger.debug(str(self.dhcp_options_json))

        return self.dhcp_options_json
