#!/usr/bin/python

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitExport"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import os
import urllib
from flask import Blueprint
from flask import current_app
from flask import request
from flask import send_from_directory
import json
import tempfile
from werkzeug.utils import secure_filename

from common.okitCommon import logJson
from common.okitCommon import getOkitHome
from common.okitLogging import getLogger
from model.okitValidation import OCIJsonValidator
from generators.okitAnsibleGenerator import OCIAnsibleGenerator
from generators.okitTerraform11Generator import OCITerraform11Generator
from generators.okitTerraformGenerator import OCITerraformGenerator
from generators.okitResourceManagerGenerator import OCIResourceManagerGenerator
from generators.okitMarkdownGenerator import OkitMarkdownGenerator

# Configure logging
logger = getLogger()

bp = Blueprint('export', __name__, url_prefix='/okit/export', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())
template_root = f'{getOkitHome()}/visualiser/templates'

@bp.route('terraform', methods=(['GET']))
def terraform():
    if request.method == 'GET':
        instance_path = current_app.instance_path
        root_dir = request.args.get('root_dir', default='/tmp')
        terraform_dir = request.args.get('terraform_dir', default='/tmp')
        destination = request.args.get('destination', default='zip')
        directory = request.args.get('directory', default='')
        design = json.loads(request.args.get('model', default='{}'))
        add_suffix = True
        response_json = {}
        if destination == 'terraform':
            destination_dir = os.path.join(instance_path, root_dir.strip('/'), directory.strip('/'))
            add_suffix = False
        elif destination == 'git':
            destination_dir = '/tmp'
        else:
            destination_dir = tempfile.mkdtemp()
        logger.info(f'Export To Terraform Instance Path {instance_path}')
        logger.info(f'Export To Terraform Root Directory {root_dir}')
        logger.info(f'Export To Terraform Directory {directory}')
        logger.info(f'Export To Terraform Destination Directory {destination_dir}')
        generator = OCITerraformGenerator(template_root, destination_dir, design, use_vars=False, add_suffix=add_suffix)
        generator.generate()
        if destination == 'terraform':
            generator.writeFiles()
        elif destination == 'zip':
            generator.writeFiles()
            return send_from_directory('/tmp', "okit-terraform.zip", mimetype='application/zip', as_attachment=True)
        elif destination == 'json':
            response_json = generator.toJson()
        return json.dumps(response_json, sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'

