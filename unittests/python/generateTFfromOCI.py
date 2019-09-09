#!/usr/bin/python
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Stefan Hinker (Oracle Cloud Solutions A-Team)"]
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
import shutil
import tempfile
import os
import getopt

from generators.ociTerraformGenerator import OCITerraformGenerator
from facades.ociConnection import OCIIdentityConnection
from facades.ociVirtualCloudNetwork import OCIVirtualCloudNetworks
from facades.ociCompartment import OCICompartments
from facades.ociInstance import OCIInstances
from common.ociLogging import getLogger
from common.ociQuery import executeQuery

# Configure logging
logger = getLogger()

template_root = '/okit/visualiser/templates'

# Execute workflow
def processWorkflow(args):

    if not os.path.isdir(args['destinationdir']):
        logger.warning("Destination Directory {0:s} does not exist or is not a directory.".format(args['destinationdir']))
        destination_dir = tempfile.mkdtemp()
    else:
        destination_dir = args['destinationdir']

    logger.info('destination_dir : {0:s}'.format(destination_dir))

    request_json = {}
    request_json['compartment_id'] = args['container_ocid']
    request_json['compartment_name'] = args['container_name']
    request_json['virtual_cloud_network_filter'] = {'display_name': 'Uli-Dev-Subnet-Ad1'}

    response_json = executeQuery2(request_json)
    #response_json = executeQuery(request_json)

    resp_json = str(response_json)
    resp_json = resp_json.replace("'", '"')

    #logger.info('Response JSON : {0:s}'.format(str(resp_json)))

    generator = OCITerraformGenerator(template_root, destination_dir, response_json)
    generator.generate()
    generator.writeFiles()

    return


# Set default values for Args
def defaultArgs():
    args = {}
    args['destinationdir'] = os.path.join(os.path.dirname(os.path.realpath(__file__)), "output")
    args['container_name'] = 'Uli'
    args['container_ocid'] = 'ocid1.compartment.oc1..aaaaaaaavfni5bvyt54o2vpia446t7ahcfg5xnj2bjxypzkf2nmgix4cianq'

    return args


# Read Module Arguments
def readargs(opts, args):
    moduleargs = defaultArgs()

    # Read Module Command Line Arguments.
    for opt, arg in opts:
        if opt in ("-d", "--destinationdir"):
            moduleargs['destinationdir'] = arg
        elif opt in ("-c", "--container_name"):
            moduleargs['container_name'] = arg
        elif opt in ("-i", "--container_ocid"):
            moduleargs['container_ocid'] = arg

    return moduleargs


def executeQuery2(request_json={}, ** kwargs):
    response_json = {}

    logger.info('Request JSON : {0:s}'.format(str(request_json)))
    compartment_id = request_json['compartment_id']
    compartment_name = request_json['compartment_name']
    logger.info('compartment_id : {0:s}, {1:s}'.format(compartment_id, compartment_name))
    filter = {}
    filter['compartment_name'] = compartment_name
    filter['virtual_cloud_network_filter'] = request_json['virtual_cloud_network_filter']

    oci_compartments = OCICompartments()

    #compartment_json = oci_compartments.get(compartment_id=compartment_id)
    compartment_json = oci_compartments.list(filter={'name': compartment_name})
    logger.debug(str(compartment_json))
    oci_compartment = oci_compartments.compartments_obj[0]
    # Build OKIT Response json add compartment information
    response_json['compartment'] = {}
    response_json['compartment']['id'] = compartment_json[0]['compartment_id']
    response_json['compartment']['name'] = compartment_json[0]['name']
    logger.info('Compartment: {0!s:s}, {1!s:s}'.format(oci_compartment.data['name'], oci_compartment.data['id']))
    # Query all Virtual Cloud Networks
    oci_virtual_cloud_networks = oci_compartment.getVirtualCloudNetworkClients()
    response_json['compartment']["virtual_cloud_networks"] = oci_virtual_cloud_networks.list()
    # Loop through resulting json
    for oci_virtual_cloud_network in oci_virtual_cloud_networks.virtual_cloud_networks_obj:
        logger.info('\tVirtual Cloud Network : {0!s:s}'.format(oci_virtual_cloud_network.data['display_name']))
        # Internet Gateways
        oci_internet_gateways = oci_virtual_cloud_network.getInternetGatewayClients()
        response_json['compartment']['internet_gateways'] = oci_internet_gateways.list()
        for oci_internet_gateway in oci_internet_gateways.internet_gateways_obj:
            logger.info('\t\tInternet Gateway : {0!s:s}'.format(oci_internet_gateway.data['display_name']))
        # Route Tables
        oci_route_tables = oci_virtual_cloud_network.getRouteTableClients()
        response_json['compartment']['route_tables'] = oci_route_tables.list()
        for oci_route_table in oci_route_tables.route_tables_obj:
            logger.info('\t\tRoute Table : {0!s:s}'.format(oci_route_table.data['display_name']))
        # Security Lists
        security_lists = oci_virtual_cloud_network.getSecurityListClients()
        response_json['compartment']['security_lists'] = security_lists.list()
        for security_list in security_lists.security_lists_obj:
            logger.info('\t\tSecurity List : {0!s:s}'.format(security_list.data['display_name']))
        # Subnets
        subnets = oci_virtual_cloud_network.getSubnetClients()
        response_json['compartment']['subnets'] = subnets.list()
        for subnet in subnets.subnets_obj:
            logger.info('\t\tSubnet : {0!s:s}'.format(subnet.data['display_name']))

    oci_load_balancers = oci_compartment.getLoadBalancerClients()
    response_json['compartment']['loadbalancers'] = oci_load_balancers.list()
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
            oci_backends = oci_load_balancer.getBackendClients(backend_set_name=backendset.data['name'])
            oci_backends.list()
            for backend in oci_backends.backends_obj:
                logger.info('\t\tBackend : {0!s:s}'.format(backend.data['name']))

    #logger.info('Response     : {0:s}'.format(str(response_json)))

    return response_json


# Main processing function
def main(argv):

    # Configure Parameters and Options
    options = 'd:c:'
    longOptions = ['destinationdir=', 'compartment_ocid=']
    # Get Options & Arguments
    try:
        opts, args = getopt.getopt(argv, options, longOptions)
        # Read Module Arguments
        moduleargs = readargs(opts, args)
        processWorkflow(moduleargs)
    except getopt.GetoptError:
        usage()
    except Exception as e:
        print('Unknown Exception please check log file')
        logger.exception(e)
        sys.exit(1)

    return

# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
