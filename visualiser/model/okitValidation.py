#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
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
        self.results = {'errors': [], 'warnings': []}
        self.valid = True

    def validate(self):
        logger.info('Validating OKIT Json')
        self.validateVirtualCloudNetworks()
        self.validateSubnets()
        return self.valid

    def getResults(self):
        return self.results

    # Subnets
    def validateSubnets(self):
        vcn_cidr_map = {}
        for vcn in self.okit_json.get('virtual_cloud_networks', []):
            vcn_cidr_map[vcn['id']] = vcn['cidr_block']
        for subnet in sorted(self.okit_json.get('subnets', []), key=lambda k: k['vcn_id']):
            # Check that CIDR exists
            if subnet['cidr_block'] == '':
                self.valid = False
                error = {
                    'type': 'Subnet',
                    'artefact': subnet['display_name'],
                    'message': 'Subnet does not have a CIDR.'
                }
                self.results['errors'].append(error)
            else:
                # Check if part of VCN CIDR
                if not self.subnet_of(vcn_cidr_map[subnet['vcn_id']], subnet['cidr_block']):
                    self.valid = False
                    error = {
                        'type': 'Subnet',
                        'artefact': subnet['display_name'],
                        'message': 'Subnet CIDR {!s} is not part of VCN CIDR {!s}.'.format(subnet['cidr_block'],
                                                                                           vcn_cidr_map[subnet['vcn_id']])
                    }
                    self.results['errors'].append(error)
                # Check for Subnet Overlap
                for other in [s for s in self.okit_json.get('subnets', []) if s['vcn_id'] == subnet['vcn_id'] and s['id'] != subnet['id']]:
                    if other['cidr_block'] != '' and self.overlaps(subnet['cidr_block'], other['cidr_block']):
                        self.valid = False
                        error = {
                            'type': 'Subnet',
                            'artefact': subnet['display_name'],
                            'message': 'Subnet CIDR {!s} overlaps Subnet {!s} CIDR {!s}.'.format(subnet['cidr_block'],
                                                                                                 other['display_name'],
                                                                                                 other['cidr_block'])
                        }
                        self.results['errors'].append(error)
            # Check Route Table
            if (subnet['route_table_id'] == ''):
                warning = {
                    'type': 'Subnet',
                    'artefact': subnet['display_name'],
                    'message': 'Subnet has no Route Table Assigned.'
                }
                self.results['warnings'].append(warning)
            # Check Security Lists
            if (len(subnet['security_list_ids']) == 0):
                warning = {
                    'type': 'Subnet',
                    'artefact': subnet['display_name'],
                    'message': 'Subnet has no Security Lists Assigned.'
                }
                self.results['warnings'].append(warning)

    # Virtual Cloud Networks
    def validateVirtualCloudNetworks(self):
        for vcn in sorted(self.okit_json.get('virtual_cloud_networks', []), key=lambda k: k['compartment_id']):
            # Check that CIDR exists
            if vcn['cidr_block'] == '':
                self.valid = False
                error = {
                    'type': 'Virtual Cloud Network',
                    'artefact': vcn['display_name'],
                    'message': 'Virtual Cloud Network does not have a CIDR.'
                }
                self.results['errors'].append(error)
            else:
                # Check for CIDR Overlap
                for other in [s for s in self.okit_json.get('virtual_cloud_networks', []) if s['compartment_id'] == vcn['compartment_id'] and s['id'] != vcn['id']]:
                    if other['cidr_block'] != '' and self.overlaps(vcn['cidr_block'], other['cidr_block']):
                        self.valid = False
                        error = {
                            'type': 'Virtual Cloud Network',
                            'artefact': vcn['display_name'],
                            'message': 'VCN CIDR {!s} overlaps VCN {!s} CIDR {!s}.'.format(vcn['cidr_block'],
                                                                                                 other['display_name'],
                                                                                                 other['cidr_block'])
                        }
                        self.results['errors'].append(error)

    # Network Methods
    def subnet_of(self, supernet, subnet):
        try:
            return ipaddress.ip_network(subnet) in ipaddress.ip_network(supernet).subnets(new_prefix=int(subnet.split('/')[-1]))
        except ValueError:
            return False

    def overlaps(self, subnet1, subnet2):
        try:
            return ipaddress.ip_network(subnet1).overlaps(ipaddress.ip_network(subnet2))
        except ValueError:
            return False
