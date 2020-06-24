#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociVolumeAttachments"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIComputeConnection

# Configure logging
logger = getLogger()


class OCIVolumeAttachments(OCIComputeConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, instance_id=None, volume_id=None):
        self.compartment_id = compartment_id
        self.instance_id = instance_id
        self.volume_id = volume_id
        self.volume_attachments_json = []
        self.volume_attachments_obj = []
        super(OCIVolumeAttachments, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, instance_id=None, volume_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id
        if instance_id is None:
            instance_id = self.instance_id
        if volume_id is None:
            volume_id = self.volume_id

        volume_attachments = oci.pagination.list_call_get_all_results(self.client.list_volume_attachments, compartment_id=compartment_id, instance_id=instance_id, volume_id=volume_id).data
        # Convert to Json object
        volume_attachments_json = self.toJson(volume_attachments)
        logger.debug(str(volume_attachments_json))

        # Filter results
        self.volume_attachments_json = self.filterJsonObjectList(volume_attachments_json, filter)
        logger.debug('--------------------- Volumes ----------------------')
        logger.debug(str(self.volume_attachments_json))

        # Build List of Volume Attachment Objects
        self.volume_attachments_obj = []
        for volume_attachment in self.volume_attachments_json:
            self.volume_attachments_obj.append(OCIVolumeAttachment(self.config, self.configfile, self.profile, volume_attachment))

        return self.volume_attachments_json


class OCIVolumeAttachment(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

