#!/usr/bin/python3

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okit_query"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import getopt
import sys

from common.okitCommon import writeJsonFile
from common.okitCommon import logJson
from common.okitCommon import jsonToFormattedString
from common.okitLogging import getLogger
from query.ociQuery import OCIQuery

# Configure logging
logger = getLogger()

# Execute workflow
def processWorkflow(args):
    try:
        output_json = args['json']
        config_profile = args['profile']
        compartments = args['compartment_id']
        regions = args['region']
        region = args['region']
        sub_compartments = args['sub_compartments']
        logger.info('Using Profile : {0!s:s}'.format(config_profile))
        config = {'region': region}
        query = OCIQuery(config=config, profile=config_profile)
        response = query.executeQuery(regions=[regions] if regions else None, compartments=[compartments] if compartments else None, include_sub_compartments=sub_compartments)
        logJson(response)
        writeJsonFile(response, output_json)
        return response
    except Exception as e:
        logger.exception(e)
    return


# Set default values for Args
def defaultArgs():
    args = {}
    args['profile'] = "DEFAULT"
    args['json'] = "./okit.json"
    args['compartment_id'] = ""
    args['region'] = ""
    args['sub_compartments'] = False
    return args


# Read Module Arguments
def readargs(opts, args):
    moduleargs = defaultArgs()

    # Read Module Command Line Arguments.
    for opt, arg in opts:
        if opt in ("-j", "--json"):
            moduleargs['json'] = arg
        elif opt in ("-p", "--profile"):
            moduleargs['profile'] = arg
        elif opt in ("-c", "--compartment_id"):
            moduleargs['compartment_id'] = arg
        elif opt in ("-r", "--region"):
            moduleargs['region'] = arg
        elif opt in ("-s", "--sub_compartments"):
            moduleargs['sub_compartments'] = True

    return moduleargs


# Main processing function
def main(argv):
    # Configure Parameters and Options
    options = 'j:p:c:r:s'
    longOptions = ['json=', 'profile=', 'compartment_id=', 'region=', 'sub_compartments']
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
