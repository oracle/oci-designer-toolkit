
# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = "Andrew Hopkinson (Oracle Cloud Solutions A-Team)"
__copyright__ = "Copyright (c) 2020, 2022, Oracle and/or its affiliates."
__version__ = "1.0.0"
__module__ = "ociGenerator"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


from visualiser.common.okitCommon import jsonToFormattedString
import jinja2
import os
import re
import shutil

from common.okitCommon import readYamlFile
from common.okitLogging import getLogger
from model.okitValidation import OCIJsonValidator

# Configure logging
logger = getLogger()

class OCIGenerator(object):
    OKIT_VERSION = "0.55.0"
    def __init__(self, template_dir, output_dir, visualiser_json, use_vars=False, add_provider=True):
        # Initialise generator output data variables
        self.rendered_resources = {}
        self.create_sequence = []
        self.run_variables = {}
        self.data_output = []
        self.connection_provider = []
        self.metadata = []
        # Assign passed values to local
        self.template_dir = template_dir
        self.output_dir = output_dir
        self.visualiser_json = visualiser_json
        self.use_vars = use_vars
        self.add_provider = add_provider
        # Check output directory
        self.getCheckOutputDirectory()
        # Read common variables
        self.variables_yml_file = os.path.join(template_dir, 'variables.yml')
        self.yaml_variables = readYamlFile(self.variables_yml_file)
        # -- Add Common variables to run variables
        for key in self.yaml_variables.keys():
            self.run_variables[key] = ''
        # Initialise Jinja2 Variables
        self.initialiseJinja2Variables()
        # Initialise Jinja2
        self.template_loader = jinja2.FileSystemLoader(searchpath=template_dir)
        self.jinja2_environment = jinja2.Environment(loader=self.template_loader, trim_blocks=True, lstrip_blocks=True, autoescape=True)
        # Initialise working variables
        self.id_name_map = {}
        # Build Empty Rendered Resources
        for v in self.file_map.values():
            self.rendered_resources[v] = []

    def initialiseJinja2Variables(self):
        # Copy common variables
        self.jinja2_variables = dict(self.yaml_variables)
        # -- Add Standard Author / Copyright variables
        self.jinja2_variables["author"] = __author__
        self.jinja2_variables["copyright"] = __copyright__
        self.jinja2_variables["okit_version"] = self.OKIT_VERSION
        self.jinja2_variables["deployment_platform"] = self.visualiser_json.get('metadata', {}).get('platform', 'oci')
        self.jinja2_variables["add_provider"] = self.add_provider
    
    def addStandardResourceVariables(self, resource={}):
        self.jinja2_variables['output_name'] = self.standardiseOutputName(resource['resource_name'])
        # ---- Resource Name
        self.jinja2_variables['resource_name'] = resource.pop('resource_name', None)
        logger.info('Processing Resource {0!s:s}'.format(self.jinja2_variables['resource_name']))
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.getLocalReference(resource.pop('compartment_id', None))
        # ---- Display Name
        if resource.get('display_name', '').startswith('var.'):
            self.jinja2_variables['display_name'] = self.formatJinja2Variable(resource.pop('display_name', 'Missing Display Name')[4:])
        else:
            self.jinja2_variables['display_name'] = self.formatJinja2Value(resource.pop('display_name', 'Missing Display Name'))
        # ---- Read Only
        self.jinja2_variables['read_only'] = resource.pop('read_only', False)
        # ---- Id
        self.jinja2_variables["ocid"] = self.formatJinja2Value(resource.pop('id', None))
        # ---- Tags
        self.renderTags(resource)
        resource.pop('defined_tags', None)
        resource.pop('freeform_tags', None)


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

    def getProvider(self):
        return self.connection_provider

    def getMetadata(self):
        return self.metadata

    def getRenderedMain(self):
        return self.create_sequence

    def getVariables(self):
        return self.run_variables

    def getRenderedOutput(self):
        return self.create_sequence

    def writeFiles(self):
        pass

    def toJson(self):
        pass

    def toText(self):
        main_rendered = self.getRenderedMain()
        return '\n'.join(main_rendered)

    def formatJinja2Variable(self, variable_name):
        pass

    def formatJinja2IdReference(self, resource_name, element='id'):
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
                    # self.id_name_map[self.formatOcid(asset["id"])] = asset.get("display_name", asset.get("name", "Unknown"))
                    self.id_name_map[self.formatOcid(asset["id"])] = asset.get("resource_name", asset.get("display_name", "Unknown"))
                    # logger.info(f'{asset["id"]}: {self.id_name_map[self.formatOcid(asset["id"])]}')
        return
    
    def getLocalReference(self, id):
        reference = self.id_name_map.get(id, None)
        if reference is not None:
            return self.formatJinja2IdReference(reference)
            # return self.formatJinja2IdReference(self.standardiseResourceName(reference))
        else:
            return self.formatJinja2Value(id)

    def formatOcid(self, id):
        return id

    output_files = ["main", "provider", "metadata", "user_defined", "identity", "networking", "storage", "compute", "database", "customer_connectivity", "containers"]
    file_map = {
        "default": "main",
        "provider": "provider",
        "metadata": "metadata",
        "user_defined": "user_defined",

        "bastions": "identity",
        "compartments": "identity",
        "groups": "identity",
        "keys": "identity",
        "users": "identity",
        "vaults": "identity",
        "vault_secrets": "identity",

        "dhcp_options": "networking",
        "drg_attachments": "networking",
        "dynamic_routing_gateway_attachments": "networking",
        "internet_gateways": "networking",
        "load_balancers": "networking",
        "local_peering_gateways": "networking",
        "nat_gateways": "networking",
        "network_firewalls": "networking",
        "network_load_balancers": "networking",
        "network_security_groups": "networking",
        "remote_peering_connections": "networking",
        "route_tables": "networking",
        "security_lists": "networking",
        "service_gateways": "networking",
        "subnets": "networking",
        "virtual_cloud_networks": "networking",

        "block_storage_volumes": "storage",
        "file_systems": "storage",
        "mount_targets": "storage",
        "object_storage_buckets": "storage",

        "analytics_instances": "compute",
        "autoscaling_configurations": "compute",
        "data_science_projects": "compute",
        "instances": "compute",
        "instance_configurations": "compute",
        "instance_pools": "compute",
        "oracle_digital_assistants": "compute",
        "visual_builder_instances": "compute",

        "autonomous_databases": "database",
        "database_systems": "database",
        "exadata_cloud_infrastructures": "database",
        "mysql_database_systems": "database",
        "nosql_databases": "database",

        "customer_premise_equipments": "customer_connectivity",
        "drgs": "customer_connectivity",
        "dynamic_routing_gateways": "customer_connectivity",
        "ipsec_connections": "customer_connectivity",

        "oke_clusters": "containers",
        "node_pools": "containers",
    }
    resource_template_map = {
        "drgs": ["drg.jinja2", "drg_route_distribution.jinja2", "drg_route_table.jinja2"],
    }
    integer_elements = ["availability_domain"]

    def generate(self):
        # Validate input json
        validator = OCIJsonValidator(self.visualiser_json)
        validator.validate()
        # Build the Id to Name Map
        self.buildIdNameMap()
        # Generate Copyright 
        logger.info("Processing Copyright Information")
        jinja2_template = self.jinja2_environment.get_template("copyright.jinja2")
        self.copyright = jinja2_template.render(self.jinja2_variables)
        # Process Provider Connection information
        logger.info("Processing Provider Information")
        self.connection_provider.append(self.copyright)
        jinja2_template = self.jinja2_environment.get_template("provider.jinja2")
        self.connection_provider.append(jinja2_template.render(self.jinja2_variables))
        # self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        # logger.debug(self.create_sequence[-1])

        # Process Regional Data
        logger.info("Processing Region Information")
        self.metadata.append(self.copyright)
        jinja2_template = self.jinja2_environment.get_template("region_data.jinja2")
        self.metadata.append(jinja2_template.render(self.jinja2_variables))
        # self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        # logger.debug(self.create_sequence[-1])

        # Process Main Data
        self.create_sequence.append(self.copyright)

        # --- Get List of Compartment Ids
        compartment_ids = [compartment['id'] for compartment in self.visualiser_json.get('compartments', [])]
        logger.info('Compartment Ids {0!s:s}'.format(compartment_ids))

        # --- Preprocess selected resources
        # ---- Local Peering Gateways - Done to stop TF Cyclic references
        for lpg in self.visualiser_json.get("local_peering_gateways", []):
            peers = [l for l in self.visualiser_json["local_peering_gateways"] if l["id"] == lpg["peer_id"]]
            if len(peers) > 0:
                peers[0]["peer_id"] = ''

        # Loop through resource lists
        for key, value in sorted(self.visualiser_json.items()):
            if isinstance(value, list):
                for resource in value:
                    resource['root_compartment'] = (resource.get('compartment_id', 'ROOT') not in compartment_ids)
                    self.renderResource(key, resource, self.resource_template_map.get(key, [f'{key[:-1]}.jinja2']))
        return

    # Render Resources

    def renderResource(self, resource_type, resource, templates=[]):
        # logger.info(f'resource_name {resource["resource_name"]} - old Standardised Resource Name {self.standardiseResourceName(resource["display_name"])}')
        # Reset Variables
        self.initialiseJinja2Variables()
        # ---- Add Standard
        self.addStandardResourceVariables(resource)
        # ---- Remove OKIT Meta Data
        resource.pop('documentation', None)
        resource.pop('definition', None)
        # ---- Process Remaining Keys
        self.processResourceElements(resource, self.jinja2_variables)
        # logger.info(jsonToFormattedString(self.jinja2_variables))

        default_key = self.file_map['default']
        resource_key = self.file_map.get(resource_type, default_key)
        rendered_resources = self.rendered_resources[resource_key]
        # -- Render Template
        for template in templates:
            jinja2_template = self.jinja2_environment.get_template(template)
            self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
            rendered_resources.append(jinja2_template.render(self.jinja2_variables))
        # logger.debug(self.create_sequence[-1])
        return         

    def processResourceElements(self, json_data, parent={}, idx=0):
        # Process Elements in Json Data
        if isinstance(json_data, dict):
            for key, val in json_data.items():
                # logger.info(f'Processing {key}')
                if isinstance(val, str):
                    # Process Simple Elements First
                    # if key.endswith('_ids') and isinstance(val, list):
                    #     # List of Reference Ids
                    #     ids = [self.getLocalReference(id) for id in val]
                    #     parent[key] = self.formatJinja2Value(ids)
                    if key == 'resource_name':
                        parent[key] = val
                    elif (key.endswith('_id') or key == 'id') and val != '':
                        # Simple Reference
                        parent[key] = self.getLocalReference(val)
                        parent[f'{key}_resource_name'] = self.id_name_map.get(val, 'unknown')
                    elif val != '' and val.startswith('var.'):
                        # Add Variable
                        parent[key] = self.formatJinja2Variable(val[4:].replace('\n', '\\n').replace('"', '\\"'))
                        # parent[key] = self.formatJinja2Value(val)
                    elif val != '' and key in self.integer_elements:
                        # Simple numeric
                        parent[key] = self.formatJinja2Value(int(val))
                    elif val != '':
                        # Add Simple Value
                        parent[key] = self.formatJinja2Value(val.replace('\n', '\\n').replace('"', '\\"'))
                        # parent[key] = self.formatJinja2Value(val)
                    else:
                        # Remove empty / optional value
                        parent.pop(key, None)
                elif isinstance(val, dict):
                    # Child Dict so recursively call routine
                    parent[key] = {}
                    self.processResourceElements(val, parent[key])
                    if len(parent[key].keys()) == 0:
                        # Dictionary is empty
                        parent.pop(key, None)
                elif isinstance(val, list):
                    if len(val) > 0 and isinstance(val[0], dict):
                        parent[key] = []
                        for element in val:
                            entry = {}
                            self.processResourceElements(element, entry)
                            if len(entry.keys()) > 0:
                                parent[key].append(entry)
                    elif len(val) > 0:
                        if key.endswith('_ids') and isinstance(val, list):
                            # List of Reference Ids
                            parent[key] = [self.getLocalReference(id) for id in val]
                            # ids = [self.getLocalReference(id) for id in val]
                            # parent[key] = self.formatJinja2Value(ids)
                        else:
                            parent[key] = val
                    else:
                        parent.pop(key, None)
                elif isinstance(val, bool):
                    parent[key] = self.formatJinja2Value(val)
                elif val != None:
                    parent[key] = self.formatJinja2Value(val)
                else:
                    logger.info(f'Ignoring: {key} / {val}')
                    parent.pop(key, None)
        return

    def addJinja2Variable(self, name, value, resource):
        self.jinja2_variables[name] = self.generateJinja2Variable(name, value, resource)
        return

    def removeJinja2Variable(self, name):
        self.jinja2_variables.pop(name, None)
        return

    def getJinja2Variable(self, name):
        return self.jinja2_variables[name]

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

    def renderDefinedTags(self, resource):
        tags = {**resource.get("defined_tags", {}), **self.visualiser_json.get("defined_tags", {}), **self.getOkitDefinedTags(resource)}
        if len(tags.keys()) > 0:
            if self.use_vars:
                standardisedName = self.standardiseResourceName(resource.get('display_name', resource.get('name', '')))
                standardisedName = self.standardiseResourceName(resource.get('resource_name', resource['display_name']))
                # -- Defined Tags
                variableName = '{0:s}_defined_tags'.format(standardisedName)
                self.run_variables[variableName] = tags
                self.jinja2_variables["defined_tags"] = self.formatJinja2Variable(variableName)
            else:
                self.jinja2_variables["defined_tags"] = self.formatJinja2Value(tags)
        else:
            self.jinja2_variables.pop("defined_tags", None)
        return

    def renderFreeformTags(self, resource):
        tags = {**resource.get("freeform_tags", {}), **self.visualiser_json.get("freeform_tags", {}), **self.getOkitFreeformTags(resource)}
        # 'okit_version': self.OKIT_VERSION, 'okit_reference': resource.get('okit_reference', 'Unknown')
        if len(tags.keys()) > 0:
            if self.use_vars:
                standardisedName = self.standardiseResourceName(resource.get('display_name', resource.get('name', '')))
                standardisedName = self.standardiseResourceName(resource.get('resource_name', resource['display_name']))
                # -- Freeform Tags
                variableName = '{0:s}_freeform_tags'.format(standardisedName)
                self.run_variables[variableName] = tags
                self.jinja2_variables["freeform_tags"] = self.formatJinja2Variable(variableName)
            else:
                self.jinja2_variables["freeform_tags"] = self.formatJinja2Value(tags)
        else:
            self.jinja2_variables.pop("freeform_tags", None)
        return
    
    def getOkitDefinedTags(self, resource):
        return {}
        # return {"okit": {"version": self.OKIT_VERSION, "reference": resource.get('okit_reference', 'Unknown')}}

    def getOkitFreeformTags(self, resource=None):
        if resource is None:
            return {"okit_version": self.OKIT_VERSION, "okit_model_id": self.visualiser_json.get("metadata", {}).get("okit_model_id", "Unknown")}
        else:
            return {"okit_version": self.OKIT_VERSION, "okit_model_id": self.visualiser_json.get("metadata", {}).get("okit_model_id", "Unknown"), "okit_reference": resource.get('okit_reference', 'Unknown')}

    def standardiseResourceName(self, name):
        # split() will generate a list with no empty values thus join of this will remove all whitespace
        standardised_name = ''.join(name.title().split()).replace('-', '_')
        # Remove all non alphanumeric character appart from '_'
        standardised_name = re.sub('[^0-9a-zA-Z_]+', '', standardised_name)
        return standardised_name

    def standardiseOutputName(self, name):
        # split() will generate a list with no empty values thus join of this will remove all whitespace
        standardised_name = ''.join(name.title().split()).replace('-', '_')
        return standardised_name

    def createZipArchive(self, dir, archivename):
        logger.info(f'Creating Zip Archive for directory : {dir} {archivename}')
        shutil.make_archive(archivename, 'zip', dir)
        zipname = '{0:s}.zip'.format(str(archivename))
        return zipname
