#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociInternetGateway"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCIInternetGateways(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, vcn_id=None):
        self.compartment_id = compartment_id
        self.vcn_id = vcn_id
        self.internet_gateways_json = []
        self.internet_gateways_obj = []
        super(OCIInternetGateways, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        if self.vcn_id is not None:
            internet_gateways = oci.pagination.list_call_get_all_results(self.client.list_internet_gateways, compartment_id=compartment_id, vcn_id=self.vcn_id).data

            # Convert to Json object
            internet_gateways_json = self.toJson(internet_gateways)
            logger.debug(str(internet_gateways_json))

            # Filter results
            self.internet_gateways_json = self.filterJsonObjectList(internet_gateways_json, filter)
            logger.debug(str(self.internet_gateways_json))

            # Build List of InternetGateway Objects
            self.internet_gateways_obj = []
            for internet_gateway in self.internet_gateways_json:
                self.internet_gateways_obj.append(OCIInternetGateway(self.config, self.configfile, self.profile, internet_gateway))
        else:
            logger.warn('Virtual Cloud Network Id has not been specified.')

        return self.internet_gateways_json


class OCIInternetGateway(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

