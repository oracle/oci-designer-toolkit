#!/usr/bin/python

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitMarkdownGenerator"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import jinja2
import os
import shutil
import yaml

from common.okitCommon import writeMarkdownFile
from common.okitLogging import getLogger
from generators.okitGenerator import OCIGenerator

# Configure logging
logger = getLogger()

class OkitMarkdownGenerator(OCIGenerator):
    DIRECTORY_SUFFIX = 'markdown'
    MAIN_FILE_NAME = 'okit_markdown.md'

    def __init__(self, template_root, output_root, model_json, use_vars=False):
        self.model_json = model_json
        template_dir = os.path.join(template_root, self.DIRECTORY_SUFFIX)
        output_dir = os.path.join(output_root, self.DIRECTORY_SUFFIX)
        super(OkitMarkdownGenerator, self).__init__(template_dir, output_dir, model_json, use_vars)

    def generate(self):
        logger.info('Generating Markdown')
        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("markdown.jinja2")
        self.create_sequence.append(jinja2_template.render(self.model_json))
        logger.info(self.create_sequence[-1])
        return

    def writeFiles(self):
        main_rendered = self.getRenderedMain()
        # Write Markdown file
        writeMarkdownFile(os.path.join(self.output_dir, self.MAIN_FILE_NAME), main_rendered)
