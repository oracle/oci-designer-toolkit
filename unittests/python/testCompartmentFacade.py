import unittest

from facades.ociCompartment import OCICompartments
from facades.ociConnection import OCIIdentityConnection
from facades.ociVirtualCloudNetwork import OCIVirtualCloudNetworks
from facades.ociInstance import OCIInstances
from facades.ociLoadBalancer import OCILoadBalancers
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class CompartmentTests(unittest.TestCase):
    def test_compartment_query(self):
        self.assertEqual(True, False)

    def test_full_compartment_query(self):
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


if __name__ == '__main__':
    unittest.main()
