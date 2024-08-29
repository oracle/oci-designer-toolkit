#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociDrgAttachment"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIDrgAttachmentConnection

# Configure logging
logger = getLogger()


class OCIDrgAttachments(OCIDrgAttachmentConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.drg_attachments_json = []
        super(OCIDrgAttachments, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        drg_attachments = oci.pagination.list_call_get_all_results(self.client.list_drg_attachments, compartment_id=compartment_id).data

        # Convert to Json object
        drg_attachments_json = self.toJson(drg_attachments)
        logger.debug(str(drg_attachments_json))

        # Filter results
        self.drg_attachments_json = self.filterJsonObjectList(drg_attachments_json, filter)
        logger.debug(str(self.drg_attachments_json))

        return self.drg_attachments_json
