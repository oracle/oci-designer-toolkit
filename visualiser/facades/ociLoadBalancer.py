#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Ulrich Dustmann (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociNetwork"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociBackend import OCIBackends
from facades.ociBackendSet import OCIBackendSets
from facades.ociConnection import OCILoadBalancerConnection
from facades.ociLoadBalancerHost import OCILoadBalancerHosts
from facades.ociPrivateIps import OCIPrivateIps
from facades.ociVnicAttachement import OCIVnicAttachments

# Configure logging
logger = getLogger()


class OCILoadBalancers(OCILoadBalancerConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.load_balancers_json = []
        self.load_balancers_obj = []
        super(OCILoadBalancers, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
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
            # If subnet_id is not part of the object assign the first entry in subnet_ids
            load_balancer['subnet_id'] = load_balancer.get('subnet_id', load_balancer['subnet_ids'][0])
            self.load_balancers_obj.append(OCILoadBalancer(self.config, self.configfile, self.profile, load_balancer))

        return self.load_balancers_json


class OCILoadBalancer(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

    def getLBHostClients(self):
        return OCILoadBalancerHosts(self.config, self.configfile, self.profile, self.data['compartment_id'], self.data['id'])

    def getBackendSetClients(self):
        return OCIBackendSets(self.config, self.configfile, self.profile, self.data['compartment_id'], self.data['id'])

    def getBackendClients(self, backend_set_name=None):
        return OCIBackends(self.config, self.configfile, self.profile, self.data['id'], backend_set_name)

