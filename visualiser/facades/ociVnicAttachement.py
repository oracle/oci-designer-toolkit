#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "ociVnicAttachments"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.ociLogging import getLogger
from common.ociCommon import logJson
from facades.ociConnection import OCIComputeConnection
from facades.ociVnic import OCIVnics

# Configure logging
logger = getLogger()


class OCIVnicAttachments(OCIComputeConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, instance_id=None, vnic_id=None):
        self.compartment_id = compartment_id
        self.instance_id = instance_id
        self.vnic_id = vnic_id
        self.vnic_attachments_json = []
        self.vnic_attachments_obj = []
        super(OCIVnicAttachments, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, instance_id=None, vnic_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id
        if instance_id is None:
            instance_id = self.instance_id
        if vnic_id is None:
            vnic_id = self.vnic_id

        vnic_attachments = oci.pagination.list_call_get_all_results(self.client.list_vnic_attachments, compartment_id=compartment_id, instance_id=instance_id, vnic_id=vnic_id).data
        # Convert to Json object
        vnic_attachments_json = self.toJson(vnic_attachments)
        logger.debug(str(vnic_attachments_json))

        # Filter results
        self.vnic_attachments_json = self.filterJsonObjectList(vnic_attachments_json, filter)
        logger.debug('--------------------- Vnics ----------------------')
        logJson(self.vnic_attachments_json)

        # Update VNic information
        oci_vnics = OCIVnics(config=self.config, configfile=self.configfile, profile=self.profile)
        for attachment in self.vnic_attachments_json:
            attachment.update(oci_vnics.get(vnic_id=attachment['vnic_id']))

        # Build List of Subnet Objects
        self.vnic_attachments_obj = []
        for vnic_attachment in self.vnic_attachments_json:
            self.vnic_attachments_obj.append(OCIVnicAttachment(self.config, self.configfile, self.profile, vnic_attachment))

        return self.vnic_attachments_json


class OCIVnicAttachment(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

