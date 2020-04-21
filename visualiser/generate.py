#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "generate.py"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import getopt
import os
import sys

from common.ociCommon import readJsonFile
from common.ociLogging import getLogger
from generators.ociAnsibleGenerator import OCIAnsibleGenerator
from generators.ociPythonGenerator import OCIPythonGenerator
from generators.ociTerraformGenerator import OCITerraformGenerator

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


def usage():
    return


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
