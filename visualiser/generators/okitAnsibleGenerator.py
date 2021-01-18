
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociAnsibleGenerator"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import os

from common.okitCommon import writeAnsibleFile
from common.okitLogging import getLogger
from generators.okitGenerator import OCIGenerator

# Configure logging
logger = getLogger()

class OCIAnsibleGenerator(OCIGenerator):
    DIRECTORY_SUFFIX = 'ansible'
    MAIN_FILE_NAME = 'main.yml'
    VARIABLES_FILE_NAME = 'variables.yml'
    OUTPUTS_FILE_NAME = 'output.yml'
    JINJA2_VARIABLE_FORMAT = '{{{{ {0:s} }}}}'

    def __init__(self, template_root, output_root, visualiser_json, use_vars=True):
        template_dir = os.path.join(template_root, self.DIRECTORY_SUFFIX)
        output_dir = os.path.join(output_root, self.DIRECTORY_SUFFIX)
        super(OCIAnsibleGenerator, self).__init__(template_dir, output_dir, visualiser_json, use_vars)

    def writeFiles(self):
        main_rendered = self.getRenderedMain()
        # Write Main ansible processing file
        writeAnsibleFile(os.path.join(self.output_dir, self.MAIN_FILE_NAME), main_rendered)
        # Write Variable files
        variable_values = []
        for key, value in self.getVariables().items():
            if isinstance(value, (int, float, bool, dict)):
                variable_values.append('{0!s:s}: {1}'.format(key, value))
            else:
                variable_values.append('{0!s:s}: "{1}"'.format(key, value))
        writeAnsibleFile(os.path.join(self.output_dir, self.VARIABLES_FILE_NAME), variable_values)

        return

    def formatJinja2IdReference(self, resource_name, element='id'):
        return '{{{{ {0!s:s}_{1!s:s} }}}}'.format(resource_name, element)

    def formatJinja2Variable(self, variable_name):
        return '{{{{ {0:s} }}}}'.format(variable_name)

    def formatJinja2Value(self, value):
        return value


