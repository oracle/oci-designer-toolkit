#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates. 
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl. 
"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitCodeGenerator"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import getopt
import jinja2
import os
import shutil
import sys

from common.okitCommon import writeFile
from common.okitLogging import getLogger

# Configure logging
logger = getLogger()

# Execute workflow
def processWorkflow(args):
    if args["name"] != "":
        overwrite = args['overwrite']
        template_dir = "./templates"
        template_loader = jinja2.FileSystemLoader(searchpath=template_dir)
        jinja2_environment = jinja2.Environment(loader=template_loader, trim_blocks=True, lstrip_blocks=True, autoescape=True)
        artefact_name = args["name"]
        svg_id = artefact_name.replace(" ", "_")
        model_class_name = artefact_name.replace(" ", "")
        standardised_name = artefact_name.replace(" ", "_").lower()
        artefact_json_list = "{0!s:s}s".format(standardised_name)
        name_prefix = ''.join([x[0] for x in artefact_name.split()]).lower()
        jinja2_variables = {}
        jinja2_variables["artefact_name"] = artefact_name
        jinja2_variables["svg_id"] = svg_id
        jinja2_variables["model_class_name"] = model_class_name
        jinja2_variables["html_name"] = standardised_name
        jinja2_variables["artefact_simple_name"] = standardised_name
        jinja2_variables["artefact_json_list"] = artefact_json_list
        jinja2_variables["name_prefix"] = name_prefix
        # -- Render Templates
        # --- Front End
        # ---- Artefact Model JavaScript
        jinja2_template = jinja2_environment.get_template("artefact_model.js.jinja2")
        rendered = jinja2_template.render(jinja2_variables)
        #logger.info(rendered)
        filename = "../okitweb/static/okit/model/js/resources/{0!s:s}.js".format(standardised_name)
        writeFile(filename, rendered, overwrite)
        # ---- Model Functions JavaScript
        #jinja2_template = jinja2_environment.get_template("model_functions.jinja2")
        #rendered = jinja2_template.render(jinja2_variables)
        #logger.info(rendered)
        #filename = "../okitweb/static/okit/model/js/Additional_Model_Functions_For_{0!s:s}.js".format(svg_id)
        #writeFile(filename, rendered, overwrite)
        # --- Artefact View JavaScript
        jinja2_template = jinja2_environment.get_template("artefact_view.js.jinja2")
        rendered = jinja2_template.render(jinja2_variables)
        #logger.info(rendered)
        filename = "../okitweb/static/okit/views/compartment/js/resources/{0!s:s}.js".format(standardised_name)
        writeFile(filename, rendered, overwrite)
        # --- Resource Properties JavaScript
        jinja2_template = jinja2_environment.get_template("artefact_properties.js.jinja2")
        rendered = jinja2_template.render(jinja2_variables)
        #logger.info(rendered)
        filename = "../okitweb/static/okit/properties/js/resources/{0!s:s}.js".format(standardised_name)
        writeFile(filename, rendered, overwrite)
        # ---- View Functions JavaScript
        #jinja2_template = jinja2_environment.get_template("view_functions.jinja2")
        #rendered = jinja2_template.render(jinja2_variables)
        #logger.info(rendered)
        #filename = "../okitweb/static/okit/view/js/Additional_View_Functions_For_{0!s:s}.js".format(svg_id)
        #writeFile(filename, rendered, overwrite)
        # ---- SVG
        # jinja2_template = jinja2_environment.get_template("artefact.svg.jinja2")
        # rendered = jinja2_template.render(jinja2_variables)
        # #logger.info(rendered)
        # filename = "../okitweb/static/okit/palette/svg/{0!s:s}.svg".format(svg_id)
        # writeFile(filename, rendered, overwrite)
        # # ---- Properties HTML
        # jinja2_template = jinja2_environment.get_template("artefact_properties.html.jinja2")
        # rendered = jinja2_template.render(jinja2_variables)
        # #logger.info(rendered)
        # filename = "../okitweb/templates/okit/propertysheets/{0!s:s}.html".format(standardised_name)
        # writeFile(filename, rendered, overwrite)
        # # ---- Value Proposition HTML
        # jinja2_template = jinja2_environment.get_template("artefact_value_proposition.html.jinja2")
        # rendered = jinja2_template.render(jinja2_variables)
        # #logger.info(rendered)
        # filename = "../okitweb/templates/okit/valueproposition/{0!s:s}.html".format(standardised_name)
        # writeFile(filename, rendered, overwrite)
        # --- Backend
        # ---- Python Facade
        # jinja2_template = jinja2_environment.get_template("artefact_facade.py.jinja2")
        # rendered = jinja2_template.render(jinja2_variables)
        # #logger.info(rendered)
        # filename = "../visualiser/facades/oci{0!s:s}.py".format(model_class_name)
        # writeFile(filename, rendered, overwrite)
    return


# Set default values for Args
def defaultArgs():
    args = {}
    args['name'] = ""
    args['overwrite'] = False
    return args


# Read Module Arguments
def readargs(opts, args):
    moduleargs = defaultArgs()

    # Read Module Command Line Arguments.
    for opt, arg in opts:
        if opt in ("-n", "--name"):
            moduleargs['name'] = arg
        elif opt in ("-t", "--toolsdir"):
            moduleargs['toolsdir'] = arg
        elif opt in ("-o", "--overwrite"):
            moduleargs['overwrite'] = True

    return moduleargs

def usage():
    print('python3 okitCodeSkeletonGenerator.py --name "<Resource Name>"')


# Main processing function
def main(argv):
    # Configure Parameters and Options
    options = 'n:o'
    longOptions = ['name=', 'overwrite']
    # Get Options & Arguments
    try:
        opts, args = getopt.getopt(argv, options, longOptions)
        # Read Module Arguments
        moduleargs = readargs(opts, args)
        processWorkflow(moduleargs)
    except getopt.GetoptError:
        usage()
    except Exception as e:
        print('Unknown Exception please check log file')
        logger.exception(e)
        sys.exit(1)

    return


# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
