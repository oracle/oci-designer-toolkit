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
__module__ = "ociVolumeAttachments"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import datetime
import getopt
import json
import locale
import logging
import operator
import os
import requests
import sys


import oci
import re
import sys

from facades.ociConnection import OCIComputeConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIVolumeAttachments(OCIComputeConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, instance_id=None, volume_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.instance_id = instance_id
        self.volume_id = volume_id
        self.volume_attachments_json = []
        self.volume_attachments_obj = []
        super(OCIVolumeAttachments, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, instance_id=None, volume_id=None, filter=None, **kwargs):
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

        # Build List of Subnet Objects
        self.volume_attachments_obj = []
        for volume_attachment in self.volume_attachments_json:
            self.volume_attachments_obj.append(OCIVolumeAttachment(self.config, self.configfile, volume_attachment))

        return self.volume_attachments_json


class OCIVolumeAttachment(object):
    def __init__(self, config=None, configfile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.data = data


# Main processing function
def main(argv):

    return


# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
