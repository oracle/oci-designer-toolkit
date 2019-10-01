#!/usr/bin/python
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Stefan Hinker (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__ekitversion__ = "@VERSION@"
__ekitrelease__ = "@RELEASE@"
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "ociNetwork"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys

from facades.ociConnection import OCIComputeConnection,OCIVirtualNetworkConnection
from facades.ociVolumeAttachment import OCIVolumeAttachments
from facades.ociVnicAttachement import OCIVnicAttachments
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()

class OCIInstanceVnics(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, instance_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.instance_id = instance_id
        self.vnics_json = []
        self.vnics_obj = []
        super(OCIInstanceVnics, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, instance_id=None):
        computeclient=OCIComputeConnection()
        if compartment_id is None:
            compartment_id = self.compartment_id
        if instance_id is None:
            instance_id = self.instance_id

        vnic_attachments = oci.pagination.list_call_get_all_results(computeclient.client.list_vnic_attachments, compartment_id=compartment_id, instance_id=instance_id).data        
        vnics=[]
        for attachment in vnic_attachments:
            try:
                vnic=self.client.get_vnic(attachment.vnic_id).data
                vnics.append(vnic)
            except Exception as e:
                logger.exception('Failed to get Vnic Attachment')
                logger.exception(e)
        vnics_json = self.toJson(vnics)
        logger.debug(str(vnics_json))
  
        self.vnics_json=vnics_json
        logger.debug(str(self.vnics_json))

        for vnic in self.vnics_json:
            self.vnics_obj.append(OCIInstanceVnic(self.config, self.configfile, vnic))

        return self.vnics_json

class OCIInstanceVnic(object):
    def __init__(self, config=None, configfile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.data = data

class OCIInstances(OCIComputeConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.instances_json = []
        self.instances_obj = []
        super(OCIInstances, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return "RUNNING", "STARTING", "STOPPING", "STOPPED" Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = ["RUNNING", "STARTING", "STOPPING", "STOPPED"]

        instances = oci.pagination.list_call_get_all_results(self.client.list_instances, compartment_id=compartment_id).data

        # Convert to Json object
        instances_json = self.toJson(instances)
        logger.debug(str(instances_json))
 
        #self.instances_json = instances_json
        #logger.debug(str(self.instances_json))

        # Filter results
        self.instances_json = self.filterJsonObjectList(instances_json, filter)
        logger.debug(str(self.instances_json))

        for instance in self.instances_json:
            # Check if any Block Storage has been Attached
            volume_attachments = OCIVolumeAttachments(config=self.config, configfile=self.configfile, compartment_id=compartment_id, instance_id=instance['id']).list()
            instance['block_storage_volume_ids'] = [va['volume_id'] for va in volume_attachments]
            # Build object list
            self.instances_obj.append(OCIInstance(self.config, self.configfile, instance))

        return self.instances_json

class OCIInstance(object):
    def __init__(self, config=None, configfile=None, data=None, id=None):
        self.config = config
        self.configfile = configfile
        self.data = data

    def getInstanceVnicClients(self):
        return OCIInstanceVnics(self.config, self.configfile, self.data['compartment_id'], self.data['id'])

    def getVolumeAttachments(self):
        return OCIVolumeAttachments(self.config, self.configfile, self.data['compartment_id'], self.data['id'])

    def getVnicAttachments(self):
        return OCIVnicAttachments(self.config, self.configfile, self.data['compartment_id'], self.data['id'])


# Main processing function
def main(argv):

    return


# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
