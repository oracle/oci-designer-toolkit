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
__module__ = "ociObjectStorageBuckets"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys

from facades.ociConnection import OCIObjectStorageBucketConnection
from facades.ociCompartment import OCICompartments
from common.ociCommon import logJson
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIObjectStorageBuckets(OCIObjectStorageBucketConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.object_storage_buckets_json = []
        self.object_storage_buckets_obj = []
        super(OCIObjectStorageBuckets, self).__init__(config=config, configfile=configfile)

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
            object_storage_buckets_json.append(self.toJson(bucket))
            object_storage_buckets_json[-1]['id'] = object_storage_buckets_json[-1].get('id', '{0!s:s}-{1!s:s}'.format(bucket_summary['namespace'], bucket_summary['name']))
        self.object_storage_buckets_json = object_storage_buckets_json
        logger.debug(str(self.object_storage_buckets_json))
        logJson(self.object_storage_buckets_json)

        return self.object_storage_buckets_json


class OCIObjectStorageBucket(object):
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
