#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociNetworkLoadBalancer"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCINetworkLoadBalancerConnection

# Configure logging
logger = getLogger()


class OCINetworkLoadBalancers(OCINetworkLoadBalancerConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.network_load_balancers_json = []
        super(OCINetworkLoadBalancers, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        network_load_balancers = oci.pagination.list_call_get_all_results(self.client.list_network_load_balancers, compartment_id=compartment_id).data

        # Convert to Json object
        network_load_balancers_json = self.toJson(network_load_balancers)
        logger.debug(str(network_load_balancers_json))

        # Filter results
        self.network_load_balancers_json = self.filterJsonObjectList(network_load_balancers_json, filter)
        logger.debug(str(self.network_load_balancers_json))

        return self.network_load_balancers_json
