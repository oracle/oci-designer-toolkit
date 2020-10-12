#!/usr/bin/python3

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okit_generate"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import getopt
import sys

from common.okitCommon import readJsonFile
from common.okitLogging import getLogger
from generators.okitAnsibleGenerator import OCIAnsibleGenerator
from generators.okitTerraformGenerator import OCITerraformGenerator
from generators.okitResourceManagerGenerator import OCIResourceManagerGenerator

# Configure logging
logger = getLogger()

# Execute workflow
def processWorkflow(args):
    try:
        okit_json = readJsonFile(args["json"])
        if args['format'].lower() == 'terraform':
            generator = OCITerraformGenerator(args['templateroot'], args["outputdir"], okit_json, False)
        elif args['format'].lower() == 'ansible':
            generator = OCIAnsibleGenerator(args['templateroot'], args["outputdir"], okit_json, False)
        elif args['format'].lower() == 'resource-manager':
            generator = OCIResourceManagerGenerator(args['templateroot'], args["outputdir"], okit_json, False)
        else:
            logger.warn('Not a Valid Output Format : {0!s:s}'.format(args['format']))
            logger.warn('Valid Options :')
            logger.warn('   ansible          : Generate Ansible Playbook')
            logger.warn('   terraform        : Generate Terraform Files')
            logger.warn('   resource-manager : Generate Resource Manager Terraform Files')
            raise Exception()
        generator.generate()
        generator.writeFiles()
    except Exception:
        pass
    return


# Set default values for Args
def defaultArgs():
    args = {}
    args['json'] = "okit.json"
    args['format'] = 'terraform'
    args['outputdir'] = "./okit/generated"
    args['template_root'] = '/okit/visualiser/templates'
    return args


# Read Module Arguments
def readargs(opts, args):
    moduleargs = defaultArgs()

    # Read Module Command Line Arguments.
    for opt, arg in opts:
        if opt in ("-j", "--json"):
            moduleargs['json'] = arg
        elif opt in ("-o", "--outputdir"):
            moduleargs['outputdir'] = arg
        elif opt in ("-t", "--templateroot"):
            moduleargs['templateroot'] = arg
        elif opt in ("-f", "--format"):
            moduleargs['format'] = arg

    return moduleargs


# Main processing function
def main(argv):
    # Configure Parameters and Options
    options = 'j:f:o:t:'
    longOptions = ['json=', 'format=', 'outputdir=', 'templateroot=']
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
