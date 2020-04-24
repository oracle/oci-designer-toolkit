
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
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = autonomous_database["display_name"]
        # ---- DB Name
        variableName = '{0:s}_db_name'.format(standardisedName)
        self.jinja2_variables["db_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = autonomous_database["db_name"]
        # ---- Admin Password
        variableName = '{0:s}_admin_password'.format(standardisedName)
        self.jinja2_variables["admin_password"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = autonomous_database["admin_password"]
        # ---- Storage Size In TBs
        variableName = '{0:s}_data_storage_size_in_tbs'.format(standardisedName)
        self.jinja2_variables["data_storage_size_in_tbs"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = autonomous_database["data_storage_size_in_tbs"]
        # ---- Core Count
        variableName = '{0:s}_cpu_core_count'.format(standardisedName)
        self.jinja2_variables["cpu_core_count"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = autonomous_database["cpu_core_count"]
        # ---- Work Load
        variableName = '{0:s}_db_workload'.format(standardisedName)
        self.jinja2_variables["db_workload"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = autonomous_database["db_workload"]
        # ---- Auto Scaling
        variableName = '{0:s}_is_auto_scaling_enabled'.format(standardisedName)
        self.jinja2_variables["is_auto_scaling_enabled"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = autonomous_database["is_auto_scaling_enabled"]
        # ---- Free Tier
        variableName = '{0:s}_is_free_tier'.format(standardisedName)
        self.jinja2_variables["is_free_tier"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = autonomous_database["is_free_tier"]
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
        variableName = '{0:s}_availability_domain'.format(standardisedName)
        self.jinja2_variables["availability_domain"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = block_storage_volume["availability_domain"]
        # ---- Display Name
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = block_storage_volume["display_name"]
        # ---- Backup Policy
        variableName = '{0:s}_backup_policy'.format(standardisedName)
        self.jinja2_variables["backup_policy"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = block_storage_volume["backup_policy"]
        # ---- Size In GBs
        variableName = '{0:s}_size_in_gbs'.format(standardisedName)
        self.jinja2_variables["size_in_gbs"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = int(block_storage_volume["size_in_gbs"])
        # --- Optional
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
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = compartment["name"]
        # ---- Description
        variableName = '{0:s}_description'.format(standardisedName)
        self.jinja2_variables["description"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = compartment.get("description", compartment["name"])
        # --- Optional
        # ---- Tags
        self.renderTags(compartment)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("compartment.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.info(self.create_sequence[-1])
        logger.debug(self.create_sequence[-1])
        return

    def renderDynamicRoutingGateway(self, dynamic_routing_gateway):
        # Read Data
        standardisedName = self.standardiseResourceName(dynamic_routing_gateway['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = dynamic_routing_gateway['display_name']
        # Process NAT Gateway Data
        logger.info('Processing NAT Gateway Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[dynamic_routing_gateway['compartment_id']]))
        # ---- Virtual Cloud Network OCID
        self.jinja2_variables["vcn_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[dynamic_routing_gateway['vcn_id']]))
        # ---- Display Name
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = dynamic_routing_gateway["display_name"]
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
        variableName = '{0:s}_availability_domain'.format(standardisedName)
        self.jinja2_variables["availability_domain"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = file_storage_system["availability_domain"]
        # ---- Display Name
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = file_storage_system["display_name"]
        # ---- Network OCID
        self.jinja2_variables["subnet_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[file_storage_system['primary_mount_target']['subnet_id']]))
        # ---- Source (CIDR)
        variableName = '{0:s}_source'.format(standardisedName)
        self.jinja2_variables["source"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = file_storage_system["primary_export"]["export_options"]["source"]
        # ---- Hostname
        variableName = '{0:s}_hostname'.format(standardisedName)
        self.jinja2_variables["hostname_label"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = file_storage_system['primary_mount_target']["hostname_label"]
        # ---- (Mount) Path
        variableName = '{0:s}_path'.format(standardisedName)
        self.jinja2_variables["path"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = file_storage_system["primary_export"]["path"]
        # ---- Require Privileged Source Port
        variableName = '{0:s}_require_privileged_source_port'.format(standardisedName)
        self.jinja2_variables["require_privileged_source_port"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = file_storage_system["primary_export"]["export_options"]["require_privileged_source_port"]
        # ---- Access
        variableName = '{0:s}_access'.format(standardisedName)
        self.jinja2_variables["access"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = file_storage_system["primary_export"]["export_options"]["access"]
        # --- Optional
        # ----- Network Security Groups
        if len(file_storage_system['primary_mount_target']["nsg_ids"]):
            self.jinja2_variables["nsg_ids"] = [self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[id])) for id in file_storage_system['primary_mount_target']["nsg_ids"]]
        # ----- Max FS Stat Bytes
        if file_storage_system['primary_mount_target']['export_set']["max_fs_stat_bytes"].strip() != '':
            variableName = '{0:s}_max_fs_stat_bytes'.format(standardisedName)
            self.jinja2_variables["max_fs_stat_bytes"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = file_storage_system['primary_mount_target']['export_set']["max_fs_stat_bytes"]
        # ----- Max FS Stat Files
        if file_storage_system['primary_mount_target']['export_set']["max_fs_stat_files"].strip() != '':
            variableName = '{0:s}_max_fs_stat_files'.format(standardisedName)
            self.jinja2_variables["max_fs_stat_files"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = file_storage_system['primary_mount_target']['export_set']["max_fs_stat_files"]
        # ----- Identity Squash
        if file_storage_system["primary_export"]["export_options"]["identity_squash"] != 'NONE':
            # ----- Identity Squash
            variableName = '{0:s}_identity_squash'.format(standardisedName)
            self.jinja2_variables["identity_squash"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = file_storage_system["primary_export"]["export_options"]["identity_squash"]
            # ----- Identity Squash GID
            variableName = '{0:s}_anonymous_gid'.format(standardisedName)
            self.jinja2_variables["anonymous_gid"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = file_storage_system["primary_export"]["export_options"]["anonymous_gid"]
            # ----- Identity Squash UID
            variableName = '{0:s}_anonymous_uid'.format(standardisedName)
            self.jinja2_variables["anonymous_uid"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = file_storage_system["primary_export"]["export_options"]["anonymous_uid"]
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
        variableName = '{0:s}_availability_domain'.format(standardisedName)
        self.jinja2_variables["availability_domain"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["availability_domain"]
        # ---- Display Name
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["display_name"]
        # ---- Shape
        variableName = '{0:s}_shape'.format(standardisedName)
        self.jinja2_variables["shape"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["shape"]
        # ---- Operating System
        variableName = '{0:s}_os'.format(standardisedName)
        self.jinja2_variables["os"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["source_details"]["os"]
        # ---- Operating System Version
        variableName = '{0:s}_os_version'.format(standardisedName)
        self.jinja2_variables["os_version"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["source_details"]["version"]
        # ---- Boot Volume Size
        variableName = '{0:s}_boot_volume_size_in_gbs'.format(standardisedName)
        self.jinja2_variables["boot_volume_size_in_gbs"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = int(instance["source_details"]["boot_volume_size_in_gbs"])
        #self.run_variables[variableName] = int(instance["boot_volume_size_in_gbs"])
        # --- Optional
        # ---- Primary VNIC
        # ----- Subnet OCID
        self.jinja2_variables["subnet_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[instance["vnics"][0]["subnet_id"]]))
        # ----- Display Name (Vnic)
        variableName = '{0:s}_display_name_vnic'.format(standardisedName)
        self.jinja2_variables["display_name_vnic"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = '{0!s:s} vnic 00'.format(instance["display_name"])
        # ---- Hostname
        variableName = '{0:s}_hostname_label'.format(standardisedName)
        self.jinja2_variables["hostname_label"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["vnics"][0]["hostname_label"]
        # ----- Assign Public IP
        variableName = '{0:s}_primary_vnic_assign_public'.format(standardisedName)
        self.jinja2_variables["assign_public_ip"] = self.formatJinja2Variable(variableName)
        subnet = self.get("subnets", instance["vnics"][0]["subnet_id"])
        self.run_variables[variableName] = (instance["vnics"][0]["assign_public_ip"] and (not subnet["prohibit_public_ip_on_vnic"]))
        # ----- Skip Source/destination Check
        variableName = '{0:s}_primary_vnic_skip_src_dst_check'.format(standardisedName)
        self.jinja2_variables["skip_source_dest_check"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["vnics"][0]["skip_source_dest_check"]
        # ----- Network Security Groups
        if len(instance["vnics"][0]["nsg_ids"]):
            self.jinja2_variables["nsg_ids"] = [self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[id])) for id in instance["vnics"][0]["nsg_ids"]]
        # ---- Metadata
        # ----- Authorised Public SSH Keys
        variableName = '{0:s}_authorized_keys'.format(standardisedName)
        self.jinja2_variables["authorized_keys"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["metadata"]["authorized_keys"]
        # ----- Cloud Init YAML
        variableName = '{0:s}user_data'.format(standardisedName)
        self.jinja2_variables["user_data"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["metadata"]["user_data"].replace('\n', '\\n').replace('"', '\\"')
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
            variableName = '{0:s}_fault_domain'.format(standardisedName)
            self.jinja2_variables["fault_domain"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = instance["fault_domain"]
        else:
            self.jinja2_variables.pop("fault_domain", None)
        # ---- Preserve Boot Volume
        variableName = '{0:s}_preserve_boot_volume'.format(standardisedName)
        self.jinja2_variables["preserve_boot_volume"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = instance["preserve_boot_volume"]
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
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = internet_gateway["display_name"]
        # ---- Enabled
        variableName = '{0:s}_enabled'.format(standardisedName)
        self.jinja2_variables["enabled"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = internet_gateway["enabled"]
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
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = loadbalancer["display_name"]
        # ---- Shape
        variableName = '{0:s}_shape'.format(standardisedName)
        self.jinja2_variables["shape"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = loadbalancer["shape_name"]
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
        # --- Optional
        # ---- IP Mode
        if loadbalancer.get('ip_mode', '') != '':
            variableName = '{0:s}_ip_mode'.format(standardisedName)
            self.jinja2_variables["ip_mode"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = loadbalancer["ip_mode"]
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
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = local_peering_gateway["display_name"]
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
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = nat_gateway["display_name"]
        # --- Optional
        # ---- Block Traffic
        variableName = '{0:s}_block_traffic'.format(standardisedName)
        self.jinja2_variables["block_traffic"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = nat_gateway["block_traffic"]
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
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = network_security_group["display_name"]
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
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = object_storage_bucket["display_name"]
        # ---- Namespace
        variableName = '{0:s}_namespace'.format(standardisedName)
        self.jinja2_variables["namespace"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = object_storage_bucket["namespace"]
        # ---- Name
        variableName = '{0:s}_name'.format(standardisedName)
        self.jinja2_variables["name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = object_storage_bucket["name"]
        # ---- Storage Tier
        variableName = '{0:s}_storage_tier'.format(standardisedName)
        self.jinja2_variables["storage_tier"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = object_storage_bucket["storage_tier"]
        # ---- Public Access Type
        variableName = '{0:s}_public_access_type'.format(standardisedName)
        self.jinja2_variables["public_access_type"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = object_storage_bucket["public_access_type"]
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
                "network_entity_id": self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[route_rule["network_entity_id"]]))
            }
            # ------ Destination
            variableName = '{0:s}_route_rule_{1:02d}_destination'.format(standardisedName, rule_number)
            self.run_variables[variableName] = route_rule["destination"]
            jinja2_route_rule["destination"] = self.formatJinja2Variable(variableName)
            # ------ Destination Type
            variableName = '{0:s}_route_rule_{1:02d}_destination_type'.format(standardisedName, rule_number)
            self.run_variables[variableName] = route_rule["destination_type"]
            jinja2_route_rule["destination_type"] = self.formatJinja2Variable(variableName)
            # ------ Description
            variableName = '{0:s}_route_rule_{1:02d}_description'.format(standardisedName, rule_number)
            self.run_variables[variableName] = route_rule.get("description", "Rule {0:02d}".format(rule_number))
            jinja2_route_rule["description"] = self.formatJinja2Variable(variableName)
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
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = security_list["display_name"]
        # --- Optional
        # ---- Egress Rules
        rule_number = 1
        jinja2_egress_rules = []
        for rule in security_list.get('egress_security_rules', []):
            # ------ Protocol
            variableName = '{0:s}_egress_rule_{1:02d}_protocol'.format(standardisedName, rule_number)
            self.run_variables[variableName] = rule["protocol"]
            jinja2_egress_rule = {
                "protocol": self.formatJinja2Variable(variableName)
            }
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
            variableName = '{0:s}_egress_rule_{1:02d}_destination'.format(standardisedName, rule_number)
            self.run_variables[variableName] = rule["destination"]
            jinja2_egress_rule["destination"] = self.formatJinja2Variable(variableName)
            # ------ Destination Type
            variableName = '{0:s}_egress_rule_{1:02d}_destination_type'.format(standardisedName, rule_number)
            self.run_variables[variableName] = rule["destination_type"]
            jinja2_egress_rule["destination_type"] = self.formatJinja2Variable(variableName)
            # ------ Description
            variableName = '{0:s}_egress_rule_{1:02d}_description'.format(standardisedName, rule_number)
            self.run_variables[variableName] = rule.get("description", "Egress Rule {0:02d}".format(rule_number))
            jinja2_egress_rule["description"] = self.formatJinja2Variable(variableName)
            # Add to Egress Rules used for Jinja template
            jinja2_egress_rules.append(jinja2_egress_rule)
            # Increment rule number
            rule_number += 1
        self.jinja2_variables["egress_rules"] = jinja2_egress_rules
        # ---- Ingress Rules
        rule_number = 1
        jinja2_ingress_rules = []
        for rule in security_list.get('ingress_security_rules', []):
            # ------ Protocol
            variableName = '{0:s}_ingress_rule_{1:02d}_protocol'.format(standardisedName, rule_number)
            self.run_variables[variableName] = rule["protocol"]
            jinja2_ingress_rule = {
                "protocol": self.formatJinja2Variable(variableName)
            }
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
            variableName = '{0:s}_ingress_rule_{1:02d}_source_type'.format(standardisedName, rule_number)
            self.run_variables[variableName] = rule["source_type"]
            jinja2_ingress_rule["source_type"] = self.formatJinja2Variable(variableName)
            # ------ Source
            variableName = '{0:s}_ingress_rule_{1:02d}_source'.format(standardisedName, rule_number)
            self.run_variables[variableName] = rule["source"]
            jinja2_ingress_rule["source"] = self.formatJinja2Variable(variableName)
            # ------ Description
            variableName = '{0:s}_ingress_rule_{1:02d}_description'.format(standardisedName, rule_number)
            self.run_variables[variableName] = rule.get("description", "Ingress Rule {0:02d}".format(rule_number))
            jinja2_ingress_rule["description"] = self.formatJinja2Variable(variableName)
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
            if 'type' in rule["icmp_options"] and  rule["icmp_options"]["type"] != '' and rule["icmp_options"]["type"] is not None:
                # Type
                variableName = '{0!s:s}_{1!s:s}_rule_{2:02d}_icmp_type'.format(standardisedName, rule_type, rule_number)
                self.run_variables[variableName] = rule["icmp_options"]["type"]
                options['type'] = self.formatJinja2Variable(variableName)
                # Code
                if 'code' in rule["icmp_options"] and rule["icmp_options"]["code"] != '' and rule["icmp_options"]["code"] is not None:
                    variableName = '{0!s:s}_{1!s:s}_rule_{2:02d}_icmp_code'.format(standardisedName, rule_type, rule_number)
                    self.run_variables[variableName] = rule["icmp_options"]["code"]
                    options['code'] = self.formatJinja2Variable(variableName)
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
                    variableName = '{0!s:s}_{1!s:s}_rule_{2:02d}_tcp_dst_min'.format(standardisedName, rule_type, rule_number)
                    self.run_variables[variableName] = rule[element]['destination_port_range']['min']
                    options['destination_port_range']['min'] = self.formatJinja2Variable(variableName)
                    # Max
                    variableName = '{0!s:s}_{1!s:s}_rule_{2:02d}_tcp_dst_max'.format(standardisedName, rule_type, rule_number)
                    self.run_variables[variableName] = rule[element]['destination_port_range']['max']
                    options['destination_port_range']['max'] = self.formatJinja2Variable(variableName)
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
                    variableName = '{0!s:s}_{1!s:s}_rule_{2:02d}_tcp_src_min'.format(standardisedName, rule_type, rule_number)
                    self.run_variables[variableName] = rule[element]['source_port_range']['min']
                    options['source_port_range']['min'] = self.formatJinja2Variable(variableName)
                    # Max
                    variableName = '{0!s:s}_{1!s:s}_rule_{2:02d}_tcp_src_max'.format(standardisedName, rule_type, rule_number)
                    self.run_variables[variableName] = rule[element]['source_port_range']['max']
                    options['source_port_range']['max'] = self.formatJinja2Variable(variableName)
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
        variableName = '{0:s}_display_name'.format(standardisedName)
        self.jinja2_variables["display_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = service_gateway["display_name"]
        # ---- Service Name
        variableName = '{0:s}_service_name'.format(standardisedName)
        self.jinja2_variables["service_name"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = service_gateway["service_name"]
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
        if int(str(subnet.get("availability_domain", "0"))) > 0:
            variableName = '{0:s}_availability_domain'.format(standardisedName)
            self.jinja2_variables["availability_domain"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = subnet["availability_domain"]
        else:
            self.jinja2_variables.pop("availability_domain", None)
        # ---- Prohibit Public IP
        variableName = '{0:s}_prohibit_public_ip_on_vnic'.format(standardisedName)
        self.jinja2_variables["prohibit_public_ip_on_vnic"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = subnet["prohibit_public_ip_on_vnic"]
        # ---- IPv6
        if subnet['is_ipv6enabled']:
            variableName = '{0:s}_is_ipv6enabled'.format(standardisedName)
            self.jinja2_variables["is_ipv6enabled"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = subnet['is_ipv6enabled']
            variableName = '{0:s}_ipv6cidr_block'.format(standardisedName)
            self.jinja2_variables["ipv6cidr_block"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = subnet['ipv6cidr_block']
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
        # --- Optional
        # ---- IPv6
        if virtual_cloud_network['is_ipv6enabled']:
            variableName = '{0:s}_is_ipv6enabled'.format(standardisedName)
            self.jinja2_variables["is_ipv6enabled"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = virtual_cloud_network['is_ipv6enabled']
            variableName = '{0:s}_ipv6cidr_block'.format(standardisedName)
            self.jinja2_variables["ipv6cidr_block"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = virtual_cloud_network['ipv6cidr_block']
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

    # TODO: Delete
    def renderTags1(self, artifact):
        standardisedName = self.standardiseResourceName(artifact.get('display_name', artifact.get('name', '')))
        # -- Freeform Tags
        variableName = '{0:s}_freeform_tags'.format(standardisedName)
        self.jinja2_variables["freeform_tags"] = self.formatJinja2Variable(variableName)
        self.run_variables[variableName] = artifact.get("freeform_tags", {})
        # -- Defined Tags
        variableName = '{0:s}_defined_tags'.format(standardisedName)
        self.jinja2_variables["defined_tags"] = self.formatJinja2Variable(variableName)
        definedtags = {}
        for namespace, tags in artifact.get("defined_tags", {}).items():
            for key, value in tags.items():
                definedtags["{0!s:s}.{1!s:s}".format(namespace, key)] = str(value)
        self.run_variables[variableName] = definedtags
        return

    def renderTags(self, artifact):
        # -- Defined Tags
        self.renderDefinedTags(artifact)
        # -- Freeform Tags
        self.renderFreeformTags(artifact)
        return

    def renderDefinedTags(self, artifact):
        tags = artifact.get("defined_tags", {})
        if len(tags.keys()) > 0:
            standardisedName = self.standardiseResourceName(artifact.get('display_name', artifact.get('name', '')))
            # -- Defined Tags
            variableName = '{0:s}_defined_tags'.format(standardisedName)
            self.jinja2_variables["defined_tags"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = tags
        return

    def renderFreeformTags(self, artifact):
        tags = artifact.get("freeform_tags", {})
        if len(tags.keys()) > 0:
            standardisedName = self.standardiseResourceName(artifact.get('display_name', artifact.get('name', '')))
            # -- Freeform Tags
            variableName = '{0:s}_freeform_tags'.format(standardisedName)
            self.jinja2_variables["freeform_tags"] = self.formatJinja2Variable(variableName)
            self.run_variables[variableName] = tags
        return

    def standardiseResourceName(self, name):
        # split() will generate a list with no empty values thus join of this will remove all whitespace
        standardised_name = ''.join(name.title().split()).replace('-', '_')
        return standardised_name

    def createZipArchive(self, dir, archivename):
        shutil.make_archive(archivename, 'zip', dir)
        zipname = '{0:s}.zip'.format(str(archivename))
        return zipname
