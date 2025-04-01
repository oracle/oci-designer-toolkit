#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates. 
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl. 
"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitProductJsonGenerator"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import getopt
import jinja2
import os
import shutil
import sys

from common.okitCommon import writeFile
from common.okitCommon import writeJsonFile
from common.okitCommon import readJsonFile
from common.okitLogging import getLogger

# Configure logging
logger = getLogger()

# Execute workflow
def processWorkflow(args):
    if args.get("input", "") != "":
        overwrite = args.get("overwrite", False)
        input_file_name = args.get("input", "products.json")
        output_file_name = args.get("output", "okit_products.json")
        products_json = readJsonFile(input_file_name)
        okit_products_json = {
            "category": {},
            "skus": {},
            "map": {}
        }
        for item in products_json.get("items", []):
            okit_products_json["skus"][item["partNumber"]] = item["displayName"]
            okit_products_json["map"][item["displayName"]] = item["partNumber"]
            try:
                okit_products_json["category"][item["serviceCategoryDisplayName"]] = okit_products_json["category"].get(item["serviceCategoryDisplayName"], {"skus": {}, "map": {}})
                okit_products_json["category"][item["serviceCategoryDisplayName"]]["skus"][item["partNumber"]] = item["shortDisplayName"]
                okit_products_json["category"][item["serviceCategoryDisplayName"]]["map"][item["shortDisplayName"]] = item["partNumber"]
            except Exception as e:
                logger.info(f'Sku {item["partNumber"]} : {item["displayName"]}')
                logger.warn(e)
        writeJsonFile(okit_products_json, output_file_name)
    return

# Set default values for Args
def defaultArgs():
    args = {}
    args['input'] = ""
    args['output'] = "okit_products.json"
    args['overwrite'] = False
    return args


# Read Module Arguments
def readargs(opts, args):
    moduleargs = defaultArgs()

    # Read Module Command Line Arguments.
    for opt, arg in opts:
        if opt in ("-i", "--input"):
            moduleargs['input'] = arg
        elif opt in ("-o", "--output"):
            moduleargs['output'] = arg
        elif opt in ("-O", "--overwrite"):
            moduleargs['overwrite'] = True

    return moduleargs

def usage():
    print('python3 okitProductJsonGenerator.py --input "<Input File>" --output "<Output File>"')


# Main processing function
def main(argv):
    # Configure Parameters and Options
    options = 'i:o:O'
    longOptions = ['input=', 'output=', 'overwrite']
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
