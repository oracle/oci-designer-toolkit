#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "validator"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import getopt
import sys

from common.ociLogging import getLogger

# Configure logging
logger = getLogger()

# Execute workflow
def processWorkflow(args):
    return


# Set default values for Args
def defaultArgs():
    args = {}
    args['projectdir'] = "/workspace/pcma/projects"
    args['toolsdir'] = "/workspace/pcma/tools"
    return args


# Read Module Arguments
def readargs(opts, args):
    moduleargs = defaultArgs()

    # Read Module Command Line Arguments.
    for opt, arg in opts:
        if opt in ("-p", "--projectdir"):
            moduleargs['projectdir'] = arg
        elif opt in ("-t", "--toolsdir"):
            moduleargs['toolsdir'] = arg

    return moduleargs


def usage():
    return


# Main processing function
def main(argv):
    # Configure Parameters and Options
    options = 'p:t:'
    longOptions = ['projectdir=', 'toolsdir=']
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
