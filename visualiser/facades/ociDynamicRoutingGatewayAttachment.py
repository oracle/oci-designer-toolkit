#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociDynamicRoutingGatewayAttachment"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCIDynamicRoutingGatewayAttachments(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.dynamic_routing_gateway_attachments_json = []
        self.dynamic_routing_gateway_attachments_obj = []
        super(OCIDynamicRoutingGatewayAttachments, self).__init__(config=config, configfile=configfile, profile=profile)

    def get(self, drg_attachment_id=None):
        try:
            drg_attachment = self.client.get_drg_attachment(drg_attachment_id=drg_attachment_id).data
            logger.debug(str(drg_attachment))
            # Convert to Json object
            drg_attachment_json = self.toJson(drg_attachment)
            logJson(drg_attachment_json)
            return drg_attachment_json
        except oci.exceptions.ServiceError as e:
            logger.exception(e)
            return {}

    def list(self, compartment_id=None, drg_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'ATTACHED'

        if drg_id is not None:
            dynamic_routing_gateway_attachments = oci.pagination.list_call_get_all_results(self.client.list_drg_attachments, compartment_id=compartment_id, drg_id=drg_id).data
        else:
            dynamic_routing_gateway_attachments = oci.pagination.list_call_get_all_results(self.client.list_drg_attachments, compartment_id=compartment_id).data

        # Convert to Json object
        dynamic_routing_gateway_attachments_json = self.toJson(dynamic_routing_gateway_attachments)
        logger.debug(str(dynamic_routing_gateway_attachments_json))

        # Filter results
        self.dynamic_routing_gateway_attachments_json = self.filterJsonObjectList(dynamic_routing_gateway_attachments_json, filter)
        logger.debug(str(self.dynamic_routing_gateway_attachments_json))

        return self.dynamic_routing_gateway_attachments_json


class OCIDynamicRoutingGatewayAttachment(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

