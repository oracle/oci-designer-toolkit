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
__module__ = "ociPrivateIps"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys

from facades.ociConnection import OCIVirtualNetworkConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIPrivateIps(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, subnet_id=None, vnic_id=None, ip_address=None, **kwargs):
        self.subnet_id = subnet_id
        self.vnic_id = vnic_id
        self.ip_address = ip_address
        self.private_ips_json = []
        self.private_ips_obj = []
        super(OCIPrivateIps, self).__init__(config=config, configfile=configfile)

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
            self.private_ips_obj.append(OCIPrivateIp(self.config, self.configfile, private_ip))

        return self.private_ips_json


class OCIPrivateIp(object):
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
