#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Stefan Hinker (Oracle Cloud Solutions A-Team)", "Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociInstance"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import base64
import oci

from common.okitLogging import getLogger
from facades.ociBootVolumeAttachment import OCIBootVolumeAttachments
from facades.ociConnection import OCIComputeConnection, OCIVirtualNetworkConnection
from facades.ociVnicAttachement import OCIVnicAttachments
from facades.ociVolumeAttachment import OCIVolumeAttachments

# Configure logging
logger = getLogger()

class OCIInstanceVnics(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, instance_id=None):
        self.compartment_id = compartment_id
        self.instance_id = instance_id
        self.vnics_json = []
        self.vnics_obj = []
        super(OCIInstanceVnics, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, instance_id=None):
        computeclient=OCIComputeConnection()
        if compartment_id is None:
            compartment_id = self.compartment_id
        if instance_id is None:
            instance_id = self.instance_id

        vnic_attachments = oci.pagination.list_call_get_all_results(computeclient.client.list_vnic_attachments, compartment_id=compartment_id, instance_id=instance_id).data        
        vnics = []
        for attachment in vnic_attachments:
            try:
                vnic = self.client.get_vnic(attachment.vnic_id).data
                vnics.append(vnic)
            except Exception as e:
                logger.exception('Failed to get Vnic Attachment')
                logger.exception(e)
        vnics_json = self.toJson(vnics)
        logger.debug(str(vnics_json))
  
        self.vnics_json=vnics_json
        logger.debug(str(self.vnics_json))

        for vnic in self.vnics_json:
            self.vnics_obj.append(OCIInstanceVnic(self.config, self.configfile, self.profile, vnic))

        return self.vnics_json

class OCIInstanceVnic(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.data = data

class OCIInstances(OCIComputeConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.instances_json = []
        self.instances_obj = []
        super(OCIInstances, self).__init__(config=config, configfile=configfile, profile=profile)

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
 
        # Filter results
        self.instances_json = self.filterJsonObjectList(instances_json, filter)
        logger.debug(str(self.instances_json))


        # Get Volume Attachments as a single call and loop through them to see if they are associated with the instance.
        volume_attachments = OCIVolumeAttachments(config=self.config, configfile=self.configfile, profile=self.profile, compartment_id=compartment_id).list()

        # Get VNic Attachments as a single call and loop through them to see if they are associated with the instance.
        vnic_attachments = OCIVnicAttachments(config=self.config, configfile=self.configfile, profile=self.profile, compartment_id=compartment_id).list()

        for instance in self.instances_json:
            # Decode Cloud Init Yaml
            if 'metadata' in instance and 'user_data' in instance['metadata']:
                instance['metadata']['user_data'] = base64.b64decode(instance['metadata']['user_data']).decode('utf-8')
            # Add Attached Block Storage Volumes
            instance['block_storage_volume_ids'] = [va['volume_id'] for va in volume_attachments if va['instance_id'] == instance['id']]
            # Add Vnic Attachments
            instance['vnics'] = [va for va in vnic_attachments if va['instance_id'] == instance['id']]
            if len(instance['vnics']) > 0:
                instance['primary_vnic'] = instance['vnics']
            # Add first vnic as the default subnet
            instance['subnet_id'] = instance['vnics'][0]['subnet_id'] if len(instance['vnics']) > 0 else ''
            # Get Volume Attachments as a single call and loop through them to see if they are associated with the instance.
            boot_volume_attachments = OCIBootVolumeAttachments(config=self.config, configfile=self.configfile, profile=self.profile, compartment_id=compartment_id, availability_domain=instance['availability_domain'], instance_id=instance['id']).list()
            instance['boot_volume_size_in_gbs'] = boot_volume_attachments[0]['boot_volume']['size_in_gbs']
            instance['is_pv_encryption_in_transit_enabled'] = boot_volume_attachments[0]['is_pv_encryption_in_transit_enabled']
            # Build object list
            self.instances_obj.append(OCIInstance(self.config, self.configfile, self.profile, instance))

        return self.instances_json

class OCIInstance(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

    def getInstanceVnicClients(self):
        return OCIInstanceVnics(self.config, self.configfile, self.profile, self.data['compartment_id'], self.data['id'])

    def getVolumeAttachments(self):
        return OCIVolumeAttachments(self.config, self.configfile, self.profile, self.data['compartment_id'], self.data['id'])

    def getVnicAttachments(self):
        return OCIVnicAttachments(self.config, self.configfile, self.profile, self.data['compartment_id'], self.data['id'])

