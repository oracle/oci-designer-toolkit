
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2020, Oracle and/or its affiliates."
__version__ = "1.0.0.0"
__module__ = "ociGenerator"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import jinja2
import os
import shutil

from common.ociCommon import readYamlFile
from common.ociLogging import getLogger
from common.ociValidation import validateVisualiserJson

# Configure logging
logger = getLogger()

class OCIGenerator(object):
    def __init__(self, template_dir, output_dir, visualiser_json, use_vars=True):
        # Initialise generator output data variables
        self.create_sequence = []
        self.run_variables = {}
        self.data_output = []
        # Assign passed values to local
        self.template_dir = template_dir
        self.output_dir = output_dir
        self.visualiser_json = visualiser_json
        self.use_vars = use_vars
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
        self.jinja2_environment = jinja2.Environment(loader=self.template_loader, trim_blocks=True, lstrip_blocks=True, autoescape=True)
        # Initialise working variables
        self.id_name_map = {}


    def get(self, artifact_type, id):
        artifact = {};
        for artifact in self.visualiser_json.get(artifact_type, []):
            if artifact['id'] == id:
                break;
        return artifact

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

    def formatJinja2Value(self, value):
        pass

    def buildIdNameMap(self):
        logger.info("Build Id/Name Map")
        self.id_name_map = {}
        for key, value in self.visualiser_json.items():
            if isinstance(value, list):
                for asset in value:
                    self.id_name_map[self.formatOcid(asset["id"])] = asset.get("display_name", asset.get("name", "Unknown"))
        return

    def formatOcid(self, id):
        return id

    def generate(self):
        # Validate input json
        validateVisualiserJson(self.visualiser_json)
        # Build the Id to Name Map
        self.buildIdNameMap()
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
        # - Compartment Sub Components
        # -- Compartments
        # --- Get List of Compartment Ids
        compartment_ids = [compartment['id'] for compartment in self.visualiser_json.get('compartments', [])]
        logger.info('Compartment Ids {0!s:s}'.format(compartment_ids))
        for compartment in self.visualiser_json.get('compartments', []):
            compartment['root_compartment'] = (compartment.get('compartment_id', 'ROOT') not in compartment_ids)
            logger.info('Compartment {0!s:s}'.format(compartment))
            self.renderCompartment(compartment)
        # -- Virtual Cloud Networks
        for virtual_cloud_network in self.visualiser_json.get('virtual_cloud_networks', []):
            self.renderVirtualCloudNetwork(virtual_cloud_network)
        # -- Block Storage Volumes
        for block_storage_volume in self.visualiser_json.get('block_storage_volumes', []):
            self.renderBlockStorageVolume(block_storage_volume)
        # -- Object Storage Buckets
        for object_storage_bucket in self.visualiser_json.get('object_storage_buckets', []):
            self.renderObjectStorageBucket(object_storage_bucket)
        # -- Autonomous Databases
        for autonomous_database in self.visualiser_json.get('autonomous_databases', []):
            self.renderAutonomousDatabase(autonomous_database)

        # - Virtual Cloud Network Sub Components
        # -- Internet Gateways
        for internet_gateway in self.visualiser_json.get('internet_gateways', []):
            self.renderInternetGateway(internet_gateway)
        # -- NAT Gateways
        for nat_gateway in self.visualiser_json.get('nat_gateways', []):
            self.renderNATGateway(nat_gateway)
        # -- Dynamic Routing Gateways
        for dynamic_routing_gateway in self.visualiser_json.get('dynamic_routing_gateways', []):
            self.renderDynamicRoutingGateway(dynamic_routing_gateway)
        # -- Network Security Group
        for network_security_group in self.visualiser_json.get('network_security_groups', []):
            self.renderNetworkSecurityGroup(network_security_group)
        # -- Security Lists
        for security_list in self.visualiser_json.get('security_lists', []):
            self.renderSecurityList(security_list)
        # -- Route Tables
        for route_table in self.visualiser_json.get('route_tables', []):
            self.renderRouteTable(route_table)
        # -- Service Gateways
        for service_gateway in self.visualiser_json.get('service_gateways', []):
            self.renderServiceGateway(service_gateway)
        # -- Subnet
        for subnet in self.visualiser_json.get('subnets', []):
            self.renderSubnet(subnet)
        # -- Local Peering Gateways
        paired_gateways = []
        for local_peering_gateway in self.visualiser_json.get('local_peering_gateways', []):
            if local_peering_gateway['id'] in paired_gateways:
                local_peering_gateway['peer_id'] = ''
            else:
                paired_gateways.append(local_peering_gateway['peer_id'])
            self.renderLocalPeeringGateway(local_peering_gateway)

        # - Subnet Sub components
        # -- File Storage System
        for file_storage_system in self.visualiser_json.get('file_storage_systems', []):
            self.renderFileStorageSystem(file_storage_system)
        # -- Database Systems
        for database_system in self.visualiser_json.get('database_systems', []):
            self.renderDatabaseSystem(database_system)
        # -- Instances
        for instance in self.visualiser_json.get('instances', []):
            self.renderInstance(instance)
        # -- Loadbalancers
        for loadbalancer in self.visualiser_json.get('load_balancers', []):
            self.renderLoadbalancer(loadbalancer)

        return

    def renderAutonomousDatabase(self, autonomous_database):
        # Read Data
        standardisedName = self.standardiseResourceName(autonomous_database['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = autonomous_database['display_name']
        # Process Autonomous Databases Data
        logger.info('Processing Autonomous Database Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[autonomous_database['compartment_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", autonomous_database["display_name"], standardisedName)
        # ---- DB Name
        self.addJinja2Variable("db_name", autonomous_database["db_name"], standardisedName)
        # ---- Admin Password
        self.addJinja2Variable("admin_password", autonomous_database["admin_password"], standardisedName)
        # ---- Storage Size In TBs
        self.addJinja2Variable("data_storage_size_in_tbs", autonomous_database["data_storage_size_in_tbs"], standardisedName)
        # ---- Core Count
        self.addJinja2Variable("cpu_core_count", autonomous_database["cpu_core_count"], standardisedName)
        # ---- Work Load
        self.addJinja2Variable("db_workload", autonomous_database["db_workload"], standardisedName)
        # ---- Auto Scaling
        self.addJinja2Variable("is_auto_scaling_enabled", autonomous_database["is_auto_scaling_enabled"], standardisedName)
        # ---- Free Tier
        self.addJinja2Variable("is_free_tier", autonomous_database["is_free_tier"], standardisedName)
        # --- Optional
        # ---- Tags
        self.renderTags(autonomous_database)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("autonomous_database.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderBlockStorageVolume(self, block_storage_volume):
        # Read Data
        standardisedName = self.standardiseResourceName(block_storage_volume['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = block_storage_volume['display_name']
        # Process Block Storage Volume Data
        logger.info('Processing Block Storage Volume Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[block_storage_volume['compartment_id']]))
        # ---- Availability Domain
        self.addJinja2Variable("availability_domain", block_storage_volume["availability_domain"], standardisedName)
        # ---- Display Name
        self.addJinja2Variable("display_name", block_storage_volume["display_name"], standardisedName)
        # ---- Backup Policy
        self.addJinja2Variable("backup_policy", block_storage_volume["backup_policy"], standardisedName)
        # ---- Size In GBs
        self.addJinja2Variable("size_in_gbs", block_storage_volume["size_in_gbs"], standardisedName)
        # --- Optional
        # ---- VPU
        self.addJinja2Variable("vpus_per_gb", block_storage_volume["vpus_per_gb"], standardisedName)
        # ---- Tags
        self.renderTags(block_storage_volume)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("block_storage_volume.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderCompartment(self, compartment):
        # Read Data
        standardisedName = self.standardiseResourceName(compartment['name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = compartment['name']
        # Process Virtual Cloud Networks Data
        logger.info('Processing Compartment Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Root Compartment
        self.jinja2_variables["root_compartment"] = compartment["root_compartment"]
        # ---- Parent Compartment Id
        if not compartment["root_compartment"]:
            self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[compartment['compartment_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", compartment["name"], standardisedName)
        # ---- Description
        self.addJinja2Variable("description", compartment.get("description", compartment["name"]), standardisedName)
        # --- Optional
        # ---- Tags
        self.renderTags(compartment)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("compartment.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.info(self.create_sequence[-1])
        logger.debug(self.create_sequence[-1])
        return

    def renderDatabaseSystem(self, database_system):
        # Read Data
        standardisedName = self.standardiseResourceName(database_system['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = database_system['display_name']
        # Process Database System Data
        logger.info('Processing Database System Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[database_system['compartment_id']]))
        # ---- Availability Domain
        self.addJinja2Variable("availability_domain", database_system["availability_domain"], standardisedName)
        # ---- Display Name
        self.addJinja2Variable("display_name", database_system["display_name"], standardisedName)
        # ---- Subnet
        self.jinja2_variables["subnet_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[database_system['subnet_id']]))
        # ---- Database Edition
        self.addJinja2Variable("database_edition", database_system["database_edition"], standardisedName)
        # ---- Hostname
        self.addJinja2Variable("hostname", database_system["hostname"], standardisedName)
        # ---- Shape
        self.addJinja2Variable("shape", database_system["shape"], standardisedName)
        # ---- Public Keys
        self.addJinja2Variable("ssh_public_keys", database_system["ssh_public_keys"], standardisedName)
        # ---- Admin Password
        self.addJinja2Variable("admin_password", database_system["db_home"]["database"]["admin_password"], standardisedName)
        # --- Optional
        # ---- Database Name
        self.addJinja2Variable("db_name", database_system["db_home"]["database"]["db_name"], standardisedName)
        # ---- Database Workload
        self.addJinja2Variable("db_workload", database_system["db_home"]["database"]["db_workload"], standardisedName)
        # ---- Database Version
        self.addJinja2Variable("db_version", database_system["db_home"]["db_version"], standardisedName)
        # ---- Data Storage Size
        self.addJinja2Variable("data_storage_size_in_gb", database_system["data_storage_size_in_gb"], standardisedName)
        # ---- Storage Management
        self.addJinja2Variable("storage_management", database_system["db_system_options"]["storage_management"], standardisedName)
        # ---- Node Count
        self.addJinja2Variable("node_count", database_system["node_count"], standardisedName)
        # ---- CPU Core Count
        if database_system["cpu_core_count"] > 0:
            self.addJinja2Variable("cpu_core_count", database_system["cpu_core_count"], standardisedName)
        else:
            self.removeJinja2Variable("cpu_core_count")
        # ---- Fault Domains
        if len(database_system["fault_domains"]) > 0:
            if isinstance(database_system["fault_domains"], list):
                fault_domains = database_system["fault_domains"]
            else:
                fault_domains = [database_system["fault_domains"]]
            self.addJinja2Variable("fault_domains", fault_domains, standardisedName)
        else:
            self.removeJinja2Variable("fault_domains")
        # ---- Cluster Name
        if str(database_system["cluster_name"]).strip() != '':
            self.addJinja2Variable("cluster_name", database_system["cluster_name"], standardisedName)
        else:
            self.removeJinja2Variable("cluster_name")

        # ---- Tags
        self.renderTags(database_system)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("database_system.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderDynamicRoutingGateway(self, dynamic_routing_gateway):
        # Read Data
        standardisedName = self.standardiseResourceName(dynamic_routing_gateway['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = dynamic_routing_gateway['display_name']
        # Process Dynamic Routing Gateway Data
        logger.info('Processing Dynamic Routing Gateway Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[dynamic_routing_gateway['compartment_id']]))
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[dynamic_routing_gateway['vcn_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", dynamic_routing_gateway["display_name"], standardisedName)
        # --- Optional
        # ---- Tags
        self.renderTags(dynamic_routing_gateway)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("dynamic_routing_gateway.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderFileStorageSystem(self, file_storage_system):
        # Read Data
        standardisedName = self.standardiseResourceName(file_storage_system['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = file_storage_system['display_name']
        # Process Virtual Cloud Networks Data
        logger.info('Processing Block Storage Volume Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[file_storage_system['compartment_id']]))
        # ---- Availability Domain
        self.addJinja2Variable("availability_domain", file_storage_system["availability_domain"], standardisedName)
        # ---- Display Name
        self.addJinja2Variable("display_name", file_storage_system["display_name"], standardisedName)
        # ---- Network OCID
        self.jinja2_variables["subnet_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[file_storage_system['primary_mount_target']['subnet_id']]))
        # ---- Source (CIDR)
        self.addJinja2Variable("source", file_storage_system["primary_export"]["export_options"]["source"], standardisedName)
        # ---- Hostname
        self.addJinja2Variable("hostname_label", file_storage_system['primary_mount_target']["hostname_label"], standardisedName)
        # ---- (Mount) Path
        self.addJinja2Variable("path", file_storage_system["primary_export"]["path"], standardisedName)
        # ---- Require Privileged Source Port
        self.addJinja2Variable("require_privileged_source_port", file_storage_system["primary_export"]["export_options"]["require_privileged_source_port"], standardisedName)
        # ---- Access
        self.addJinja2Variable("access", file_storage_system["primary_export"]["export_options"]["access"], standardisedName)
        # --- Optional
        # ----- Network Security Groups
        if len(file_storage_system['primary_mount_target']["nsg_ids"]):
            self.jinja2_variables["nsg_ids"] = [self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[id])) for id in file_storage_system['primary_mount_target']["nsg_ids"]]
        # ----- Max FS Stat Bytes
        if file_storage_system['primary_mount_target']['export_set']["max_fs_stat_bytes"].strip() != '':
            self.addJinja2Variable("max_fs_stat_bytes", file_storage_system["primary_export"]["export_set"]["max_fs_stat_bytes"], standardisedName)
        # ----- Max FS Stat Files
        if file_storage_system['primary_mount_target']['export_set']["max_fs_stat_files"].strip() != '':
            self.addJinja2Variable("max_fs_stat_files", file_storage_system["primary_export"]["export_set"]["max_fs_stat_files"], standardisedName)
        # ----- Identity Squash
        if file_storage_system["primary_export"]["export_options"]["identity_squash"] != 'NONE':
            # ----- Identity Squash
            self.addJinja2Variable("identity_squash", file_storage_system["primary_export"]["export_options"]["identity_squash"], standardisedName)
            # ----- Identity Squash GID
            self.addJinja2Variable("anonymous_gid", file_storage_system["primary_export"]["export_options"]["anonymous_gid"], standardisedName)
            # ----- Identity Squash UID
            self.addJinja2Variable("anonymous_uid", file_storage_system["primary_export"]["export_options"]["anonymous_uid"], standardisedName)
        # ---- Tags
        self.renderTags(file_storage_system)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("file_storage_system.jinja2")
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
        logger.info('Processing Instance Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[instance['compartment_id']]))
        # ---- Availability Domain
        self.addJinja2Variable("availability_domain", instance["availability_domain"], standardisedName)
        # ---- Display Name
        self.addJinja2Variable("display_name", instance["display_name"], standardisedName)
        # ---- Shape
        self.addJinja2Variable("shape", instance["shape"], standardisedName)
        # ---- Source Details
        # ----- Source Type
        self.addJinja2Variable("source_type", instance["source_details"]["source_type"], standardisedName)
        # ----- Operating System
        self.addJinja2Variable("os", instance["source_details"]["os"], standardisedName)
        # ----- Operating System Version
        self.addJinja2Variable("os_version", instance["source_details"]["version"], standardisedName)
        # ----- Boot Volume Size
        self.addJinja2Variable("boot_volume_size_in_gbs", instance["source_details"]["boot_volume_size_in_gbs"], standardisedName)
        # --- Optional
        # ---- Primary VNIC
        # ----- Subnet OCID
        self.jinja2_variables["subnet_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[instance["vnics"][0]["subnet_id"]]))
        # ----- Display Name (Vnic)
        self.addJinja2Variable("display_name_vnic", '{0!s:s} vnic 00'.format(instance["display_name"]), standardisedName)
        # ---- Hostname
        self.addJinja2Variable("hostname_label", instance["vnics"][0]["hostname_label"], standardisedName)
        # ----- Assign Public IP
        subnet = self.get("subnets", instance["vnics"][0]["subnet_id"])
        self.addJinja2Variable("assign_public_ip", (instance["vnics"][0]["assign_public_ip"] and (not subnet["prohibit_public_ip_on_vnic"])), standardisedName)
        # ----- Skip Source/destination Check
        self.addJinja2Variable("skip_source_dest_check", instance["vnics"][0]["skip_source_dest_check"], standardisedName)
        # ----- Network Security Groups
        if len(instance["vnics"][0]["nsg_ids"]):
            self.jinja2_variables["nsg_ids"] = [self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[id])) for id in instance["vnics"][0]["nsg_ids"]]
        # ---- Metadata
        # ----- Authorised Public SSH Keys
        self.addJinja2Variable("authorized_keys", instance["metadata"]["authorized_keys"], standardisedName)
        # ----- Cloud Init YAML
        self.addJinja2Variable("user_data", instance["metadata"]["user_data"].replace('\n', '\\n').replace('"', '\\"'), standardisedName)
        # ---- Volume Attachments
        attachment_number = 1
        jinja2_volume_attachments = []
        for block_storage_volume_id in instance.get('block_storage_volume_ids', []):
            # ------ Block Storage Volume
            variableName = '{0:s}_volume_attachment_{1:02d}_block_storage_volume_id'.format(standardisedName, attachment_number)
            self.run_variables[variableName] = block_storage_volume_id
            jinja2_volume_attachment = {
                "block_storage_volume_id": self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[block_storage_volume_id]))
            }
            # ---- Display Name
            variableName = '{0:s}_volume_attachment_{1:02d}_display_name'.format(standardisedName, attachment_number)
            self.run_variables[variableName] = '{0!s:s} Volume Attachment {1:02d}'.format(instance["display_name"], attachment_number)
            jinja2_volume_attachment["display_name"] = self.formatJinja2Variable(variableName)
            # Add to Volume Attachments used for Jinja template
            jinja2_volume_attachments.append(jinja2_volume_attachment)
            # Increment attachment number
            attachment_number += 1
        self.jinja2_variables["volume_attachments"] = jinja2_volume_attachments
        # ---- Vnic Attachments
        attachment_number = 1
        jinja2_vnic_attachments = []
        for vnic in instance.get('vnics', [{}])[1:]:
            # ------ Subnet Vnic
            variableName = '{0:s}_vnic_attachment_{1:02d}_subnet_id'.format(standardisedName, attachment_number)
            jinja2_vnic_attachment = {
                "subnet_id": self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[vnic["subnet_id"]]))
            }
            self.run_variables[variableName] = vnic["subnet_id"]
            # ---- Display Name
            variableName = '{0:s}_vnic_attachment_{1:02d}_display_name'.format(standardisedName, attachment_number)
            jinja2_vnic_attachment["display_name"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = '{0!s:s} vnic {1:02d}'.format(instance["display_name"], attachment_number)
            # ---- Hostname
            variableName = '{0:s}_vnic_attachment_{1:02d}_hostname_label'.format(standardisedName, attachment_number)
            jinja2_vnic_attachment["hostname_label"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = vnic["hostname_label"]
            # ----- Assign Public IP
            variableName = '{0!s:s}_vnic_attachment_{1:02d}_assign_public'.format(standardisedName, attachment_number)
            jinja2_vnic_attachment["assign_public_ip"] = self.formatJinja2Variable(variableName)
            subnet = self.get("subnets", vnic["subnet_id"])
            self.run_variables[variableName] = (vnic["assign_public_ip"] and (not subnet["prohibit_public_ip_on_vnic"]))
            # ----- Skip Source/destination Check
            variableName = '{0:s}_vnic_attachment_{1:02d}_skip_src_dst_check'.format(standardisedName, attachment_number)
            jinja2_vnic_attachment["skip_source_dest_check"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = vnic["skip_source_dest_check"]
            # ----- Network Security Groups
            if len(vnic["nsg_ids"]):
                jinja2_vnic_attachment["nsg_ids"] = [self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[id])) for id in vnic["nsg_ids"]]
            # Add to Vnic Attachments used for Jinja template
            jinja2_vnic_attachments.append(jinja2_vnic_attachment)
            # Increment attachment number
            attachment_number += 1
        self.jinja2_variables["vnic_attachments"] = jinja2_vnic_attachments
        # ---- Fault Domain
        if instance.get('fault_domain', '') != '':
            self.addJinja2Variable("fault_domain", instance["fault_domain"], standardisedName)
        else:
            self.jinja2_variables.pop("fault_domain", None)
        # ---- Preserve Boot Volume
        self.addJinja2Variable("preserve_boot_volume", instance["preserve_boot_volume"], standardisedName)
        # ---- Tags
        self.renderTags(instance)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("instance.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderInternetGateway(self, internet_gateway):
        # Read Data
        standardisedName = self.standardiseResourceName(internet_gateway['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = internet_gateway['display_name']
        # Process Internet Gateway Data
        logger.info('Processing Internet Gateway Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[internet_gateway['compartment_id']]))
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[internet_gateway['vcn_id']]))
        # --- Optional
        # ---- Display Name
        self.addJinja2Variable("display_name", internet_gateway["display_name"], standardisedName)
        # ---- Enabled
        self.addJinja2Variable("enabled", internet_gateway["enabled"], standardisedName)
        # ---- Tags
        self.renderTags(internet_gateway)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("internet_gateway.jinja2")
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
        logger.info('Processing Loadbalancer Information {0!s:s}'.format(standardisedName))
        #logger.info('Loadbalancer Information {0!s:s}'.format(loadbalancer))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[loadbalancer['compartment_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", loadbalancer["display_name"], standardisedName)
        # ---- Shape
        self.addJinja2Variable("shape", loadbalancer["shape"], standardisedName)
        # ---- Private
        self.addJinja2Variable("is_private", loadbalancer["is_private"], standardisedName)
        # ---- Subnets
        jinja2_subnet_ids = []
        for subnet_id in loadbalancer.get('subnet_ids', []):
            jinja2_subnet_ids.append(self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[subnet_id])))
        self.jinja2_variables["loadbalancer_subnet_ids"] = jinja2_subnet_ids
        # ---- Backend Instances
        jinja2_backend_instances_resource_names = []
        for backend_instance_id in loadbalancer.get('instance_ids', []):
            jinja2_backend_instances_resource_names.append(self.standardiseResourceName(self.id_name_map[backend_instance_id]))
        self.jinja2_variables["backend_instances"] = jinja2_backend_instances_resource_names
        # ---- Protocol
        self.addJinja2Variable("protocol", loadbalancer["protocol"], standardisedName)
        # ---- Port
        self.addJinja2Variable("port", loadbalancer["port"], standardisedName)
        # ---- Backend Policy
        self.addJinja2Variable("backend_policy", loadbalancer["backend_policy"], standardisedName)
        # ---- Health Checker
        # ----- URL Path
        self.addJinja2Variable("url_path", loadbalancer["health_checker"]["url_path"], standardisedName)
        # --- Optional
        # ---- IP Mode
        if loadbalancer.get('ip_mode', '') != '':
            self.addJinja2Variable("ip_mode", loadbalancer["ip_mode"], standardisedName)
        # ---- Network Security Groups
        if len(loadbalancer['network_security_group_ids']):
            jinja2_network_security_group_ids = []
            for network_security_group_id in loadbalancer.get('network_security_group_ids', []):
                network_security_group = self.id_name_map[network_security_group_id]
                jinja2_network_security_group_ids.append(self.formatJinja2IdReference(self.standardiseResourceName(network_security_group)))
            self.jinja2_variables["network_security_group_ids"] = jinja2_network_security_group_ids
        else:
            self.jinja2_variables.pop("network_security_group_ids", None)
        # ---- Tags
        self.renderTags(loadbalancer)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("loadbalancer.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderLocalPeeringGateway(self, local_peering_gateway):
        # Read Data
        standardisedName = self.standardiseResourceName(local_peering_gateway['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = local_peering_gateway['display_name']
        # Process Local Peering Gateway Data
        logger.info('Processing Local Peering Gateway Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[local_peering_gateway['compartment_id']]))
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[local_peering_gateway['vcn_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", local_peering_gateway["display_name"], standardisedName)
        # ---- Route Table
        self.jinja2_variables["route_table_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[local_peering_gateway['route_table_id']]))
        # ---- Remote Peering gateway
        if len(local_peering_gateway['peer_id']) > 0:
            self.jinja2_variables["peer_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[local_peering_gateway['peer_id']]))
        else:
            self.jinja2_variables.pop("peer_id", None)
        # --- Optional
        # ---- Tags
        self.renderTags(local_peering_gateway)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("local_peering_gateway.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderNATGateway(self, nat_gateway):
        # Read Data
        standardisedName = self.standardiseResourceName(nat_gateway['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = nat_gateway['display_name']
        # Process NAT Gateway Data
        logger.info('Processing NAT Gateway Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[nat_gateway['compartment_id']]))
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[nat_gateway['vcn_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", nat_gateway["display_name"], standardisedName)
        # --- Optional
        # ---- Block Traffic
        self.addJinja2Variable("block_traffic", nat_gateway["block_traffic"], standardisedName)
        # ---- Tags
        self.renderTags(nat_gateway)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("nat_gateway.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderNetworkSecurityGroup(self, network_security_group):
        # Read Data
        standardisedName = self.standardiseResourceName(network_security_group['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = network_security_group['display_name']
        # Process Security List Data
        logger.info('Processing Network Security Group Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[network_security_group['compartment_id']]))
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[network_security_group['vcn_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", network_security_group["display_name"], standardisedName)
        # --- Optional
        # ---- Security Rules
        rule_number = 1
        jinja2_security_rules = []
        for rule in network_security_group.get('security_rules', []):
            # ------ Protocol
            variableName = '{0:s}_security_rule_{1:02d}_protocol'.format(standardisedName, rule_number)
            self.run_variables[variableName] = rule["protocol"]
            jinja2_security_rule = {
                "protocol": self.formatJinja2Variable(variableName)
            }
            # ------ TCP Options (Protocol 6)
            if rule["protocol"] == '6' and 'tcp_options' in rule and rule["tcp_options"] is not None:
                tcp_options = self.renderSecurityListRuleOptions(rule, 'tcp_options', standardisedName, rule_number, 'security')
                jinja2_security_rule["tcp_options"] = tcp_options
            # ------ UDP Options (Protocol 17)
            if rule["protocol"] == '17' and 'udp_options' in rule and rule["udp_options"] is not None:
                udp_options = self.renderSecurityListRuleOptions(rule, 'udp_options', standardisedName, rule_number, 'security')
                jinja2_security_rule["udp_options"] = udp_options
            # ------ ICMP Options (Protocol 1)
            if rule["protocol"] == '1' and 'icmp_options' in rule and rule["icmp_options"] is not None:
                icmp_options = self.renderSecurityListRuleOptions(rule, 'icmp_options', standardisedName, rule_number, 'security')
                jinja2_security_rule["icmp_options"] = icmp_options
            # ------ Direction
            variableName = '{0:s}_security_rule_{1:02d}_direction'.format(standardisedName, rule_number)
            self.run_variables[variableName] = rule["direction"]
            jinja2_security_rule["direction"] = self.formatJinja2Variable(variableName)
            if rule["direction"] == 'INGRESS':
                # ------ Source
                variableName = '{0:s}_security_rule_{1:02d}_source'.format(standardisedName, rule_number)
                self.run_variables[variableName] = rule["source"]
                jinja2_security_rule["source"] = self.formatJinja2Variable(variableName)
                # ------ Source Type
                variableName = '{0:s}_security_rule_{1:02d}_source_type'.format(standardisedName, rule_number)
                self.run_variables[variableName] = rule["source_type"]
                jinja2_security_rule["source_type"] = self.formatJinja2Variable(variableName)
            else:
                # ------ Destination
                variableName = '{0:s}_security_rule_{1:02d}_destination'.format(standardisedName, rule_number)
                self.run_variables[variableName] = rule["destination"]
                jinja2_security_rule["destination"] = self.formatJinja2Variable(variableName)
                # ------ Destination Type
                variableName = '{0:s}_security_rule_{1:02d}_destination_type'.format(standardisedName, rule_number)
                self.run_variables[variableName] = rule["destination_type"]
                jinja2_security_rule["destination_type"] = self.formatJinja2Variable(variableName)
            # ------ Description
            variableName = '{0:s}_security_rule_{1:02d}_description'.format(standardisedName, rule_number)
            self.run_variables[variableName] = rule.get("description", "Egress Rule {0:02d}".format(rule_number))
            jinja2_security_rule["description"] = self.formatJinja2Variable(variableName)
            # Add to Egress Rules used for Jinja template
            jinja2_security_rules.append(jinja2_security_rule)
            # Increment rule number
            rule_number += 1
        self.jinja2_variables["security_rules"] = jinja2_security_rules
        # ---- Tags
        self.renderTags(network_security_group)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("network_security_group.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderObjectStorageBucket(self, object_storage_bucket):
        # Read Data
        standardisedName = self.standardiseResourceName(object_storage_bucket['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = object_storage_bucket['display_name']
        # Process Object Storage Bucket Data
        logger.info('Processing Object Storage Bucket Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[object_storage_bucket['compartment_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", object_storage_bucket["display_name"], standardisedName)
        # ---- Namespace
        self.addJinja2Variable("namespace", object_storage_bucket["namespace"], standardisedName)
        # ---- Name
        self.addJinja2Variable("name", object_storage_bucket["name"], standardisedName)
        # ---- Storage Tier
        self.addJinja2Variable("storage_tier", object_storage_bucket["storage_tier"], standardisedName)
        # ---- Public Access Type
        self.addJinja2Variable("public_access_type", object_storage_bucket["public_access_type"], standardisedName)
        # --- Optional
        # ---- Tags
        self.renderTags(object_storage_bucket)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("object_storage_bucket.jinja2")
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
        logger.info('Processing Route Table Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[route_table['compartment_id']]))
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[route_table['vcn_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", route_table["display_name"], standardisedName)
        # ---- Route Rules
        rule_number = 1
        jinja2_route_rules = []
        for route_rule in route_table.get('route_rules', []):
            jinja2_route_rule = {}
            # ------ Network End Point
            #variableName = '{0:s}_route_rule_{1:02d}_network_entity_id'.format(standardisedName, rule_number)
            #self.run_variables[variableName] = route_rule["network_entity_id"]
            jinja2_route_rule["network_entity_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[route_rule["network_entity_id"]]))
            # ------ Destination
            jinja2_route_rule["destination"] = self.generateJinja2Variable('route_rule_{0:02d}_destination'.format(rule_number), route_rule["destination"], standardisedName)
            # ------ Destination Type
            jinja2_route_rule["destination_type"] = self.generateJinja2Variable('route_rule_{0:02d}_destination_type'.format(rule_number), route_rule["destination_type"], standardisedName)
            # ------ Description
            jinja2_route_rule["description"] = self.generateJinja2Variable('route_rule_{0:02d}_description'.format(rule_number), route_rule.get("description", "Rule {0:02d}".format(rule_number)), standardisedName)
            # Add to Egress Rules used for Jinja template
            jinja2_route_rules.append(jinja2_route_rule)
            # Increment rule number
            rule_number += 1
        self.jinja2_variables["route_rules"] = jinja2_route_rules
        # --- Optional
        # ---- Tags
        self.renderTags(route_table)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("route_table.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderSecurityList(self, security_list):
        # Read Data
        standardisedName = self.standardiseResourceName(security_list['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = security_list['display_name']
        # Process Security List Data
        logger.info('Processing Security List Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[security_list['compartment_id']]))
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[security_list['vcn_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", security_list["display_name"], standardisedName)
        # --- Optional
        # ---- Egress Rules
        rule_number = 1
        jinja2_egress_rules = []
        for rule in security_list.get('egress_security_rules', []):
            jinja2_egress_rule = {}
            # ------ Protocol
            jinja2_egress_rule["protocol"] = self.generateJinja2Variable('egress_rule_{0:02d}_protocol'.format(rule_number), rule["protocol"], standardisedName)
            # ------ TCP Options (Protocol 6)
            if rule["protocol"] == '6' and 'tcp_options' in rule and rule["tcp_options"] is not None:
                tcp_options = self.renderSecurityListRuleOptions(rule, 'tcp_options', standardisedName, rule_number, 'egress')
                jinja2_egress_rule["tcp_options"] = tcp_options
            # ------ UDP Options (Protocol 17)
            if rule["protocol"] == '17' and 'udp_options' in rule and rule["udp_options"] is not None:
                udp_options = self.renderSecurityListRuleOptions(rule, 'udp_options', standardisedName, rule_number, 'egress')
                jinja2_egress_rule["udp_options"] = udp_options
            # ------ ICMP Options (Protocol 1)
            if rule["protocol"] == '1' and 'icmp_options' in rule and rule["icmp_options"] is not None:
                icmp_options = self.renderSecurityListRuleOptions(rule, 'icmp_options', standardisedName, rule_number, 'egress')
                jinja2_egress_rule["icmp_options"] = icmp_options
            # ------ Destination
            jinja2_egress_rule["destination"] = self.generateJinja2Variable('egress_rule_{0:02d}_destination'.format(rule_number), rule["destination"], standardisedName)
            # ------ Destination Type
            jinja2_egress_rule["destination_type"] = self.generateJinja2Variable('egress_rule_{0:02d}_destination_type'.format(rule_number), rule["destination_type"], standardisedName)
            # ------ Description
            jinja2_egress_rule["description"] = self.generateJinja2Variable('egress_rule_{0:02d}_description'.format(rule_number), rule.get("description", "Egress Rule {0:02d}".format(rule_number)), standardisedName)
            # Add to Egress Rules used for Jinja template
            jinja2_egress_rules.append(jinja2_egress_rule)
            # Increment rule number
            rule_number += 1
        self.jinja2_variables["egress_rules"] = jinja2_egress_rules
        # ---- Ingress Rules
        rule_number = 1
        jinja2_ingress_rules = []
        for rule in security_list.get('ingress_security_rules', []):
            jinja2_ingress_rule = {}
            # ------ Protocol
            jinja2_ingress_rule["protocol"] = self.generateJinja2Variable('ingress_rule_{0:02d}_protocol'.format(rule_number), rule["protocol"], standardisedName)
            # ------ TCP Options (Protocol 6)
            if rule["protocol"] == '6' and 'tcp_options' in rule and rule['tcp_options'] is not None:
                tcp_options = self.renderSecurityListRuleOptions(rule, 'tcp_options', standardisedName, rule_number, 'ingress')
                jinja2_ingress_rule["tcp_options"] = tcp_options
            # ------ UDP Options (Protocol 17)
            if rule["protocol"] == '17' and 'udp_options' in rule and rule['udp_options'] is not None:
                udp_options = self.renderSecurityListRuleOptions(rule, 'udp_options', standardisedName, rule_number, 'ingress')
                jinja2_ingress_rule["udp_options"] = udp_options
            # ------ ICMP Options (Protocol 1)
            if rule["protocol"] == '1' and 'icmp_options' in rule and rule['icmp_options'] is not None:
                icmp_options = self.renderSecurityListRuleOptions(rule, 'icmp_options', standardisedName, rule_number, 'ingress')
                jinja2_ingress_rule["icmp_options"] = icmp_options
            # ------ Source Type
            jinja2_ingress_rule["source_type"] = self.generateJinja2Variable('ingress_rule_{0:02d}_source_type'.format(rule_number), rule["source_type"], standardisedName)
            # ------ Source
            jinja2_ingress_rule["source"] = self.generateJinja2Variable('ingress_rule_{0:02d}_source'.format(rule_number), rule["source"], standardisedName)
            # ------ Description
            jinja2_ingress_rule["description"] = self.generateJinja2Variable('ingress_rule_{0:02d}_description'.format(rule_number), rule.get("description", "Ingress Rule {0:02d}".format(rule_number)), standardisedName)
            # Add to Ingress Rules used for Jinja template
            jinja2_ingress_rules.append(jinja2_ingress_rule)
            # Increment rule number
            rule_number += 1
        self.jinja2_variables["ingress_rules"] = jinja2_ingress_rules
        # ---- Tags
        self.renderTags(security_list)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("security_list.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderSecurityListRuleOptions(self, rule, element, standardisedName, rule_number, rule_type):
        options = {}
        if element == 'icmp_options':
            if 'type' in rule["icmp_options"] and rule["icmp_options"]["type"] != '' and rule["icmp_options"]["type"] is not None:
                # Type
                options['type'] = self.generateJinja2Variable('{0!s:s}_rule_{1:02d}_icmp_type'.format(rule_type, rule_number), rule["icmp_options"]["type"], standardisedName)
                # Code
                if 'code' in rule["icmp_options"] and rule["icmp_options"]["code"] != '' and rule["icmp_options"]["code"] is not None:
                    options['code'] = self.generateJinja2Variable('{0!s:s}_rule_{1:02d}_icmp_code'.format(rule_type, rule_number), rule["icmp_options"]["code"], standardisedName)
        else:
            if 'destination_port_range' in rule[element] and rule[element]['destination_port_range'] is not None:
                # If min or max is missing and if so set to the other
                if rule[element]['destination_port_range']['max'] == '':
                    rule[element]['destination_port_range']['max'] = rule[element]['destination_port_range']['min']
                if rule[element]['destination_port_range']['min'] == '':
                    rule[element]['destination_port_range']['min'] = rule[element]['destination_port_range']['max']
                if rule[element]['destination_port_range']['min'] != '' and rule[element]['destination_port_range']['max'] != '':
                    # We have a range
                    options['destination_port_range'] = {}
                    # Min
                    options['destination_port_range']['min'] = self.generateJinja2Variable('{0!s:s}_rule_{1:02d}_tcp_dst_min'.format(rule_type, rule_number), rule[element]['destination_port_range']['min'], standardisedName)
                    # Max
                    options['destination_port_range']['max'] = self.generateJinja2Variable('{0!s:s}_rule_{1:02d}_tcp_dst_max'.format(rule_type, rule_number), rule[element]['destination_port_range']['max'], standardisedName)
            if 'source_port_range' in rule[element] and rule[element]['source_port_range'] is not None:
                # If min or max is missing and if so set to the other
                if rule[element]['source_port_range']['max'] == '':
                    rule[element]['source_port_range']['max'] = rule[element]['source_port_range']['min']
                if rule[element]['source_port_range']['min'] == '':
                    rule[element]['source_port_range']['min'] = rule[element]['source_port_range']['max']
                if rule[element]['source_port_range']['min'] != '' and rule[element]['source_port_range']['max'] != '':
                    # We have a range
                    options['source_port_range'] = {}
                    # Min
                    options['source_port_range']['min'] = self.generateJinja2Variable('{0!s:s}_rule_{1:02d}_tcp_src_min'.format(rule_type, rule_number), rule[element]['source_port_range']['min'], standardisedName)
                    # Max
                    options['source_port_range']['max'] = self.generateJinja2Variable('{0!s:s}_rule_{1:02d}_tcp_src_max'.format(rule_type, rule_number), rule[element]['source_port_range']['max'], standardisedName)
        return options

    def renderServiceGateway(self, service_gateway):
        # Read Data
        standardisedName = self.standardiseResourceName(service_gateway['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = service_gateway['display_name']
        # Process Service Gateway Data
        logger.info('Processing Service Gateway Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[service_gateway['compartment_id']]))
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[service_gateway['vcn_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", service_gateway["display_name"], standardisedName)
        # ---- Service Name
        self.addJinja2Variable("service_name", service_gateway["service_name"], standardisedName)
        # --- Optional
        # ---- Route Table
        if len(service_gateway['route_table_id']):
            self.jinja2_variables["route_table_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[service_gateway['route_table_id']]))
        else:
            self.jinja2_variables.pop("route_table_id", None)
        # ---- Tags
        self.renderTags(service_gateway)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("service_gateway.jinja2")
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
        logger.info('Processing Subnet Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[subnet['compartment_id']]))
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[subnet['vcn_id']]))
        # ---- Display Name
        self.addJinja2Variable("display_name", subnet["display_name"], standardisedName)
        # ---- CIDR Block
        self.addJinja2Variable("cidr_block", subnet["cidr_block"], standardisedName)
        # ---- DNS Label
        self.addJinja2Variable("dns_label", subnet["dns_label"], standardisedName)
        # ---- Route Table
        if len(subnet['route_table_id']):
            self.jinja2_variables["route_table_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[subnet['route_table_id']]))
        else:
            self.jinja2_variables.pop("route_table_id", None)
        # ---- Security Lists
        if len(subnet['security_list_ids']):
            jinja2_security_list_ids = []
            for security_list_id in subnet.get('security_list_ids', []):
                security_list = self.id_name_map[security_list_id]
                jinja2_security_list_ids.append(self.formatJinja2IdReference(self.standardiseResourceName(security_list)))
            self.jinja2_variables["security_list_ids"] = jinja2_security_list_ids
        else:
            self.jinja2_variables.pop("security_list_ids", None)
        # ---- DHCP Options
        if 'dhcp_options' in subnet:
            self.jinja2_variables["dhcp_options_id"] = self.formatJinja2DhcpReference(self.standardiseResourceName(subnet['dhcp_options']))
        else:
            self.jinja2_variables["dhcp_options_id"] = self.formatJinja2DhcpReference(self.standardiseResourceName(self.id_name_map[subnet['vcn_id']]))
        # --- Optional
        # ---- Availability Domain
        if subnet.get("availability_domain", None) is not None and int(subnet["availability_domain"]) > 0:
            self.addJinja2Variable("availability_domain", subnet["availability_domain"], standardisedName)
        else:
            self.jinja2_variables.pop("availability_domain", None)
        # ---- Prohibit Public IP
        self.addJinja2Variable("prohibit_public_ip_on_vnic", subnet["prohibit_public_ip_on_vnic"], standardisedName)
        # ---- IPv6
        if subnet['is_ipv6enabled']:
            # ----- Enabled
            self.addJinja2Variable("is_ipv6enabled", subnet["is_ipv6enabled"], standardisedName)
            # ----- Block
            self.addJinja2Variable("ipv6cidr_block", subnet["ipv6cidr_block"], standardisedName)
        else:
            self.jinja2_variables.pop("is_ipv6enabled", None)
            self.jinja2_variables.pop("ipv6cidr_block", None)
        # ---- Tags
        self.renderTags(subnet)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("subnet.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def renderVirtualCloudNetwork(self, virtual_cloud_network):
        # Read Data
        standardisedName = self.standardiseResourceName(virtual_cloud_network['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = virtual_cloud_network['display_name']
        # Process Virtual Cloud Networks Data
        logger.info('Processing Virtual Cloud Network Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[virtual_cloud_network['compartment_id']]))
        # ---- CIDR Block
        self.addJinja2Variable("cidr_block", virtual_cloud_network["cidr_block"], standardisedName)
        # ---- Display Name
        self.addJinja2Variable("display_name", virtual_cloud_network["display_name"], standardisedName)
        # ---- DNS Label
        self.addJinja2Variable("dns_label", virtual_cloud_network["dns_label"], standardisedName)
        # --- Optional
        # ---- IPv6
        if virtual_cloud_network['is_ipv6enabled']:
            # ----- Enabled
            self.addJinja2Variable("is_ipv6enabled", virtual_cloud_network["is_ipv6enabled"], standardisedName)
            # ----- Block
            self.addJinja2Variable("ipv6cidr_block", virtual_cloud_network["ipv6cidr_block"], standardisedName)
        else:
            self.jinja2_variables.pop("is_ipv6enabled", None)
            self.jinja2_variables.pop("ipv6cidr_block", None)
        # ---- Tags
        self.renderTags(virtual_cloud_network)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("virtual_cloud_network.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return

    def addJinja2Variable(self, name, value, resource):
        self.jinja2_variables[name] = self.generateJinja2Variable(name, value, resource)
        return

    def removeJinja2Variable(self, name):
        self.jinja2_variables.pop(name, None)
        return

    def generateJinja2Variable(self, name, value, resource):
        # We will assume that Variables are not being used
        jinja2_var = self.formatJinja2Value(value)
        if self.use_vars:
            variableName = '{0!s:s}_{1!s:s}'.format(resource, name)
            self.run_variables[variableName] = value
            jinja2_var = self.formatJinja2Variable(variableName)
        return jinja2_var

    def renderTags(self, artifact):
        # -- Defined Tags
        self.renderDefinedTags(artifact)
        # -- Freeform Tags
        self.renderFreeformTags(artifact)
        return

    def renderDefinedTags(self, artifact):
        tags = artifact.get("defined_tags", {})
        if len(tags.keys()) > 0:
            if self.use_vars:
                standardisedName = self.standardiseResourceName(artifact.get('display_name', artifact.get('name', '')))
                # -- Defined Tags
                variableName = '{0:s}_defined_tags'.format(standardisedName)
                self.run_variables[variableName] = tags
                self.jinja2_variables["defined_tags"] = self.formatJinja2Variable(variableName)
            else:
                self.jinja2_variables["defined_tags"] = self.formatJinja2Value(tags)
        else:
            self.jinja2_variables.pop("defined_tags", None)
        return

    def renderFreeformTags(self, artifact):
        tags = artifact.get("freeform_tags", {})
        if len(tags.keys()) > 0:
            if self.use_vars:
                standardisedName = self.standardiseResourceName(artifact.get('display_name', artifact.get('name', '')))
                # -- Freeform Tags
                variableName = '{0:s}_freeform_tags'.format(standardisedName)
                self.run_variables[variableName] = tags
                self.jinja2_variables["freeform_tags"] = self.formatJinja2Variable(variableName)
            else:
                self.jinja2_variables["freeform_tags"] = self.formatJinja2Value(tags)
        else:
            self.jinja2_variables.pop("freeform_tags", None)
        return

    def standardiseResourceName(self, name):
        # split() will generate a list with no empty values thus join of this will remove all whitespace
        standardised_name = ''.join(name.title().split()).replace('-', '_')
        return standardised_name

    def createZipArchive(self, dir, archivename):
        shutil.make_archive(archivename, 'zip', dir)
        zipname = '{0:s}.zip'.format(str(archivename))
        return zipname
