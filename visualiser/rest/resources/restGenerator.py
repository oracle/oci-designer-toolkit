
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import os
import shutil
import tempfile
import traceback
from flask import request, send_from_directory
from flask_restful import Resource

from generators.ociAnsibleGenerator import OCIAnsibleGenerator
from generators.ociTerraformGenerator import OCITerraformGenerator
from . import logger

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())
template_root = '/oci/visualiser/templates'

class TerraformAPI(Resource):

    def post(self):
        logger.info("Terraform Post : {0:s}".format(str(request.json)))
        logger.info("Host URL : {0:s}".format(str(request.host_url)))
        try:
            destination_dir = tempfile.mkdtemp();
            generator = OCITerraformGenerator(template_root, destination_dir, request.json)
            generator.generate()
            generator.writeFiles()
            zipname = generator.createZipArchive(os.path.join(destination_dir, "terraform"), "okitTerraform")
            shutil.rmtree(destination_dir)
            return zipname
        except Exception as e:
            logger.exception(e)
            if debug_mode:
                errorjson = {"error": str(e), "message": str(e.message), "stacktrace": str(traceback.format_exc())}
            else:
                errorjson = {"error": str(e), "message": str(e.message)}
            return errorjson, 500

    def get(self, zipname):
        logger.info("Terraform Get : {0:s}".format(str(zipname)))
        filename = os.path.split(zipname)
        return send_from_directory(filename[0], filename[-1], mimetype='application/zip', as_attachment=True)

    def delete(self, zipname):
        logger.info("Terraform Delete : {0:s}".format(str(zipname)))
        os.remove(zipname)


class AnsibleAPI(Resource):

    def post(self):
        logger.info("Ansible Post : {0:s}".format(str(request.json)))
        logger.info("Host URL : {0:s}".format(str(request.host_url)))
        try:
            destination_dir = tempfile.mkdtemp();
            generator = OCIAnsibleGenerator(template_root, destination_dir, request.json)
            generator.generate()
            generator.writeFiles()
            zipname = generator.createZipArchive(os.path.join(destination_dir, "ansible"), "okitAnsible")
            shutil.rmtree(destination_dir)
            return zipname
        except Exception as e:
            logger.exception(e)
            if debug_mode:
                errorjson = {"error": str(e), "message": str(e.message), "stacktrace": str(traceback.format_exc())}
            else:
                errorjson = {"error": str(e), "message": str(e.message)}
            return errorjson, 500

    def get(self, zipname):
        logger.info("Ansible Get : {0:s}".format(str(zipname)))
        filename = os.path.split(zipname)
        return send_from_directory(filename[0], filename[-1], mimetype='application/zip', as_attachment=True)

    def delete(self, zipname):
        logger.info("Ansible Delete : {0:s}".format(str(zipname)))
        os.remove(zipname)



