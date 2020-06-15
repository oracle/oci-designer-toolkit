
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociTerraform11Generator"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import os

from common.okitCommon import writeTerraformFile
from common.okitLogging import getLogger
from generators.okitGenerator import OCIGenerator

# Configure logging
logger = getLogger()

class OCITerraform11Generator(OCIGenerator):
    DIRECTORY_SUFFIX = 'terraform11'
    MAIN_FILE_NAME = 'main.tf'
    VARIABLES_FILE_NAME = 'variables.tf'
    TERRAFORM_FILE_NAME = 'terraform.tfvars'
    OUTPUTS_FILE_NAME = 'output.tf'
    JINJA2_VARIABLE_FORMAT = '${{var.{0:s}}}'

    def __init__(self, template_root, output_root, visualiser_json):
        template_dir = os.path.join(template_root, self.DIRECTORY_SUFFIX)
        output_dir = os.path.join(output_root, self.DIRECTORY_SUFFIX)
        logger.info('OCITerraform11Generator : Template Directory {0!s:s}'.format(template_dir))
        logger.info('OCITerraform11Generator : Output Directory {0!s:s}'.format(output_dir))
        super(OCITerraform11Generator, self).__init__(template_dir, output_dir, visualiser_json)

    def writeFiles(self):
        main_rendered = self.getRenderedMain()
        # Write Main tf processing file
        writeTerraformFile(os.path.join(self.output_dir, self.MAIN_FILE_NAME), main_rendered)
        # Write Variable files
        variable_definitions = []
        variable_values = []
        for key, value in self.getVariables().items():
            variable_values.append('{0!s:s} = "{1}"'.format(key, value))
            variable_definitions.append('variable "{0:s}" {{}}'.format(key))
        writeTerraformFile(os.path.join(self.output_dir, self.VARIABLES_FILE_NAME), variable_definitions)
        writeTerraformFile(os.path.join(self.output_dir, self.TERRAFORM_FILE_NAME), variable_values)

        return

    def formatJinja2Variable(self, variable_name):
        return '${{var.{0:s}}}'.format(variable_name)

    def formatJinja2IdReference(self, resource_name):
        return '${{local.{0:s}_id}}'.format(resource_name)

    def formatJinja2DhcpReference(self, resource_name):
        return '${{local.{0:s}_dhcp_options_id}}'.format(resource_name)


