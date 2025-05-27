#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociResourceManager"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import base64
import io
import oci
import time

from common.okitLogging import getLogger
from common.okitCommon import logJson
from common.okitCommon import parseJsonString
from common.okitCommon import jsonToFormattedString
from facades.ociConnection import OCIResourceManagerConnection
# Configure logging
logger = getLogger()


class OCIResourceManagers(OCIResourceManagerConnection):
    MEBIBYTE = 1024 * 1024
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.resource_managers_json = []
        self.resource_managers_obj = []
        super(OCIResourceManagers, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        resource_managers = oci.pagination.list_call_get_all_results(self.client.list_stacks, compartment_id=compartment_id).data
        logger.debug('Stack Count : {0:02d}'.format(len(resource_managers)))
        # Convert to Json object
        resource_managers_json = self.toJson(resource_managers)
        logJson(resource_managers_json)

        # Filter results
        self.resource_managers_json = self.filterJsonObjectList(resource_managers_json, filter)
        logger.debug(str(self.resource_managers_json))

        # Build List of ResourceManager Objects
        self.resource_managers_obj = []
        for resource_manager in self.resource_managers_json:
            self.resource_managers_obj.append(OCIResourceManager(self.config, self.configfile, self.profile, resource_manager))
        return self.resource_managers_json

    def getState(self, stack_id):
        logger.info('Getting State for Stack Id')
        result = self.client.get_stack_tf_state(stack_id=stack_id)
        state = io.BytesIO()
        for chunk in result.data.raw.stream(self.MEBIBYTE, decode_content=True):
            state.write(chunk)
        state_json = parseJsonString(state.getvalue().decode())
        return state_json
    
    def listJobs(self, stack_id, compartment_id=None):
        if compartment_id is None:
            compartment_id = self.compartment_id
        jobs = oci.pagination.list_call_get_all_results(self.client.list_jobs, compartment_id=compartment_id, stack_id=stack_id).data
        jobs_json = self.toJson(jobs)
        return jobs_json

    def createStack(self, stack):
        logger.debug('<<<<<<<<<<<<< Stack Detail >>>>>>>>>>>>>: {0!s:s}'.format(str(stack)))
        zip_source = oci.resource_manager.models.CreateZipUploadConfigSourceDetails(zip_file_base64_encoded=self.base64EncodeZip(stack))
        stack_details = oci.resource_manager.models.CreateStackDetails(compartment_id=stack['compartment_id'], display_name=stack['display_name'], config_source=zip_source, variables=stack['variables'], terraform_version='0.12.x', freeform_tags=stack['freeform_tags'])
        response = self.client.create_stack(stack_details)
        logger.debug('Create Stack Response : {0!s:s}'.format(str(response.data)))
        return self.toJson(response.data)

    def createJob(self, stack, operation='PLAN'):
        if operation == 'PLAN':
            job_details = oci.resource_manager.models.CreateJobDetails(stack_id=stack['id'],
                                                                       display_name='{0!s:s}-job-{1!s:s}'.format(operation.lower(), time.strftime('%Y%m%d%H%M%S')),
                                                                       operation=operation)
        else:
            job_details = oci.resource_manager.models.CreateJobDetails(stack_id=stack['id'],
                                                                       display_name='{0!s:s}-job-{1!s:s}'.format(operation.lower(), time.strftime('%Y%m%d%H%M%S')),
                                                                       operation=operation,
                                                                       apply_job_plan_resolution=oci.resource_manager.models.ApplyJobPlanResolution(is_auto_approved=True))
        self.client.create_job(job_details)
        return

    def updateStack(self, stack):
        logger.debug('<<<<<<<<<<<<< Stack Detail >>>>>>>>>>>>>: {0!s:s}'.format(str(stack)))
        zip_source = oci.resource_manager.models.UpdateZipUploadConfigSourceDetails(zip_file_base64_encoded=self.base64EncodeZip(stack))
        stack_details = oci.resource_manager.models.UpdateStackDetails(display_name=stack['display_name'], config_source=zip_source, variables=stack['variables'], terraform_version='0.12.x')
        response = self.client.update_stack(stack_id=stack['id'], update_stack_details=stack_details)
        logger.debug('Update Stack Response : {0!s:s}'.format(str(response.data)))
        return self.toJson(response.data)

    def base64EncodeZip(self, stack):
        with open(stack['zipfile'], "rb") as f:
            zip_bytes = f.read()
            encoded_zip = base64.b64encode(zip_bytes).decode('ascii')
        return encoded_zip

class OCIResourceManager(OCIResourceManagerConnection):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.data = data
        logger.debug(str(data))
        super(OCIResourceManager, self).__init__(config=config, configfile=configfile, profile=profile)

    def listJobs(self):
        jobs = oci.pagination.list_call_get_all_results(self.client.list_jobs, stack_id=self.data['id']).data
        jobs_json = self.toJson(jobs)
        return jobs_json

