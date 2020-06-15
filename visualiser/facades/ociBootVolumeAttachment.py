#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociBootVolumeAttachments"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIComputeConnection
from facades.ociBootVolumes import OCIBootVolumes

# Configure logging
logger = getLogger()


class OCIBootVolumeAttachments(OCIComputeConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, availability_domain=None, instance_id=None, boot_volume_id=None):
        self.compartment_id = compartment_id
        self.availability_domain = availability_domain
        self.instance_id = instance_id
        self.boot_volume_id = boot_volume_id
        self.boot_volume_attachments_json = []
        self.boot_volume_attachments_obj = []
        super(OCIBootVolumeAttachments, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, availability_domain=None, instance_id=None, boot_volume_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id
        if availability_domain is None:
            availability_domain = self.availability_domain
        if instance_id is None:
            instance_id = self.instance_id
        if boot_volume_id is None:
            boot_volume_id = self.boot_volume_id

        boot_volume_attachments = oci.pagination.list_call_get_all_results(self.client.list_boot_volume_attachments, availability_domain=availability_domain, compartment_id=compartment_id, instance_id=instance_id, boot_volume_id=boot_volume_id).data
        # Convert to Json object
        boot_volume_attachments_json = self.toJson(boot_volume_attachments)
        logger.debug(str(boot_volume_attachments_json))

        # Filter results
        self.boot_volume_attachments_json = self.filterJsonObjectList(boot_volume_attachments_json, filter)
        logger.debug('--------------------- Boot Volumes ----------------------')
        logger.debug(str(self.boot_volume_attachments_json))

        # Build List of Boot Volume Attachment Objects
        self.boot_volume_attachments_obj = []
        for boot_volume_attachment in self.boot_volume_attachments_json:
            boot_volume_attachment['boot_volume'] = OCIBootVolumes(config=self.config, configfile=self.configfile, profile=self.profile, compartment_id=compartment_id).get(boot_volume_id=boot_volume_attachment['boot_volume_id'])
            self.boot_volume_attachments_obj.append(OCIBootVolumeAttachment(self.config, self.configfile, self.profile, boot_volume_attachment))

        return self.boot_volume_attachments_json


class OCIBootVolumeAttachment(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

