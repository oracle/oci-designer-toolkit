#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitExport"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import base64
import os
import urllib
from flask import Blueprint
from flask import current_app
from flask import request
from flask import send_from_directory
from git import Repo
import json
import shutil
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
template_root = f'{getOkitHome()}/modules/templates'

@bp.route('terraform', methods=(['GET']))
def terraform():
    if request.method == 'GET':
        instance_path = current_app.instance_path
        root_dir = request.args.get('root_dir', default='/tmp')
        terraform_dir = request.args.get('terraform_dir', default='/tmp')
        destination = request.args.get('destination', default='zip')
        directory = request.args.get('directory', default='')
        design = json.loads(request.args.get('design', default='{}'))
        git = request.args.get('git', default=False)
        git_commit_msg = request.args.get('git_commit_msg', default='')
        add_suffix = True
        response_json = {}
        if destination == 'file':
            destination_dir = os.path.join(instance_path, root_dir.strip('/'), directory.strip('/'))
            add_suffix = False
        elif destination == 'git':
            destination_dir = '/tmp'
        else:
            destination_dir = tempfile.mkdtemp()
        logger.debug(f'Export To Terraform Instance Path {instance_path}')
        logger.debug(f'Export To Terraform Destination {destination}')
        logger.debug(f'Export To Terraform Root Directory {root_dir}')
        logger.debug(f'Export To Terraform Directory {directory}')
        logger.debug(f'Export To Terraform Destination Directory {destination_dir}')
        generator = OCITerraformGenerator(template_root, destination_dir, design, use_vars=False, add_suffix=add_suffix)
        generator.generate()
        if destination == 'file':
            response_json = generator.toJson()
            generator.writeFiles()
        elif destination == 'zip':
            generator.writeFiles()
            zipname = generator.createZipArchive(os.path.join(destination_dir, 'terraform'), "/tmp/okit-terraform")
            logger.debug('Zipfile : {0:s}'.format(str(zipname)))
            shutil.rmtree(destination_dir)
            filename = os.path.split(zipname)
            logger.debug('Split Zipfile : {0:s}'.format(str(filename)))
            return send_from_directory('/tmp', "okit-terraform.zip", mimetype='application/zip', as_attachment=True, cache_timeout=0)
        elif destination == 'json':
            response_json = generator.toJson()
        if git:
            top_dir = os.path.normpath(os.path.dirname(directory.strip('/'))).split(os.sep)
            git_repo_dir = os.path.join(instance_path, root_dir, top_dir[0], top_dir[1])
            full_directory_name = os.path.join(instance_path, root_dir, directory.strip('/'))
            logger.debug(f'Git Root Dir : {git_repo_dir}')
            logger.debug(f'Directory : {directory}')
            logger.debug(f'Dest Directory : {full_directory_name}')
            repo = Repo(git_repo_dir)
            repo.remotes.origin.pull()
            repo.index.add(destination_dir)
            repo.index.commit("commit changes from okit:" + git_commit_msg)
            repo.remotes.origin.push()
        return json.dumps(response_json, sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'

@bp.route('markdown', methods=(['GET', 'POST']))
def markdown():
    if request.method == 'GET':
        design = json.loads(request.args.get('design', default='{}'))
        destination_dir = tempfile.mkdtemp()
        generator = OkitMarkdownGenerator(template_root, destination_dir, design)
        generator.generate()
        markdown = generator.toText()
        response = {"markdown": markdown}
        return json.dumps(response, sort_keys=False, indent=2, separators=(',', ': '))
    elif request.method == 'POST':
        design = request.json
        destination_dir = tempfile.mkdtemp()
        generator = OkitMarkdownGenerator(template_root, destination_dir, design)
        generator.generate()
        markdown = generator.toText()
        response = {"markdown": markdown}
        return json.dumps(response, sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'

@bp.route('resource-manager', methods=(['GET']))
def resourceManager():
    if request.method == 'GET':
        instance_path = current_app.instance_path
        root_dir = request.args.get('root_dir', default='/tmp')
        terraform_dir = request.args.get('terraform_dir', default='/tmp')
        destination = request.args.get('destination', default='zip')
        directory = request.args.get('directory', default='')
        design = json.loads(request.args.get('design', default='{}'))
        git = request.args.get('git', default=False)
        git_commit_msg = request.args.get('git_commit_msg', default='')
        add_suffix = True
        response_json = {}
        if destination == 'file':
            destination_dir = os.path.join(instance_path, root_dir.strip('/'), directory.strip('/'))
            add_suffix = False
        elif destination == 'git':
            destination_dir = '/tmp'
        else:
            destination_dir = tempfile.mkdtemp()
        logger.debug(f'Export To RM Terraform Instance Path {instance_path}')
        logger.debug(f'Export To Terraform Destination {destination}')
        logger.debug(f'Export To Terraform Root Directory {root_dir}')
        logger.debug(f'Export To Terraform Directory {directory}')
        logger.debug(f'Export To Terraform Destination Directory {destination_dir}')
        generator = OCIResourceManagerGenerator(template_root, destination_dir, design, use_vars=False)
        generator.generate()
        if destination == 'file':
            response_json = generator.toJson()
            generator.writeFiles()
        elif destination == 'zip':
            generator.writeFiles()
            zipname = generator.createZipArchive(os.path.join(destination_dir, 'resource-manager'), "/tmp/okit-resource-manager")
            logger.debug('Zipfile : {0:s}'.format(str(zipname)))
            shutil.rmtree(destination_dir)
            filename = os.path.split(zipname)
            logger.debug('Split Zipfile : {0:s}'.format(str(filename)))
            return send_from_directory('/tmp', "okit-resource-manager.zip", mimetype='application/zip', as_attachment=True)
        elif destination == 'json':
            response_json = generator.toJson()
        if git:
            top_dir = os.path.normpath(os.path.dirname(directory.strip('/'))).split(os.sep)
            git_repo_dir = os.path.join(instance_path, root_dir, top_dir[0], top_dir[1])
            full_directory_name = os.path.join(instance_path, root_dir, directory.strip('/'))
            logger.debug(f'Git Root Dir : {git_repo_dir}')
            logger.debug(f'Directory : {directory}')
            logger.debug(f'Dest Directory : {full_directory_name}')
            repo = Repo(git_repo_dir)
            repo.remotes.origin.pull()
            repo.index.add(destination_dir)
            repo.index.commit("commit changes from okit:" + git_commit_msg)
            repo.remotes.origin.push()
        return json.dumps(response_json, sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'

