#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociLocalPeeringGateway"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCILocalPeeringGateways(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, vcn_id=None):
        self.compartment_id = compartment_id
        self.vcn_id = vcn_id
        self.local_peering_gateways_json = []
        self.local_peering_gateways_obj = []
        super(OCILocalPeeringGateways, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        self.local_peering_gateways_json = []
        try:
            local_peering_gateways = oci.pagination.list_call_get_all_results(self.client.list_local_peering_gateways, compartment_id=compartment_id, vcn_id=self.vcn_id).data

            # Convert to Json object
            local_peering_gateways_json = self.toJson(local_peering_gateways)
            logger.debug(str(local_peering_gateways_json))

            # Filter results
            self.local_peering_gateways_json = self.filterJsonObjectList(local_peering_gateways_json, filter)
            logger.debug(str(self.local_peering_gateways_json))

            # Build List of LocalPeeringGateway Objects
            self.local_peering_gateways_obj = []
            for local_peering_gateway in self.local_peering_gateways_json:
                self.local_peering_gateways_obj.append(OCILocalPeeringGateway(self.config, self.configfile, self.profile, local_peering_gateway))
        except oci.exceptions.ServiceError as e:
            logger.error(e)
        finally:
            return self.local_peering_gateways_json


class OCILocalPeeringGateway(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

