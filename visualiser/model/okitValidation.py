#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociJsonValidator"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import ipaddress

from common.okitLogging import getLogger

# Configure logging
logger = getLogger()

class OCIJsonValidator(object):
    def __init__(self, okit_json={}):
        self.okit_json = okit_json
        self.results = {'errors': [], 'warnings': [], 'info': []}
        self.valid = True

    def validate(self):
        logger.info('Validating OKIT Json')
        self.validateCommon()
        self.validateAutonomousDatabases()
        self.validateBlockStorageVolumes()
        self.validateCompartments()
        self.validateCustomerPremiseEquipments()
        self.validateDhcpOptions()
        self.validateDatabaseSystems()
        self.validateDynamicRoutingGateways()
        self.validateFastConnects()
        self.validateFileStorageSystems()
        self.validateInstances()
        self.validateInternetGateways()
        self.validateIPSecConnections()
        self.validateLoadBalancers()
        self.validateLocalPeeringGateways()
        self.validateMySqlDatabaseSystems()
        self.validateNATGateways()
        self.validateNetworkSecurityGroups()
        self.validateObjectStorageBuckets()
        self.validateRemotePeeringConnections()
        self.validateRouteTables()
        self.validateSecurityLists()
        self.validateServiceGateways()
        self.validateSubnets()
        self.validateVirtualCloudNetworks()
        return self.valid

    def getResults(self):
        return self.results

    def keyToType(self, key):
        return key.replace('_', ' ').title()[:-1]

    # Common
    def validateCommon(self):
        # Build Display Name List
        used_display_names = {}
        for key in self.okit_json:
            if isinstance(self.okit_json[key], list):
                for artefact in self.okit_json[key]:
                    used_display_names[artefact['display_name']] = used_display_names.get(artefact['display_name'], 0) + 1;
        for key in self.okit_json:
            if isinstance(self.okit_json[key], list):
                for artefact in self.okit_json[key]:
                    if used_display_names[artefact['display_name']] > 1:
                        self.valid = False
                        error = {
                            'id': artefact['id'],
                            'type': self.keyToType(key),
                            'artefact': artefact['display_name'],
                            'message': 'Duplicate Display Name.',
                            'element': 'display_name'
                        }
                        self.results['errors'].append(error)

    # Autonomous Database
    def validateAutonomousDatabases(self):
        for artefact in self.okit_json.get('autonomous_databases', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            # Check DB Name
            if artefact['db_name'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Autonomous Database',
                    'artefact': artefact['display_name'],
                    'message': 'Database Name must be specified.',
                    'element': 'db_name'
                }
                self.results['errors'].append(error)
            # Check Free Tier
            if artefact['is_free_tier'] and artefact['is_auto_scaling_enabled']:
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Autonomous Database',
                    'artefact': artefact['display_name'],
                    'message': 'Auto Scaling is not available with Free Tier.',
                    'element': 'is_auto_scaling_enabled'
                }
                self.results['errors'].append(error)
            if artefact['is_free_tier'] and artefact['license_model'] != 'LICENSE_INCLUDED':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Autonomous Database',
                    'artefact': artefact['display_name'],
                    'message': 'Free Tier only supports License Included.',
                    'element': 'license_model'
                }
                self.results['errors'].append(error)
            if artefact['subnet_id'] != '' and len(artefact['nsg_ids']) == 0:
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Autonomous Database',
                    'artefact': artefact['display_name'],
                    'message': 'Autonomous Databases with private access (Subnet) require at least 1 Network Security Group.',
                    'element': 'nsg_ids'
                }
                self.results['errors'].append(error)

    # Block Storage
    def validateBlockStorageVolumes(self):
        for artefact in self.okit_json.get('block_storage_volumes', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))

    # Compartment
    def validateCompartments(self):
        for artefact in self.okit_json.get('compartments', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            if artefact['description'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Compartment',
                    'artefact': artefact['display_name'],
                    'message': 'Compartment Description must be specified.',
                    'element': 'description'
                }
                self.results['errors'].append(error)

    # Customer Premise Equipment
    def validateCustomerPremiseEquipments(self):
        for artefact in self.okit_json.get('customer_premise_equipments', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            if artefact['ip_address'] is None or artefact['ip_address'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Customer Premise Equipment',
                    'artefact': artefact['display_name'],
                    'message': 'IP Address must be specified.',
                    'element': 'ip_address'
                }
                self.results['errors'].append(error)

    # Database Systems
    def validateDatabaseSystems(self):
        for artefact in self.okit_json.get('database_systems', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            # Check ssh Key
            if artefact['ssh_public_keys'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Database System',
                    'artefact': artefact['display_name'],
                    'message': 'Public Keys must be specified.',
                    'element': 'ssh_public_keys'
                }
                self.results['errors'].append(error)
            # Check Hostname
            if artefact['database_edition'] == 'ENTERPRISE_EDITION_EXTREME_PERFORMANCE' and artefact['db_system_options']['storage_management'] == 'LVM':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Database System',
                    'artefact': artefact['display_name'],
                    'message': 'Can not configure RAC database with LVM.',
                    'element': 'database_edition'
                }
                self.results['errors'].append(error)
            # Check RAC / LVM
            if artefact['hostname'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Database System',
                    'artefact': artefact['display_name'],
                    'message': 'Hostname must be specified.',
                    'element': 'hostname'
                }
                self.results['errors'].append(error)

    # Dhcp Options
    def validateDhcpOptions(self):
        for resource in self.okit_json.get('dhcp_options', []):
            logger.info('Validating {!s}'.format(resource['display_name']))
            defaults = [resource.get('default', False) and r.get('default', False) and r['id'] != resource['id'] and r['vcn_id'] == resource['vcn_id'] for r in self.okit_json.get('dhcp_options', [])]
            if any(defaults):
                error = {
                    'id': resource['id'],
                    'type': 'Dhcp Option',
                    'artefact': resource['display_name'],
                    'message': f'Multiple Dhcp Options specified as default {" ".join([r["display_name"] for r in self.okit_json.get("dhcp_options", []) if r.get("default", False) and r["id"] != resource["id"] and r["vcn_id"] != resource["vcn_id"]])}.',
                    'element': 'default'
                }
                self.results['errors'].append(error)              

    # Dynamic Routing Gateway
    def validateDynamicRoutingGateways(self):
        for artefact in self.okit_json.get('dynamic_routing_gateways', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))

    # Fast Connect
    def validateFastConnects(self):
        for artefact in self.okit_json.get('fast_connects', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))

    # File Storage
    def validateFileStorageSystems(self):
        for artefact in self.okit_json.get('file_storage_systems', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))

    # Instances
    def validateInstances(self):
        for artefact in self.okit_json.get('instances', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            # Check ssh Key
            if artefact['metadata']['ssh_authorized_keys'] == '':
                warning = {
                    'id': artefact['id'],
                    'type': 'Instance',
                    'artefact': artefact['display_name'],
                    'message': 'No Public Keys specified.',
                    'element': 'ssh_authorized_keys'
                }
                self.results['warnings'].append(warning)
            # Check Hostname
            if artefact.get('primary_vnic', {}).get('hostname_label', '') == '':
                self.valid = False
                warning = {
                    'id': artefact['id'],
                    'type': 'Instance',
                    'artefact': artefact['display_name'],
                    'message': 'Hostname should be specified.',
                    'element': 'hostname_label'
                }
                self.results['warnings'].append(warning)
            for vnic in artefact['vnics']:
                if vnic['subnet_id'] == '':
                    self.valid = False
                    error = {
                        'id': artefact['id'],
                        'type': 'Instance',
                        'artefact': artefact['display_name'],
                        'message': 'VNIC Must be connected to Subnet.',
                        'element': 'subnet_id'
                    }
                    self.results['errors'].append(error)
            # Check Boot volume size
            if int(artefact['source_details']['boot_volume_size_in_gbs']) < 50 or int(artefact['source_details']['boot_volume_size_in_gbs']) > 32768:
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Instance',
                    'artefact': artefact['display_name'],
                    'message': f'Boot Volume Size must between 50GB and 32,768GB',
                    'element': 'boot_volume_size_in_gbs'
                }
                self.results['errors'].append(error)

    # Internet Gateways
    def validateInternetGateways(self):
        for artefact in self.okit_json.get('internet_gateways', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))

    # IPSec Connection
    def validateIPSecConnections(self):
        for artefact in self.okit_json.get('ipsec_connections', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            if artefact['static_routes'] is None or artefact['static_routes'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'IPSec Connection',
                    'artefact': artefact['display_name'],
                    'message': 'Static Routes must be specified.',
                    'element': 'static_routes'
                }
                self.results['errors'].append(error)
            if artefact['drg_id'] is None or artefact['drg_id'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'IPSec Connection',
                    'artefact': artefact['display_name'],
                    'message': 'DRG must be specified.',
                    'element': 'drg_id'
                }
                self.results['errors'].append(error)
            if artefact['cpe_id'] is None or artefact['cpe_id'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'IPSec Connection',
                    'artefact': artefact['display_name'],
                    'message': 'Customer Premise must be specified.',
                    'element': 'cpe_id'
                }
                self.results['errors'].append(error)

    # Load Balancers
    def validateLoadBalancers(self):
        for artefact in self.okit_json.get('load_balancers', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            if len(artefact['instance_ids']) == 0:
                warning = {
                    'id': artefact['id'],
                    'type': 'Load Balancer',
                    'artefact': artefact['display_name'],
                    'message': 'No Backend Instances have been specified.',
                    'element': 'instance_ids'
                }
                self.results['warnings'].append(warning)

    # Local Peering Gateways
    def validateLocalPeeringGateways(self):
        for artefact in self.okit_json.get('local_peering_gateways', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            # Check Peer Id
            if artefact['peer_id'] == '':
                warning = {
                    'id': artefact['id'],
                    'type': 'Local Peering Gateway',
                    'artefact': artefact['display_name'],
                    'message': 'Peer not specified.',
                    'element': 'peer_id'
                }
                self.results['warnings'].append(warning)
            # Check Route Table Id
            if artefact['route_table_id'] == '':
                info = {
                    'id': artefact['id'],
                    'type': 'Local Peering Gateway',
                    'artefact': artefact['display_name'],
                    'message': 'Route Table not specified.',
                    'element': 'route_table_id'
                }
                self.results['info'].append(info)
            else:
                for route_table in self.okit_json.get('route_tables', []):
                    if route_table['id'] == artefact['route_table_id']:
                        for rule in route_table['route_rules']:
                            if rule['target_type'] not in ['dynamic_routing_gateways', 'private_ips']:
                                error = {
                                    'id': artefact['id'],
                                    'type': 'Local Peering Gateway',
                                    'artefact': artefact['display_name'],
                                    'message': 'A route table that is associated with an LPG can have only rules that target a DRG or a private IP.',
                                    'element': 'route_table_id'
                                }
                                self.results['errors'].append(error)

    # MySql Database Systems
    def validateMySqlDatabaseSystems(self):
        for artefact in self.okit_json.get('mysql_database_systems', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            # Check Admin Username
            if artefact['admin_username'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'MySQL Database System',
                    'artefact': artefact['display_name'],
                    'message': 'Admin Username is required.',
                    'element': 'admin_username'
                }
                self.results['errors'].append(error)
            # Check Hostname
            if artefact['admin_password'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'MySQL Database System',
                    'artefact': artefact['display_name'],
                    'message': 'Admin Password must be specified.',
                    'element': 'admin_password'
                }
                self.results['errors'].append(error)

    # NAT Gateways
    def validateNATGateways(self):
        for artefact in self.okit_json.get('nat_gateways', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))

    # Network Security Groups
    def validateNetworkSecurityGroups(self):
        for artefact in self.okit_json.get('network_security_groups', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))

    # Object Storage
    def validateObjectStorageBuckets(self):
        for artefact in self.okit_json.get('object_storage_buckets', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))

    # Remote Peering Connection
    def validateRemotePeeringConnections(self):
        for artefact in self.okit_json.get('remote_peering_connections', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            if artefact['drg_id'] is None or artefact['drg_id'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Remote Peering Connection',
                    'artefact': artefact['display_name'],
                    'message': 'DRG must be specified.',
                    'element': 'drg_id'
                }
                self.results['errors'].append(error)

    # Route Tables
    def validateRouteTables(self):
        for resource in self.okit_json.get('route_tables', []):
            logger.info('Validating {!s}'.format(resource['display_name']))
            if len(resource['route_rules']) == 0:
                warning = {
                    'id': resource['id'],
                    'type': 'Route Table',
                    'artefact': resource['display_name'],
                    'message': 'No Rules have been specified.',
                    'element': 'route_rules'
                }
                self.results['warnings'].append(warning)
            else:
                for rule in resource['route_rules']:
                    if rule['network_entity_id'] == '':
                        error = {
                            'id': resource['id'],
                            'type': 'Route Table',
                            'artefact': resource['display_name'],
                            'message': f'Network Entity has not be specified for {" ".join(rule["target_type"].split("_")).title()} rule.',
                            'element': 'route_rules'
                        }
                        self.results['errors'].append(error)
            defaults = [resource.get('default', False) and r.get('default', False) and r['id'] != resource['id'] and r['vcn_id'] == resource['vcn_id'] for r in self.okit_json.get('route_tables', [])]
            if any(defaults):
                error = {
                    'id': resource['id'],
                    'type': 'Route Table',
                    'artefact': resource['display_name'],
                    'message': f'Multiple Route Tables specified as default {" ".join([r["display_name"] for r in self.okit_json.get("route_tables", []) if r.get("default", False) and r["id"] != resource["id"] and r["vcn_id"] != resource["vcn_id"]])}.',
                    'element': 'default'
                }
                self.results['errors'].append(error)              

    # Security Lists
    def validateSecurityLists(self):
        for resource in self.okit_json.get('security_lists', []):
            logger.info('Validating {!s}'.format(resource['display_name']))
            if len(resource['egress_security_rules']) == 0:
                warning = {
                    'id': resource['id'],
                    'type': 'Security List',
                    'artefact': resource['display_name'],
                    'message': 'No Egress Rules have been specified.',
                    'element': 'egress_security_rules'
                }
                self.results['warnings'].append(warning)
            if len(resource['ingress_security_rules']) == 0:
                warning = {
                    'id': resource['id'],
                    'type': 'Security List',
                    'artefact': resource['display_name'],
                    'message': 'No Ingress Rules have been specified.',
                    'element': 'ingress_security_rules'
                }
                self.results['warnings'].append(warning)
            defaults = [resource.get('default', False) and r.get('default', False) and r['id'] != resource['id'] and r['vcn_id'] == resource['vcn_id'] for r in self.okit_json.get('security_lists', [])]
            if any(defaults):
                error = {
                    'id': resource['id'],
                    'type': 'Security List',
                    'artefact': resource['display_name'],
                    'message': f'Multiple Security Lists specified as default {" ".join([r["display_name"] for r in self.okit_json.get("security_lists", []) if r.get("default", False) and r["id"] != resource["id"] and r["vcn_id"] != resource["vcn_id"]])}.',
                    'element': 'default'
                }
                self.results['errors'].append(error)              

    # Service Gateways
    def validateServiceGateways(self):
        for artefact in self.okit_json.get('service_gateways', []):
            logger.info('Validating {!s}'.format(artefact['display_name']))

    # Subnets
    def validateSubnets(self):
        vcn_cidr_map = {}
        for vcn in self.okit_json.get('virtual_cloud_networks', []):
            vcn_cidr_map[vcn['id']] = vcn['cidr_blocks']
        for artefact in sorted(self.okit_json.get('subnets', []), key=lambda k: k['vcn_id']):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            # Check Connected to a VCN
            if artefact['vcn_id'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Subnet',
                    'artefact': artefact['display_name'],
                    'message': 'Subnet is not part of a VCN.',
                    'element': 'vcn_id'
                }
                self.results['errors'].append(error)
            # Check that CIDR exists
            if artefact['cidr_block'] == '':
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Subnet',
                    'artefact': artefact['display_name'],
                    'message': 'Subnet does not have a CIDR.',
                    'element': 'cidr_block'
                }
                self.results['errors'].append(error)
            else:
                # Check if part of VCN CIDR
                if not self.subnet_of(vcn_cidr_map[artefact['vcn_id']], artefact['cidr_block']):
                    self.valid = False
                    error = {
                        'id': artefact['id'],
                        'type': 'Subnet',
                        'artefact': artefact['display_name'],
                        'message': 'Subnet CIDR {!s} is not part of VCN CIDR {!s}.'.format(artefact['cidr_block'],
                                                                                           vcn_cidr_map[artefact['vcn_id']]),
                        'element': 'cidr_block'
                    }
                    self.results['errors'].append(error)
                # Check for Subnet Overlap
                for other in [s for s in self.okit_json.get('subnets', []) if s['vcn_id'] == artefact['vcn_id'] and s['id'] != artefact['id']]:
                    if other['cidr_block'] != '' and self.overlaps(artefact['cidr_block'], other['cidr_block']):
                        self.valid = False
                        error = {
                            'id': artefact['id'],
                            'type': 'Subnet',
                            'artefact': artefact['display_name'],
                            'message': 'Subnet CIDR {!s} overlaps Subnet {!s} CIDR {!s}.'.format(artefact['cidr_block'],
                                                                                                 other['display_name'],
                                                                                                 other['cidr_block']),
                            'element': 'cidr_block'
                        }
                        self.results['errors'].append(error)
            # Check Route Table
            if (artefact['route_table_id'] == ''):
                warning = {
                    'id': artefact['id'],
                    'type': 'Subnet',
                    'artefact': artefact['display_name'],
                    'message': 'Subnet has no Route Table Assigned.',
                    'element': 'route_table_id'
                }
                self.results['warnings'].append(warning)
            # Check Security Lists
            if (len(artefact['security_list_ids']) == 0):
                warning = {
                    'id': artefact['id'],
                    'type': 'Subnet',
                    'artefact': artefact['display_name'],
                    'message': 'Subnet has no Security Lists Assigned.',
                    'element': 'security_list_ids'
                }
                self.results['warnings'].append(warning)

    # Virtual Cloud Networks
    def validateVirtualCloudNetworks(self):
        for artefact in sorted(self.okit_json.get('virtual_cloud_networks', []), key=lambda k: k['compartment_id']):
            logger.info('Validating {!s}'.format(artefact['display_name']))
            # Check that CIDR exists
            if len(artefact['cidr_blocks']) == 0:
                self.valid = False
                error = {
                    'id': artefact['id'],
                    'type': 'Virtual Cloud Network',
                    'artefact': artefact['display_name'],
                    'message': 'Virtual Cloud Network does not have a CIDR.',
                    'element': 'cidr_blocks'
                }
                self.results['errors'].append(error)
            else:
                # Check for CIDR Overlap
                for other in [s for s in self.okit_json.get('virtual_cloud_networks', []) if s['compartment_id'] == artefact['compartment_id'] and s['id'] != artefact['id']]:
                    if len(other['cidr_blocks']) > 0:
                        for cidr_block in artefact['cidr_blocks']:
                            for other_cidr_block in other['cidr_blocks']:
                                if self.overlaps(cidr_block, other_cidr_block):
                                    self.valid = False
                                    error = {
                                        'id': artefact['id'],
                                        'type': 'Virtual Cloud Network',
                                        'artefact': artefact['display_name'],
                                        'message': 'VCN CIDR {!s} overlaps VCN {!s} CIDR {!s}.'.format(cidr_block, other['display_name'], other_cidr_block),
                                        'element': 'cidr_blocks'
                                    }
                                    self.results['errors'].append(error)

    # Network Methods
    def subnet_of(self, supernets, subnet):
        try:
            return any([ipaddress.ip_network(subnet) in ipaddress.ip_network(supernet).subnets(new_prefix=int(subnet.split('/')[-1])) for supernet in supernets])
            # return ipaddress.ip_network(subnet) in ipaddress.ip_network(supernet).subnets(new_prefix=int(subnet.split('/')[-1]))
        except ValueError:
            return False

    def overlaps(self, subnet1, subnet2):
        try:
            return ipaddress.ip_network(subnet1).overlaps(ipaddress.ip_network(subnet2))
        except ValueError:
            return False
