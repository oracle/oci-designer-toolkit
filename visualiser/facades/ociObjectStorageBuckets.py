#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociObjectStorageBuckets"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitCommon import logJson
from common.okitLogging import getLogger
from facades.ociConnection import OCIObjectStorageBucketConnection

# Configure logging
logger = getLogger()


class OCIObjectStorageBuckets(OCIObjectStorageBucketConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.object_storage_buckets_json = []
        self.object_storage_buckets_obj = []
        super(OCIObjectStorageBuckets, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Get  Namespace
        namespace = str(self.client.get_namespace().data)
        logger.debug('Namespace : {0!s:s}'.format(namespace))

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        object_storage_buckets_summary = oci.pagination.list_call_get_all_results(self.client.list_buckets, namespace_name=namespace, compartment_id=compartment_id).data

        # Convert to Json object
        object_storage_buckets_summary_json = self.toJson(object_storage_buckets_summary)
        logger.debug(str(object_storage_buckets_summary_json))

        # Filter results
        self.object_storage_buckets_json = self.filterJsonObjectList(object_storage_buckets_summary_json, filter)
        logger.debug(str(self.object_storage_buckets_json))

        # Convert Bucket Summary to Details
        object_storage_buckets_json = []
        for bucket_summary in self.object_storage_buckets_json:
            bucket = self.client.get_bucket(bucket_summary['namespace'], bucket_summary['name']).data
            bucket['display_name'] = bucket['name']
            object_storage_buckets_json.append(self.toJson(bucket))
            object_storage_buckets_json[-1]['id'] = object_storage_buckets_json[-1].get('id', '{0!s:s}-{1!s:s}'.format(bucket_summary['namespace'], bucket_summary['name']))
        self.object_storage_buckets_json = object_storage_buckets_json
        logger.debug(str(self.object_storage_buckets_json))
        logJson(self.object_storage_buckets_json)

        return self.object_storage_buckets_json


class OCIObjectStorageBucket(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

