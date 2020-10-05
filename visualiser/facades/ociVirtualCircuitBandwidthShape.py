#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociVirtualCircuitBandwidthShape"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()

class OCIVirtualCircuitBandwidthShapes(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, provider_service_id=None, **kwargs):
        self.provider_service_id = provider_service_id
        self.virtual_circuit_bandwidth_shapes_json = []
        self.virtual_circuit_bandwidth_shapes_obj = []
        super(OCIVirtualCircuitBandwidthShapes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, provider_service_id=None, filter=None):
        if provider_service_id is None:
            provider_service_id = self.provider_service_id

        # Add filter
        if filter is None:
            filter = {}

        virtual_circuit_bandwidth_shapes = oci.pagination.list_call_get_all_results(self.client.list_fast_connect_provider_virtual_circuit_bandwidth_shapes, provider_service_id=provider_service_id).data
        logger.debug('============================== VirtualCircuitBandwidthShapes Raw ==============================')
        logger.debug(str(virtual_circuit_bandwidth_shapes))
        # Convert to Json object
        virtual_circuit_bandwidth_shapes_json = self.toJson(virtual_circuit_bandwidth_shapes)
        logJson(virtual_circuit_bandwidth_shapes_json)
        # De-Duplicate
        #seen = []
        #deduplicated = []
        #for virtual_circuit_bandwidth_shape in virtual_circuit_bandwidth_shapes_json:
        #    if virtual_circuit_bandwidth_shape['virtual_circuit_bandwidth_shape'] not in seen:
        #        virtual_circuit_bandwidth_shape['sort_key'] = virtual_circuit_bandwidth_shape['virtual_circuit_bandwidth_shape']
        #        if 'ocpus' in virtual_circuit_bandwidth_shape:
        #            split_virtual_circuit_bandwidth_shape = virtual_circuit_bandwidth_shape['virtual_circuit_bandwidth_shape'].split('.')
        #            virtual_circuit_bandwidth_shape['sort_key'] = "{0:s}-{1:s}-{2:03n}-{3:03n}".format(split_virtual_circuit_bandwidth_shape[0], split_virtual_circuit_bandwidth_shape[1], virtual_circuit_bandwidth_shape['ocpus'], virtual_circuit_bandwidth_shape['memory_in_gbs'])
        #        deduplicated.append(virtual_circuit_bandwidth_shape)
        #        seen.append(virtual_circuit_bandwidth_shape['virtual_circuit_bandwidth_shape'])
        #logger.debug('============================== VirtualCircuitBandwidthShapes De-Duplicate ==============================')
        #logJson(deduplicated)
        #virtual_circuit_bandwidth_shapes_json = deduplicated

        # Filter results
        self.virtual_circuit_bandwidth_shapes_json = self.filterJsonObjectList(virtual_circuit_bandwidth_shapes_json, filter)
        logger.debug('============================== VirtualCircuitBandwidthShapes ==============================')
        logger.debug(str(self.virtual_circuit_bandwidth_shapes_json))

        return self.virtual_circuit_bandwidth_shapes_json



