
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "ociAnsibleGenerator"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import os

from common.ociCommon import writePythonFile
from common.ociLogging import getLogger
from generators.ociGenerator import OCIGenerator

# Configure logging
logger = getLogger()

class OCIPythonGenerator(OCIGenerator):
    DIRECTORY_SUFFIX = 'python'
    MAIN_FILE_NAME = 'main.py'
    VARIABLES_FILE_NAME = 'variables.py'
    OUTPUTS_FILE_NAME = 'output.py'
    JINJA2_VARIABLE_FORMAT = '{{{{ {0:s} }}}}'

    def __init__(self, template_root, output_root, visualiser_json, use_vars=True):
        template_dir = os.path.join(template_root, self.DIRECTORY_SUFFIX)
        output_dir = os.path.join(output_root, self.DIRECTORY_SUFFIX)
        super(OCIPythonGenerator, self).__init__(template_dir, output_dir, visualiser_json, use_vars)

    def writeFiles(self):
        main_rendered = self.getRenderedMain()
        # -- Render msin.py Template
        jinja2_template = self.jinja2_environment.get_template("main.py.jinja2")
        # Write Main tf processing file
        writePythonFile(os.path.join(self.output_dir, self.MAIN_FILE_NAME), jinja2_template.render({"api_calls": main_rendered}))
        # Write Variable files
        variable_definitions = []
        variable_values = []
        for key, value in self.getVariables().items():
            variable_values.append('{0!s:s} = "{1}"'.format(key, value))
        writePythonFile(os.path.join(self.output_dir, self.VARIABLES_FILE_NAME), variable_values)

        return

    def formatJinja2Variable(self, variable_name):
        return '{0:s}'.format(variable_name)

    def formatJinja2IdReference(self, resource_name):
        return '{0:s}_id'.format(resource_name)

    def formatJinja2DhcpReference(self, resource_name):
        return '{0:s}_dhcp_options_id'.format(resource_name)


