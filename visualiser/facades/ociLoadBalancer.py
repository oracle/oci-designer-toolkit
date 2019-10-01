#!/usr/bin/python
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Ulrich Dustmann (Oracle Cloud Solutions A-Team)"]
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

from facades.ociConnection import OCILoadBalancerConnection
from facades.ociLBHost import OCILBHosts
from facades.ociBackendSet import OCIBackendSets
from facades.ociBackend import OCIBackends
from facades.ociPrivateIps import OCIPrivateIps
from facades.ociVnicAttachement import OCIVnicAttachments

from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCILoadBalancers(OCILoadBalancerConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.load_balancers_json = []
        self.load_balancers_obj = []
        super(OCILoadBalancers, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None, **kwargs):
        if compartment_id is None:
            compartment_id = self.compartment_id

        load_balancers = oci.pagination.list_call_get_all_results(self.client.list_load_balancers, compartment_id=compartment_id).data

        # Convert to Json object
        load_balancers_json = self.toJson(load_balancers)
        logger.debug(str(load_balancers_json))

        # Filter results
        self.load_balancers_json = self.filterJsonObjectList(load_balancers_json, filter)
        logger.debug(str(self.load_balancers_json))

        # Find instance ocids associated with the backend ip addresses
        oci_private_ips = OCIPrivateIps(self.config, self.configfile)
        oci_vnics_attachments = OCIVnicAttachments(self.config, self.configfile, compartment_id=self.compartment_id)
        for load_balancer in self.load_balancers_json:
            load_balancer['instance_ids'] = []
            for key in load_balancer['backend_sets']:
                for backend in load_balancer['backend_sets'][key]['backends']:
                    for ip_address in oci_private_ips.list(subnet_id=load_balancer['subnet_ids'][0], ip_address=backend['ip_address']):
                        vnics_attachments = oci_vnics_attachments.list(vnic_id=ip_address['vnic_id'])
                        load_balancer['instance_ids'].extend([vnic_attachment['instance_id'] for vnic_attachment in vnics_attachments])

        # Build List of Loadbalancer Objects
        self.load_balancers_obj = []
        for load_balancer in self.load_balancers_json:
            self.load_balancers_obj.append(OCILoadBalancer(self.config, self.configfile, load_balancer))

        return self.load_balancers_json


class OCILoadBalancer(object):
    def __init__(self, config=None, configfile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.data = data

    def getLBHostClients(self):
        return OCILBHosts(self.config, self.configfile, self.data['compartment_id'], self.data['id'])

    def getBackendSetClients(self):
        return OCIBackendSets(self.config, self.configfile, self.data['compartment_id'], self.data['id'])

    def getBackendClients(self, backend_set_name=None):
        return OCIBackends(self.config, self.configfile, self.data['id'], backend_set_name)



# Main processing function
def main(argv):

    return


# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
