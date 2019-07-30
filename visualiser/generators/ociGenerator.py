# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "ociGenerator"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import datetime
import getopt
import jinja2
import json
import locale
import logging
import operator
import os
import requests
import shutil
import sys

from common.ociValidation import validateVisualiserJson
from common.ociExceptions import ValidationException
from common.ociCommon import readJsonFile
from common.ociCommon import readYamlFile
from common.ociCommon import writeTerraformFile
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()

class OCIGenerator(object):
    def __init__(self, template_dir, output_dir, visualiser_json):
        # Initialise generator output data variables
        self.create_sequence = []
        self.run_variables = {}
        self.data_output = []
        # Assign passed values to local
        self.template_dir = template_dir
        self.output_dir = output_dir
        self.visualiser_json = visualiser_json
        # Check output directory
        self.getCheckOutputDirectory()
        # Read common variables
        self.variables_yml_file = os.path.join(template_dir, 'variables.yml')
        self.jinja2_variables = readYamlFile(self.variables_yml_file)
        # -- Add Common variables to run variables
        for key in self.jinja2_variables.keys():
            self.run_variables[key] = ''
        # -- Add Standard Author / Copyright variables
        self.jinja2_variables["author"] = __author__
        self.jinja2_variables["copyright"] = __copyright__
        # Initialise Jinja2
        self.template_loader = jinja2.FileSystemLoader(searchpath=template_dir)
        self.jinja2_environment = jinja2.Environment(loader=self.template_loader, trim_blocks=True, lstrip_blocks=True)

    def getCheckOutputDirectory(self):
        if not os.path.exists(self.output_dir):
            logger.warn('Output directory {0:s} does not exist; will create.'.format(self.output_dir))
            os.makedirs(self.output_dir)
        elif not os.path.isdir(self.output_dir):
            logger.error('Output directory {0:s} is not a directory'.format(self.output_dir))

    def getRenderedMain(self):
        return self.create_sequence

    def getVariables(self):
        return self.run_variables

    def getRenderedOutput(self):
        return self.create_sequence

    def writeFiles(self):
        pass

    def formatJinja2Variable(self, variable_name):
        pass

    def formatJinja2IdReference(self, resource_name):
        pass

    def formatJinja2DhcpReference(self, resource_name):
        pass

    def generate(self):
        # Validate input json
        validateVisualiserJson(self.visualiser_json)
        # Process Provider Connection information
        logger.info("Processing Provider Information")
        jinja2_template = self.jinja2_environment.get_template("provider.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])

        # Process Regional Data
        logger.info("Processing Region Information")
        jinja2_template = self.jinja2_environment.get_template("region_data.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])

        # Process keys within the input json file
        compartment = self.visualiser_json.get('compartment', self.visualiser_json)
        # -- Virtual Cloud Networks
        for virtual_cloud_network in compartment.get('virtual_cloud_networks', []):
            self.renderVirtualCloudNetworks(virtual_cloud_network)
        # -- Internet Gateways
        for internet_gateway in compartment.get('internet_gateways', []):
            self.renderInternetGateway(internet_gateway)
        # -- NAT Gateways
        # -- Dynamic Routing Gateways
        # -- Security Lists
        for security_list in compartment.get('security_lists', []):
            self.renderSecurityList(security_list)
        # -- Route Tables
        for route_table in compartment.get('route_tables', []):
            self.renderRouteTable(route_table)
        # -- Subnet
        for subnet in compartment.get('subnets', []):
            self.renderSubnet(subnet)
        # -- Instances
        for instance in compartment.get('instances', []):
            self.renderInstance(instance)
        # -- Loadbalancers
        for loadbalancer in compartment.get('loadbalancers', []):
            self.renderLoadbalancer(loadbalancer)

        return

    def renderVirtualCloudNetworks(self, virtual_cloud_network):
        # Read Data
        standardisedName = self.standardiseResourceName(virtual_cloud_network['display_name'])
        # resourceName = 'VirtualCloudNetwork_{0:s}'.format(standardisedName)
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = virtual_cloud_network['display_name']
        # Process Virtual Cloud Networks Data
        logger.info("Processing Virtual Cloud Network Information")
        # -- Define Variables
        # ---- CIDR Block
        variableName = '{0:s}_cidr_block'.format(standardisedName)
        self.jinja2_variables["cidr_block"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = virtual_cloud_network["cidr_block"]
        # ---- Display Name
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = virtual_cloud_network["display_name"]
        # ---- DNS Label
        variableName = '{0:s}_dns_label'.format(standardisedName)
        self.jinja2_variables["dns_label"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = virtual_cloud_network["dns_label"]
        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("virtual_cloud_network.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        # Generate Reference string for id
        virtual_cloud_network_ocid_ref = self.formatJinja2IdReference(resourceName)
        return

    def renderInternetGateway(self, internet_gateway):
        # Read Data
        standardisedName = self.standardiseResourceName(internet_gateway['display_name'])
        # resourceName = 'InternetGateway_{0:s}'.format(standardisedName)
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = internet_gateway['display_name']
        # Process Internet Gateway Data
        logger.info("Processing Internet Gateway Information")
        # -- Define Variables
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(internet_gateway['virtual_cloud_network']))
        # ---- Display Name
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = internet_gateway["display_name"]
        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("internet_gateway.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderSecurityList(self, security_list):
        # Read Data
        standardisedName = self.standardiseResourceName(security_list['display_name'])
        # resourceName = 'SecurityList_{0:s}'.format(standardisedName)
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = security_list['display_name']
        # Process Security List Data
        logger.info("Processing Security List Information")
        # -- Define Variables
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(security_list['virtual_cloud_network']))
        # ---- Display Name
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = security_list["display_name"]
        # ---- Egress Rules
        rule_number = 1
        jinja2_egress_rules = []
        for egress_rule in security_list.get('egress_rules', []):
            # ------ Protocol
            variableName = '{0:s}_egress_rule_{1:02d}_protocol'.format(standardisedName, rule_number)
            self.run_variables[variableName] = egress_rule["protocol"]
            jinja2_egress_rule = {
                "protocol": self.formatJinja2Variable(variableName)
            }
            # ------ Destination
            variableName = '{0:s}_egress_rule_{1:02d}_destination'.format(standardisedName, rule_number)
            self.run_variables[variableName] = egress_rule["destination"]
            jinja2_egress_rule["destination"] = self.formatJinja2Variable(variableName)
            # ------ Destination Type
            variableName = '{0:s}_egress_rule_{1:02d}_destination_type'.format(standardisedName, rule_number)
            self.run_variables[variableName] = egress_rule["destination_type"]
            jinja2_egress_rule["destination_type"] = self.formatJinja2Variable(variableName)
            # Add to Egress Rules used for Jinja template
            jinja2_egress_rules.append(jinja2_egress_rule)
            # Increment rule number
            rule_number += 1
        self.jinja2_variables["egress_rules"] = jinja2_egress_rules
        # ---- Ingress Rules
        rule_number = 1
        jinja2_ingress_rules = []
        for ingress_rule in security_list.get('ingress_rules', []):
            # ------ Protocol
            variableName = '{0:s}_ingress_rule_{1:02d}_protocol'.format(standardisedName, rule_number)
            self.run_variables[variableName] = ingress_rule["protocol"]
            jinja2_ingress_rule = {
                "protocol": self.formatJinja2Variable(variableName)
            }
            # ------ Source
            variableName = '{0:s}_ingress_rule_{1:02d}_source'.format(standardisedName, rule_number)
            self.run_variables[variableName] = ingress_rule["source"]
            jinja2_ingress_rule["source"] = self.formatJinja2Variable(variableName)
            # Add to Egress Rules used for Jinja template
            jinja2_ingress_rules.append(jinja2_ingress_rule)
            # Increment rule number
            rule_number += 1
        self.jinja2_variables["ingress_rules"] = jinja2_ingress_rules
        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("security_list.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderRouteTable(self, route_table):
        # Read Data
        standardisedName = self.standardiseResourceName(route_table['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = route_table['display_name']
        # Process Route Table Data
        logger.info("Processing Route Table Information")
        # -- Define Variables
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(route_table['virtual_cloud_network']))
        # ---- Display Name
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = route_table["display_name"]
        # ---- Route Rules
        rule_number = 1
        jinja2_route_rules = []
        for route_rule in route_table.get('route_rules', []):
            # ------ Network End Point
            variableName = '{0:s}_route_rule_{1:02d}_network_entity_id'.format(standardisedName, rule_number)
            self.run_variables[variableName] = route_rule["network_entity_id"]
            jinja2_route_rule = {
                "network_entity_id": self.formatJinja2IdReference(self.standardiseResourceName(route_rule["network_entity_id"]))
            }
            # ------ Destination
            variableName = '{0:s}_route_rule_{1:02d}_destination'.format(standardisedName, rule_number)
            self.run_variables[variableName] = route_rule["destination"]
            jinja2_route_rule["destination"] = self.formatJinja2Variable(variableName)
            # ------ Destination Type
            variableName = '{0:s}_route_rule_{1:02d}_destination_type'.format(standardisedName, rule_number)
            self.run_variables[variableName] = route_rule["destination_type"]
            jinja2_route_rule["destination_type"] = self.formatJinja2Variable(variableName)
            # Add to Egress Rules used for Jinja template
            jinja2_route_rules.append(jinja2_route_rule)
            # Increment rule number
            rule_number += 1
        self.jinja2_variables["route_rules"] = jinja2_route_rules
        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("route_table.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderSubnet(self, subnet):
        # Read Data
        standardisedName = self.standardiseResourceName(subnet['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = subnet['display_name']
        # Process Subnet Data
        logger.info("Processing Subnet Information")
        # -- Define Variables
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(subnet['virtual_cloud_network']))
        # ---- Display Name
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = subnet["display_name"]
        # ---- CIDR Block
        variableName = '{0:s}_cidr_block'.format(standardisedName)
        self.jinja2_variables["cidr_block"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = subnet["cidr_block"]
        # ---- DNS Label
        variableName = '{0:s}_dns_label'.format(standardisedName)
        self.jinja2_variables["dns_label"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = subnet["dns_label"]
        # ---- Route Table
        self.jinja2_variables["route_table_id"] = self.formatJinja2IdReference(self.standardiseResourceName(subnet['route_table']))
        # ---- Security Lists
        jinja2_security_list_ids = []
        for security_list in subnet.get('security_lists', []):
            jinja2_security_list_ids.append(self.formatJinja2IdReference(self.standardiseResourceName(security_list)))
        self.jinja2_variables["security_list_ids"] = ','.join(jinja2_security_list_ids)
        self.jinja2_variables["security_list_ids"] = jinja2_security_list_ids
        # ---- DHCP Options
        if 'dhcp_options' in subnet:
            self.jinja2_variables["dhcp_options_id"] = self.formatJinja2DhcpReference(self.standardiseResourceName(subnet['dhcp_options']))
        else:
            self.jinja2_variables["dhcp_options_id"] = self.formatJinja2DhcpReference(self.standardiseResourceName(subnet['virtual_cloud_network']))
        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("subnet.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderInstance(self, instance):
        # Read Data
        standardisedName = self.standardiseResourceName(instance['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = instance['display_name']
        # Process Subnet Data
        logger.info("Processing Instance Information")
        # -- Define Variables
        # ---- Display Name
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["display_name"]
        # ---- Hostame
        variableName = '{0:s}_hostname'.format(standardisedName)
        self.jinja2_variables["hostname"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["hostname"]
        # ---- Shape
        variableName = '{0:s}_shape'.format(standardisedName)
        self.jinja2_variables["shape"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["shape"]
        # ---- Operating System
        variableName = '{0:s}_os'.format(standardisedName)
        self.jinja2_variables["os"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["os"]
        # ---- Operating System Version
        variableName = '{0:s}_os_version'.format(standardisedName)
        self.jinja2_variables["os_version"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["version"]
        # ---- Network OCID
        self.jinja2_variables["subnet_id"] = self.formatJinja2IdReference(self.standardiseResourceName(instance['subnet']))
        # ---- Authorised Public SSH Keys
        variableName = '{0:s}_authorized_keys'.format(standardisedName)
        self.jinja2_variables["authorized_keys"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["authorized_keys"]
        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("instance.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderLoadbalancer(self, loadbalancer):
        # Read Data
        standardisedName = self.standardiseResourceName(loadbalancer['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = loadbalancer['display_name']
        # Process Subnet Data
        logger.info("Processing Loadbalancer Information")
        # -- Define Variables
        # ---- Display Name
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = loadbalancer["display_name"]
        # ---- Shape
        variableName = '{0:s}_shape'.format(standardisedName)
        self.jinja2_variables["shape"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = loadbalancer["shape"]
        # ---- Subnets
        jinja2_subnet_ids = []
        for subnet in loadbalancer.get('subnets', []):
            jinja2_subnet_ids.append(self.formatJinja2IdReference(self.standardiseResourceName(subnet)))
        self.jinja2_variables["loadbalancer_subnet_ids"] = jinja2_subnet_ids
        # ---- Backend Instances
        jinja2_backend_instances_resource_names = []
        for backend_instance in loadbalancer.get('backend_instances', []):
            jinja2_backend_instances_resource_names.append(self.standardiseResourceName(backend_instance))
        self.jinja2_variables["backend_instances"] = jinja2_backend_instances_resource_names
        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("loadbalancer.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def standardiseResourceName(self, name):
        # split() will generate a list with no empty values thus join of this will remove all whitespace
        standardised_name = ''.join(name.title().split())
        return standardised_name

    def createZip(self):
        # Zip Release Directory
        releasedir = os.path.join(self.jiradir, 'release')
        logger.info('Generating release zip files for JIRA directory %s.', self.jiradir)
        archivename = '{0:s}_cm{1:s}_{2:s}'.format(str(self.jirajson["client"]).title().replace(' ','_'), str(self.jirajson['racks'][0]["ak_number"]), str(time.strftime("%Y%m%d-%H%M")))
        archivename = os.path.join(self.jiradir, archivename.replace(' ', ''))
        logger.info('Archive Name: %s.zip', archivename)
        self.createZipArchive(releasedir, archivename)
        zipname = '{0:s}.zip'.format(str(archivename))
        return zipname

    def createZipArchive(self, dir, archivename):
        shutil.make_archive(archivename, 'zip', dir)
        zipname = '{0:s}.zip'.format(str(archivename))
        return zipname
