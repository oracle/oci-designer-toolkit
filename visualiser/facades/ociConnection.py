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
__module__ = "ociConnection"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import oci
import json
import os
import re
import sys

from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIConnection(object):
    PAGINATION_LIMIT = 1000;

    def __init__(self, config=None, configfile=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.client = None
        self.connect()

    def toJson(self, data):
        return json.loads(str(data))

    def filterJsonObjectList(self, json_list=[], filter={}, **kwargs):
        if filter is not None and json_list is not None:
            for key, val in filter.items():
                logger.info('{0!s:s} = {1!s:s}'.format(key, val))
                # Check if filter is a list of strings and jloin as or
                if isinstance(val, list):
                    val = '|'.join(val)
                    logger.info('{0!s:s} = {1!s:s}'.format(key, val))
                json_list = [bs for bs in json_list if re.compile(val).search(bs[key])]
        return json_list


class OCIIdentityConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, **kwargs):
        self.compartment_ocid = None
        super(OCIIdentityConnection, self).__init__(config=config, configfile=configfile)

    def connect(self):
        if self.config is None:
            if self.configfile is None:
                self.config = oci.config.from_file()
            else:
                self.config = oci.config.from_file(self.configfile)
        self.client = oci.identity.IdentityClient(self.config)
        self.compartment_ocid = self.config["tenancy"]
        return


class OCIVirtualNetworkConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, **kwargs):
        super(OCIVirtualNetworkConnection, self).__init__(config=config, configfile=configfile)

    def connect(self):
        if self.config is None:
            if self.configfile is None:
                self.config = oci.config.from_file()
            else:
                self.config = oci.config.from_file(self.configfile)
        self.client = oci.core.VirtualNetworkClient(self.config)
        return


class OCILoadBalancerConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, **kwargs):
        super(OCILoadBalancerConnection, self).__init__(config=config, configfile=configfile)

    def connect(self):
        if self.config is None:
            if self.configfile is None:
                self.config = oci.config.from_file()
            else:
                self.config = oci.config.from_file(self.configfile)
        self.client = oci.load_balancer.LoadBalancerClient(self.config)
        return


class OCIComputeConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, **kwargs):
        super(OCIComputeConnection, self).__init__(config=config, configfile=configfile)

    def connect(self):
        if self.config is None:
            if self.configfile is None:
                self.config = oci.config.from_file()
            else:
                self.config = oci.config.from_file(self.configfile)
        self.client = oci.core.ComputeClient(self.config)
        return


class OCIResourceManagerConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, **kwargs):
        super(OCIResourceManagerConnection, self).__init__(config=config, configfile=configfile)

    def connect(self):
        if self.config is None:
            if self.configfile is None:
                self.config = oci.config.from_file()
            else:
                self.config = oci.config.from_file(self.configfile)
        self.client = oci.resource_manager.ResourceManagerClient(self.config)
        return


class OCIBlockStorageVolumeConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, **kwargs):
        super(OCIBlockStorageVolumeConnection, self).__init__(config=config, configfile=configfile)

    def connect(self):
        if self.config is None:
            if self.configfile is None:
                self.config = oci.config.from_file()
            else:
                self.config = oci.config.from_file(self.configfile)
        self.client = oci.core.BlockstorageClient(self.config)
        return
