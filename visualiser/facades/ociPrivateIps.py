#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociPrivateIps"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCIPrivateIps(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, subnet_id=None, vnic_id=None, ip_address=None):
        self.subnet_id = subnet_id
        self.vnic_id = vnic_id
        self.ip_address = ip_address
        self.private_ips_json = []
        self.private_ips_obj = []
        super(OCIPrivateIps, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, subnet_id=None, vnic_id=None, ip_address=None, filter=None):
        if subnet_id is None:
            subnet_id = self.subnet_id
        if vnic_id is None:
            vnic_id = self.vnic_id
        if ip_address is None:
            ip_address = self.ip_address

        private_ips = oci.pagination.list_call_get_all_results(self.client.list_private_ips, subnet_id=subnet_id, vnic_id=vnic_id, ip_address=ip_address).data
        # Convert to Json object
        private_ips_json = self.toJson(private_ips)
        logger.debug(str(private_ips_json))

        # Filter results
        self.private_ips_json = self.filterJsonObjectList(private_ips_json, filter)
        logger.debug('--------------------- Private IPs ----------------------')
        logger.debug(str(self.private_ips_json))

        # Build List of Subnet Objects
        self.private_ips_obj = []
        for private_ip in self.private_ips_json:
            self.private_ips_obj.append(OCIPrivateIp(self.config, self.configfile, self.profile, private_ip))

        return self.private_ips_json


class OCIPrivateIp(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

