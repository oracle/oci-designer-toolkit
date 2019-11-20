#!/usr/bin/python
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__ekitversion__ = "@VERSION@"
__ekitrelease__ = "@RELEASE@"
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "ociInternetGateway"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.ociLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCIDynamicRoutingGateways(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.dynamic_routing_gateways_json = []
        self.dynamic_routing_gateways_obj = []
        super(OCIDynamicRoutingGateways, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        dynamic_routing_gateways = oci.pagination.list_call_get_all_results(self.client.list_drgs, compartment_id=compartment_id).data

        # Convert to Json object
        dynamic_routing_gateways_json = self.toJson(dynamic_routing_gateways)
        logger.debug(str(dynamic_routing_gateways_json))

        # Filter results
        self.dynamic_routing_gateways_json = self.filterJsonObjectList(dynamic_routing_gateways_json, filter)
        logger.debug(str(self.dynamic_routing_gateways_json))

        # Build List of DynamicRoutingGateway Objects
        self.dynamic_routing_gateways_obj = []
        for dynamic_routing_gateway in self.dynamic_routing_gateways_json:
            self.dynamic_routing_gateways_obj.append(OCIDynamicRoutingGateway(self.config, self.configfile, dynamic_routing_gateway))
        return self.dynamic_routing_gateways_json


class OCIDynamicRoutingGateway(object):
    def __init__(self, config=None, configfile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.data = data

