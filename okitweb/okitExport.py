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
from flask import request
from flask import send_from_directory
import json
import tempfile
from werkzeug.utils import secure_filename

from common.okitCommon import logJson
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
template_root = '/okit/visualiser/templates'

@bp.route('terraform', methods=(['GET']))
def terraform():
    if request.method == 'GET':
        destination = request.args.get('destination', default='zip')
        directory = request.args.get('destination', default='')
        design = json.loads(request.args.get('okit_model', default='{}'))
        response_json = {}
        if destination == 'git':
            destination_dir = '/tmp'
        else:
            destination_dir = tempfile.mkdtemp()
        generator = OCITerraformGenerator(template_root, destination_dir, design, use_vars=False)
        generator.generate()
        if destination == 'zip':
            generator.writeFiles()
            return send_from_directory('/tmp', "okit-terraform.zip", mimetype='application/zip', as_attachment=True)
        elif destination == 'json':
            response_json = generator.toJson()
        return json.dumps(response_json, sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'

