#!/usr/bin/python3

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

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
from query.pcaQuery import PCAQuery

# Configure logging
logger = getLogger()

# Execute workflow
def processWorkflow(args):
    if args['region'] != '' and args['compartment_id'] != '':
        try:
            output_json = args['json']
            config_profile = args['profile']
            compartments = args['compartment_id']
            regions = args['region']
            region = args['region']
            sub_compartments = args['sub_compartments']
            logger.info('Using Profile : {0!s:s}'.format(config_profile))
            config = {'region': region}
            query = None
            if args['platform'].lower() == 'pca':
                query = PCAQuery(config=config, profile=config_profile)
            else:
                query = OCIQuery(config=config, profile=config_profile)
            response = query.executeQuery(regions=[regions] if regions else None, compartments=[compartments] if compartments else None, include_sub_compartments=sub_compartments)
            logJson(response)
            writeJsonFile(response, output_json)
            return response
        except Exception as e:
            logger.exception(e)
    else:
        usage()
    return


# Set default values for Args
def defaultArgs():
    args = {}
    args['profile'] = "DEFAULT"
    args['json'] = "./okit.json"
    args['compartment_id'] = ""
    args['region'] = ""
    args['platform'] = ""
    args['sub_compartments'] = False
    args['help'] = False
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
        elif opt in ("-P", "--platform"):
            moduleargs['platform'] = arg
        elif opt in ("-s", "--sub_compartments"):
            moduleargs['sub_compartments'] = True
        elif opt in ("-h", "-?", "--help"):
            moduleargs['help'] = True

    return moduleargs

def usage():
    print()
    print('python3 okit_query.py -p <profile> -P <platform> -r <region> -j <Output JSON> -c <compartment id> -s')
    print('               -r | --region           : Region to query.')
    print('               -c | --compartment_id   : OCID of Compartment to be queried.')
    print('               -p | --profile          : (Optional) Profile to be used within the config file.')
    print('               -P | --platform         : (Optional) Platform this will be either pca or oci.')
    print('               -j | --json             : (Optional) Json Output file.')
    print('               -s | --sub_compartments : (Optional) Flag indicating if Sub Compartments should be queried.')

# Main processing function
def main(argv):
    # Configure Parameters and Options
    options = 'j:p:c:P:r:sh?'
    longOptions = ['json=', 'profile=', 'compartment_id=', 'region=', 'platform=', 'sub_compartments', 'help']
    # Get Options & Arguments
    try:
        opts, args = getopt.getopt(argv, options, longOptions)
        # Read Module Arguments
        moduleargs = readargs(opts, args)
        if moduleargs['help']:
            usage()
        else:
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
