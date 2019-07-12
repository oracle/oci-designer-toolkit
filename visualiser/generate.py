#!/usr/bin/python
# Copyright (c) 2013, 2014-2017 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "generate.py"
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

from generators.ociAnsibleGenerator import OCIAnsibleGenerator
from generators.ociPythonGenerator import OCIPythonGenerator
from generators.ociTerraformGenerator import OCITerraformGenerator
from common.ociCommon import readJsonFile
from common.ociCommon import readYamlFile
from common.ociCommon import writeTerraformFile
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()

# Execute workflow
def processWorkflow(args):
    if not os.path.isfile(args['visualiserfile']):
        logger.warning("Visualiser file {0:s} does not exist or is not a file.".format(args['visualiserfile']))
        return
    else:
        visualiser_json = readJsonFile(args['visualiserfile'])

    if not os.path.isdir(args['templatesroot']):
        logger.warning("Template Root Directory {0:s} does not exist or is not a directory.".format(args['templatesroot']))
        return
    else:
        template_root = args['templatesroot']

    if not os.path.isdir(args['destinationdir']):
        logger.warning("Destination Directory {0:s} does not exist or is not a directory.".format(args['destinationdir']))
        return
    else:
        destination_dir = args['destinationdir']

    # Check if we require Terraform
    if args['terraform']:
        terraformGenerator = OCITerraformGenerator(template_root, destination_dir, visualiser_json)
        terraformGenerator.generate()
        terraformGenerator.writeFiles()
    # Check if we require Ansible
    if args['ansible']:
        ansibleGenerator = OCIAnsibleGenerator(template_root, destination_dir, visualiser_json)
        ansibleGenerator.generate()
        ansibleGenerator.writeFiles()
    # Check if we require Python
    if args['python']:
        pythonGenerator = OCIPythonGenerator(template_root, destination_dir, visualiser_json)
        pythonGenerator.generate()
        pythonGenerator.writeFiles()

    return


# Set default values for Args
def defaultArgs():
    args = {}
    args['templatesroot'] = os.path.join(os.path.dirname(os.path.realpath(__file__)), "templates")
    args['destinationdir'] = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test", "output")
    args['visualiserfile'] = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test", "input", "visualiser.json")
    args['terraform'] = True
    args['ansible'] = False
    args['python'] = False
    return args


# Read Module Arguments
def readargs(opts, args):
    moduleargs = defaultArgs()

    # Read Module Command Line Arguments.
    for opt, arg in opts:
        if opt in ("-f", "--visualiserfile"):
            moduleargs['visualiserfile'] = arg
        elif opt in ("-d", "--destinationdir"):
            moduleargs['destinationdir'] = arg
        elif opt in ("-t", "--terraform"):
            moduleargs['terraform'] = True
        elif opt in ("-a", "--ansible"):
            moduleargs['ansible'] = True
        elif opt in ("-p", "--python"):
            moduleargs['python'] = True

    return moduleargs


# Main processing function
def main(argv):
    # Configure Parameters and Options
    options = 'd:f:tap'
    longOptions = ['visualiserfile=', 'destinationdir=', 'terraform', 'ansible', 'python']
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
