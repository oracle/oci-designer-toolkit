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
__module__ = "ociCompartment"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys
import json

from facades.ociConnection import OCIIdentityConnection
from facades.ociVirtualCloudNetwork import OCIVirtualCloudNetworks
from facades.ociLoadBalancer import OCILoadBalancers
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCICompartments(OCIIdentityConnection):
    def __init__(self, config=None, configfile=None, **kwargs):
        self.compartments_obj = []
        self.compartments_json = []
        self.names = {}
        self.parents = {}
        self.canonicalnames = []
        super(OCICompartments, self).__init__(config=config, configfile=configfile)

    def get(self, compartment_id):
        compartment = self.client.get_compartment(compartment_id=compartment_id).data
        self.compartments_json = [self.toJson(compartment)]
        self.compartments_obj = [OCICompartment(self.config, self.configfile, self.compartments_json[0])]
        return self.compartments_json[0]

    def list(self, id=None, filter={}, recursive=False, **kwargs):
        if id is None:
            id = self.compartment_ocid
        # Recursive only valid if we are querying the root / tenancy
        recursive = (recursive and (id == self.config['tenancy']))

        # Add filter to only return ACTIVE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'ACTIVE'

        compartments = oci.pagination.list_call_get_all_results(self.client.list_compartments, compartment_id=id, compartment_id_in_subtree=recursive).data

        # Convert to Json object
        compartments_json = self.toJson(compartments)
        logger.debug(str(compartments_json))

        # Check if the results should be filtered
        if filter is None:
            self.compartments_json = compartments_json
        else:
            filtered = compartments_json[:]
            for key, val in filter.items():
                filtered = [comp for comp in filtered if re.compile(val).search(comp[key])]
            self.compartments_json = filtered
        logger.debug(str(self.compartments_json))

        # Generate Name / Id mappings
        for compartment in self.compartments_json:
            self.names[compartment['id']] = compartment['name']
            self.parents[compartment['id']] = compartment['compartment_id']
        # Build List of Compartment Objects that have methods for getting VCN / Security Lists / Route Tables etc
        self.compartments_obj = []
        for compartment in self.compartments_json:
            compartment['display_name'] = self.getCanonicalName(compartment['id'])
            self.compartments_obj.append(OCICompartment(self.config, self.configfile, compartment))
        return self.compartments_json

    def listTenancy(self):
        return self.list(id=self.config['tenancy'], recursive=True)

    def listHierarchicalNames(self):
        compartments = self.listTenancy()
        #for compartment in compartments:
        #    self.names[compartment['id']] = compartment['name']
        #    self.parents[compartment['id']] = compartment['compartment_id']
        #for compartment in sorted(compartments, key=lambda k: k.time_created):
        for compartment in sorted(compartments, key=lambda k: k['time_created']):
                self.canonicalnames.append(self.getCanonicalName(compartment['id']))
        return sorted(self.canonicalnames)

    def getCanonicalName(self, compartment_id):
        parentsname = ''
        if self.parents[compartment_id] in self.names:
            parentsname = self.getCanonicalName(self.parents[compartment_id])
        return '{0!s:s}/{1!s:s}'.format(parentsname, self.names[compartment_id])


class OCICompartment(object):
    def __init__(self, config=None, configfile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.data = data

    def getVirtualCloudNetworkClients(self):
        return OCIVirtualCloudNetworks(self.config, self.configfile, self.data['id'])

    def getLoadBalancerClients(self):
        return OCILoadBalancers(self.config, self.configfile, self.data['id'])


# Main processing function
def main(argv):
    oci_compartments = OCICompartments()
    oci_compartments.listTenancy()
    for name in oci_compartments.listHierarchicalNames():
        logger.info('Name: {0!s:s}'.format(name))
    for oci_compartment in oci_compartments.compartments_obj:
        logger.info('Compartment: {} {}'.format(oci_compartment.data['display_name'], oci_compartment.data['lifecycle_state']))
        oci_virtual_cloud_networks = oci_compartment.getVirtualCloudNetworkClients()
        oci_virtual_cloud_networks.list()
        for oci_virtual_cloud_network in oci_virtual_cloud_networks.virtual_cloud_networks_obj:
            #logger.info('\tVirtual Cloud Network : {0!s:s}'.format(oci_virtual_cloud_network.data['display_name']))
            # Internet Gateways
            oci_internet_gateways = oci_virtual_cloud_network.getInternetGatewayClients()
            oci_internet_gateways.list()
            #for oci_internet_gateway in oci_internet_gateways.internet_gateways_obj:
            #    logger.info('\t\tInternet Gateway : {0!s:s}'.format(oci_internet_gateway.data['display_name']))
            # Route Tables
            oci_route_tables = oci_virtual_cloud_network.getRouteTableClients()
            oci_route_tables.list()
            #for oci_route_table in oci_route_tables.route_tables_obj:
            #    logger.info('\t\tRoute Table : {0!s:s}'.format(oci_route_table.data['display_name']))
            # Security Lists
            security_lists = oci_virtual_cloud_network.getSecurityListClients()
            security_lists.list()
            #for security_list in security_lists.security_lists_obj:
            #    logger.info('\t\tSecurity List : {0!s:s}'.format(security_list.data['display_name']))
            # Subnets
            subnets = oci_virtual_cloud_network.getSubnetClients()
            subnets.list()
            #for subnet in subnets.subnets_obj:
            #    logger.info('\t\tSubnet : {0!s:s}'.format(subnet.data['display_name']))


        if (oci_compartment.data['lifecycle_state'] == "ACTIVE"):
            oci_load_balancers = oci_compartment.getLoadBalancerClients()
            oci_load_balancers.list()
            for oci_load_balancer in oci_load_balancers.load_balancers_obj:
                logger.info('\t\tLoadBalancer : {0!s:s}, {1!s:s}'.format(oci_load_balancer.data['display_name'], oci_load_balancer.data['id']))

                oci_loadbalancer_hosts = oci_load_balancer.getLBHostClients()
                oci_loadbalancer_hosts.list()
                for lb_host in oci_loadbalancer_hosts.lb_hosts_obj:
                    logger.info('\t\tLoadBalancer Host : {0!s:s}'.format(lb_host.data['display_name']))

                oci_backendsets = oci_load_balancer.getBackendSetClients()
                oci_backendsets.list()
                for backendset in oci_backendsets.backendsets_obj:
                    logger.info('\t\tBackendSet : {0!s:s}'.format(backendset.data['name']))
                    oci_backends = oci_load_balancer.getBackendClients(load_balancer_id=oci_load_balancer.data['id'], backend_set_name=backendset.data['name'])
                    oci_backends.list()
                    for backend in oci_backends.backends_obj:
                        logger.info('\t\tBackend : {0!s:s}'.format(backend.data['name']))

    return

# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
