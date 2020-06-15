#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociNetworkSecurityGroup"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCINetworkSecurityGroups(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, vcn_id=None):
        self.compartment_id = compartment_id
        self.vcn_id = vcn_id
        self.network_security_groups_json = []
        self.network_security_groups_obj = []
        super(OCINetworkSecurityGroups, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        if self.vcn_id is not None:
            network_security_groups = oci.pagination.list_call_get_all_results(self.client.list_network_security_groups, compartment_id=compartment_id, vcn_id=self.vcn_id).data
            # Convert to Json object
            network_security_groups_json = self.toJson(network_security_groups)
            logger.debug(str(network_security_groups_json))

            # Filter results
            self.network_security_groups_json = self.filterJsonObjectList(network_security_groups_json, filter)
            logger.debug(str(self.network_security_groups_json))

            # Build List of NetworkSecurityGroup Objects
            self.network_security_groups_obj = []
            for network_security_group in self.network_security_groups_json:
                network_security_group['security_rules'] = self.toJson(oci.pagination.list_call_get_all_results(self.client.list_network_security_group_security_rules, network_security_group_id=network_security_group['id']).data)
                self.network_security_groups_obj.append(OCINetworkSecurityGroup(self.config, self.configfile, self.profile, network_security_group))
        else:
            logger.warn('Virtual Cloud Network Id has not been specified.')

        return self.network_security_groups_json


class OCINetworkSecurityGroup(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

