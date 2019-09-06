# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "ociTerraform11Generator"
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
import sys

from generators.ociTerraform11Generator import OCITerraform11Generator

from common.ociCommon import logJson
from common.ociCommon import readJsonFile
from common.ociCommon import readYamlFile
from common.ociCommon import writeTerraformFile
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()

class OCIResourceManagerGenerator(OCITerraform11Generator):

    def __init__(self, template_root, output_root, visualiser_json, tenancy_ocid=None, region=None, compartment_ocid=None, **kwargs):
        DIRECTORY_SUFFIX = 'resource-manager'
        super(OCIResourceManagerGenerator, self).__init__(template_root, output_root, visualiser_json)
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

    def writeFiles(self):
        main_rendered = self.getRenderedMain()
        # Write Main tf processing file
        # Remove Provider entry because this is not required for Resource Manager
        writeTerraformFile(os.path.join(self.output_dir, self.MAIN_FILE_NAME), main_rendered[1:])
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
            logger.info('key : {0!s:s}'.format(key))
            variable_definitions.append('variable "{0!s:s}" {{}}'.format(key))
        writeTerraformFile(os.path.join(self.output_dir, self.VARIABLES_FILE_NAME), variable_definitions)

        return
