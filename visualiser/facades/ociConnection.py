#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociConnection"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import oci
import re

import json
from common.okitLogging import getLogger

# Configure logging
logger = getLogger()


class OCIConnection(object):
    PAGINATION_LIMIT = 1000;

    def __init__(self, config=None, configfile=None, profile=None):
        self.config = config
        self.configfile = configfile
        self.client = None
        self.profile = profile
        if self.profile is None or len(self.profile.strip()) == 0:
            self.profile = 'DEFAULT'
        logger.debug('>>>>>>>>>>>>>>>> Config         : {0!s:s}'.format(self.config))
        logger.debug('>>>>>>>>>>>>>>>> Config File    : {0!s:s}'.format(self.configfile))
        logger.debug('>>>>>>>>>>>>>>>> Profile        : {0!s:s}'.format(self.profile))
        # Read Config
        if self.configfile is None:
            self.config = oci.config.from_file(profile_name=self.profile)
        else:
            self.config = oci.config.from_file(file_location=self.configfile, profile_name=self.profile)
        logger.debug('>>>>>>>>>>>>>>>> Profile Config : {0!s:s}'.format(self.config))
        if config is not None:
            self.config.update(config)
        logger.debug('>>>>>>>>>>>>>>>> Merged Config  : {0!s:s}'.format(self.config))
        self.connect()

    def toJson(self, data):
        return json.loads(str(data))

    def filterJsonObjectList(self, json_list=[], filter={}):
        if filter is not None and json_list is not None:
            for key, val in filter.items():
                logger.info('{0!s:s} = {1!s:s}'.format(key, val))
                # Check if filter is a list of strings and join as or
                if isinstance(val, list):
                    val = '|'.join(val)
                    logger.info('{0!s:s} = {1!s:s}'.format(key, val))
                json_list = [bs for bs in json_list if re.compile(val).search(bs[key])]
        return json_list


class OCIIdentityConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        self.compartment_ocid = None
        super(OCIIdentityConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.identity.IdentityClient(self.config)
        self.compartment_ocid = self.config["tenancy"]
        return


class OCIVirtualNetworkConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIVirtualNetworkConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.core.VirtualNetworkClient(self.config)
        return


class OCILoadBalancerConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCILoadBalancerConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.load_balancer.LoadBalancerClient(self.config)
        return


class OCIComputeConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIComputeConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.core.ComputeClient(self.config)
        return


class OCIResourceManagerConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIResourceManagerConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.resource_manager.ResourceManagerClient(self.config)
        return


class OCIBlockStorageVolumeConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIBlockStorageVolumeConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.core.BlockstorageClient(self.config)
        return


class OCIDatabaseConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIDatabaseConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.database.DatabaseClient(self.config)
        return


class OCIObjectStorageBucketConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIObjectStorageBucketConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.object_storage.ObjectStorageClient(self.config)
        return


class OCIFileStorageSystemConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIFileStorageSystemConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.file_storage.FileStorageClient(self.config)
        return
