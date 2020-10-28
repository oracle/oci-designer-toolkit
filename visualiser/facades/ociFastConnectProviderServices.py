#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociFastConnectProviderService"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection
from facades.ociVirtualCircuitBandwidthShape import OCIVirtualCircuitBandwidthShapes

# Configure logging
logger = getLogger()


class OCIFastConnectProviderServices(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.fast_connect_provider_services_json = []
        super(OCIFastConnectProviderServices, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.getTenancy()

        fast_connect_provider_services = oci.pagination.list_call_get_all_results(self.client.list_fast_connect_provider_services, compartment_id=compartment_id).data
        # Convert to Json object
        fast_connect_provider_services_json = self.toJson(fast_connect_provider_services)
        logger.debug(str(fast_connect_provider_services_json))

        # Filter results
        self.fast_connect_provider_services_json = self.filterJsonObjectList(fast_connect_provider_services_json, filter)
        logger.debug(str(self.fast_connect_provider_services_json))

        # Fast Connect Virtual Service Bandwidth Shapes
        virtual_circuit_bandwidth_shape = OCIVirtualCircuitBandwidthShapes()
        for fast_connect_provider_service in self.fast_connect_provider_services_json:
            fast_connect_provider_service["virtual_circuit_bandwidth_shape"] = sorted(virtual_circuit_bandwidth_shape.list(fast_connect_provider_service['id']), key=lambda k: k['bandwidth_in_mbps'])

        return self.fast_connect_provider_services_json
