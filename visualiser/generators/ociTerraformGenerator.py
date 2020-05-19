
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "ociTerraformGenerator"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import os
import json

from common.ociCommon import writeTerraformFile
from common.ociLogging import getLogger
from generators.ociGenerator import OCIGenerator

# Configure logging
logger = getLogger()

class OCITerraformGenerator(OCIGenerator):
    DIRECTORY_SUFFIX = 'terraform'
    MAIN_FILE_NAME = 'main.tf'
    VARIABLES_FILE_NAME = 'variables.tf'
    TERRAFORM_FILE_NAME = 'terraform.tfvars'
    OUTPUTS_FILE_NAME = 'output.tf'
    JINJA2_VARIABLE_FORMAT = 'var.{0:s}'

    def __init__(self, template_root, output_root, visualiser_json, use_vars=True):
        template_dir = os.path.join(template_root, self.DIRECTORY_SUFFIX)
        output_dir = os.path.join(output_root, self.DIRECTORY_SUFFIX)
        super(OCITerraformGenerator, self).__init__(template_dir, output_dir, visualiser_json, use_vars)

    def writeFiles(self):
        main_rendered = self.getRenderedMain()
        # Write Main tf processing file
        writeTerraformFile(os.path.join(self.output_dir, self.MAIN_FILE_NAME), main_rendered)
        # Write Variable files
        variable_definitions = []
        variable_values = []
        for key, value in self.getVariables().items():
            if type(value) is dict:
                variable_values.append('{0!s:s} = {1!s:s}'.format(key, json.dumps(value)))
            elif type(value) is bool:
                variable_values.append('{0!s:s} = "{1}"'.format(key, str(value).lower()))
            else:
                variable_values.append('{0!s:s} = "{1}"'.format(key, value))
            variable_definitions.append('variable "{0:s}" {{}}'.format(key))
            #variable_definitions.append('variable "{0:s}" {{\ndefault = "{1}"\n}}'.format(key, value))
        writeTerraformFile(os.path.join(self.output_dir, self.VARIABLES_FILE_NAME), variable_definitions)
        writeTerraformFile(os.path.join(self.output_dir, self.TERRAFORM_FILE_NAME), variable_values)

        return

    def formatJinja2Variable(self, variable_name):
        return 'var.{0:s}'.format(variable_name)

    def formatJinja2IdReference(self, resource_name):
        return 'local.{0:s}_id'.format(resource_name)

    def formatJinja2DhcpReference(self, resource_name):
        return 'local.{0:s}_dhcp_options_id'.format(resource_name)

    def formatJinja2Value(self, value):
        if isinstance(value, dict):
            return json.dumps(value)
        elif isinstance(value, bool):
            return str(value).lower()
        else:
            return '"{0!s:s}"'.format(value)

    def renderDefinedTags(self, artifact):
        defined_tags = artifact.get("defined_tags", {})
        if len(defined_tags.keys()) > 0:
            standardisedName = self.standardiseResourceName(artifact.get('display_name', artifact.get('name', '')))
            # -- Defined Tags
            variableName = '{0:s}_defined_tags'.format(standardisedName)
            self.jinja2_variables["defined_tags"] = self.formatJinja2Variable(variableName)
            definedtags = {}
            for namespace, tags in defined_tags.items():
                for key, value in tags.items():
                    definedtags["{0!s:s}.{1!s:s}".format(namespace, key)] = str(value)
            self.run_variables[variableName] = definedtags
        return


