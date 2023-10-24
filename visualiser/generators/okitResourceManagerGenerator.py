
# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
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
from generators.okitTerraformGenerator import OCITerraformGenerator

# Configure logging
logger = getLogger()

class OCIResourceManagerGenerator(OCITerraformGenerator):

    def __init__(self, template_root, output_root, visualiser_json, use_vars=False, tenancy_ocid=None, region=None, compartment_ocid=None):
        DIRECTORY_SUFFIX = 'resource-manager'
        super(OCIResourceManagerGenerator, self).__init__(template_root, output_root, visualiser_json, use_vars, add_provider=False)
        self.output_dir = os.path.join(output_root, DIRECTORY_SUFFIX)
        logger.info('OCIResourceManagerGenerator : Template Directory {0!s:s}'.format(template_root))
        logger.info('OCIResourceManagerGenerator : Output Directory {0!s:s}'.format(output_root))
        # Check output directory
        self.getCheckOutputDirectory()
        self.resource_manager_keys = {}
        self.resource_manager_keys['tenancy_ocid'] = tenancy_ocid
        self.resource_manager_keys['region'] = region
        self.resource_manager_keys['compartment_ocid'] = compartment_ocid
        logger.info('Resource Manager Keys : {0!s:s}'.format(self.resource_manager_keys))

    def initialiseJinja2Variables(self):
        super(OCIResourceManagerGenerator, self).initialiseJinja2Variables()
        self.jinja2_variables["resource_manager"] = True

    def writeFilesOriginal(self):
        # Write Provider tf file
        writeTerraformFile(os.path.join(self.output_dir, self.PROVIDER_FILE_NAME), self.getProvider())
        # Write Metadata tf file
        writeTerraformFile(os.path.join(self.output_dir, self.METADATA_FILE_NAME), self.getMetadata())
        # Write Main tf processing file
        # Remove Provider entry because this is not required for Resource Manager
        main_rendered = self.getRenderedMain()
        # writeTerraformFile(os.path.join(self.output_dir, self.MAIN_FILE_NAME), main_rendered[1:])
        writeTerraformFile(os.path.join(self.output_dir, self.MAIN_FILE_NAME), self.getRenderedMain())
        # Write Variable files
        variable_definitions = []
        # Delete Provider Variables
        del self.run_variables['user_ocid']
        del self.run_variables['private_key_path']
        del self.run_variables['fingerprint']
        # Specify Values for Resource Manager Connection
        self.run_variables['tenancy_ocid'] = self.resource_manager_keys['tenancy_ocid']
        self.run_variables['region'] = self.resource_manager_keys['region']
        self.run_variables['compartment_ocid'] = self.resource_manager_keys['compartment_ocid']
        for key, value in self.getVariables().items():
            # Convert to string
            self.run_variables[key] = str(value)
            variable_definitions.append('variable "{0!s:s}" {{}}'.format(key))
        writeTerraformFile(os.path.join(self.output_dir, self.VARIABLES_FILE_NAME), variable_definitions)
        # User Defined - Unchecked Terraform
        user_defined_terraform = self.visualiser_json.get('user_defined', {}).get('terraform', '')
        if user_defined_terraform.rstrip() != '':
            writeTerraformFile(os.path.join(self.output_dir, self.USER_DEFINED_FILE_NAME), [user_defined_terraform])

        return
    
    def writeFiles(self):
        # Delete Provider Variables
        del self.run_variables['user_ocid']
        del self.run_variables['private_key_path']
        del self.run_variables['fingerprint']
        # Specify Values for Resource Manager Connection
        self.run_variables['tenancy_ocid'] = self.resource_manager_keys['tenancy_ocid']
        self.run_variables['region'] = self.resource_manager_keys['region']
        self.run_variables['compartment_ocid'] = self.resource_manager_keys['compartment_ocid']
        # Get Data
        generated_tf = self.toJson(True)
        logger.info(f'Resource Manager Generated TF {generated_tf}')
        for key, value in generated_tf.items():
            writeTerraformFile(os.path.join(self.output_dir, key), value)
        return
