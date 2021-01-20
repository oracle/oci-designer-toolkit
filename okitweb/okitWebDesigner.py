
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "okitWebDesigner"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import configparser
import oci
import os
import shutil
import tempfile
import time
import urllib
import giturlparse
import glob
import ast
from git import Repo
from flask import Blueprint
from flask import render_template
from flask import request
from flask import send_from_directory
from flask import jsonify

import json
from common.okitCommon import logJson
from common.okitCommon import readJsonFile
from common.okitCommon import standardiseIds
from common.okitCommon import writeJsonFile
from common.okitLogging import getLogger
from model.okitValidation import OCIJsonValidator
from generators.okitAnsibleGenerator import OCIAnsibleGenerator
from generators.okitTerraform11Generator import OCITerraform11Generator
from generators.okitTerraformGenerator import OCITerraformGenerator
from generators.okitResourceManagerGenerator import OCIResourceManagerGenerator
from generators.okitMarkdownGenerator import OkitMarkdownGenerator

# Configure logging
logger = getLogger()

bp = Blueprint('okit', __name__, url_prefix='/okit', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())
template_root = '/okit/visualiser/templates'


def standardiseJson(json_data={}, **kwargs):
    logJson(json_data)
    json_data = standardiseIds(json_data)
    logJson(json_data)
    return json_data

def readConfigFileSections(config_file='~/.oci/config'):
    if os.getenv('OCI_CLI_AUTH', 'config') != 'instance_principal':
        logger.debug('Config File {0!s:s}'.format(config_file))
        abs_config_file = os.path.expanduser(config_file)
        logger.debug('Config File {0!s:s}'.format(abs_config_file))
        config = configparser.ConfigParser()
        config.read(abs_config_file)
        config_sections = []
        if 'DEFAULT' in config:
            config_sections = ['DEFAULT']
        config_sections.extend(config.sections())
        logger.info('Config Sections {0!s:s}'.format(config_sections))
    else:
        config_sections = ['Instance Principal']
    return config_sections

def readConfigFileSettings(config_file='~/.oci/git_repositories'):
    logger.debug('Setting File {0!s:s}'.format(config_file))
    abs_config_file = os.path.expanduser(config_file)
    logger.debug('Setting File {0!s:s}'.format(abs_config_file))
    config = configparser.ConfigParser()
    config.read(abs_config_file)
    repo_list = []
    for each_git_section in config.sections():
        repo_list.append({'label': each_git_section, 'branch': config[each_git_section]['branch'], 'url': config[each_git_section]['url']})
    return repo_list

def getConfigFileValue(section, key, config_file='~/.oci/config'):
    value = ''
    if os.getenv('OCI_CLI_AUTH', 'config') != 'instance_principal':
        logger.debug('Config File {0!s:s}'.format(config_file))
        abs_config_file = os.path.expanduser(config_file)
        logger.debug('Config File {0!s:s}'.format(abs_config_file))
        config = configparser.ConfigParser()
        config.read(abs_config_file)
        value = config[section][key]
    return value

def validateConfigFile(config_file='~/.oci/config'):
    results = []
    if os.getenv('OCI_CLI_AUTH', 'config') != 'instance_principal':
        logger.debug('Config File {0!s:s}'.format(config_file))
        abs_config_file = os.path.expanduser(config_file)
        logger.debug('Config File {0!s:s}'.format(abs_config_file))
        config = configparser.ConfigParser()
        config.read(abs_config_file)
        if len(config.sections()) == 0 and 'DEFAULT' not in config:
            results.append('OCI Connect Config file is either missing or empty.')
        else:
            for section in config:
                key_file = config[section]['key_file']
                if not os.path.exists(os.path.expanduser(key_file)):
                    results.append('[{0!s:s}] Key File {1!s:s} does not exist.'.format(section, key_file))
        logger.info(results)
    return results

#
# Define Error Handlers
#

@bp.errorhandler(Exception)
def handle_exception(error):
    message = [str(x) for x in error.args]
    status_code = 500
    success = False
    response = {
        'success': success,
        'error': {
            'type': error.__class__.__name__,
            'message': message
        }
    }
    logger.exception(error)
    logJson(response)
    return jsonify(response), status_code

#
# Define Endpoints
#

@bp.route('/designer', methods=(['GET']))
def designer():
    # Test if developer mode
    developer_mode = (request.args.get('developer', default='false') == 'true')
    if developer_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< Developer Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if experimental mode
    experimental_mode = (request.args.get('experimental', default='false') == 'true')
    if experimental_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< Experimental Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Read Artifact Model Specific JavaScript Files
    artefact_model_js_files = sorted(os.listdir(os.path.join(bp.static_folder, 'model', 'js', 'artefacts')))
    # Read Artifact View Specific JavaScript Files
    if os.path.exists(os.path.join(bp.static_folder, 'view', 'js', 'artefacts')) and os.path.isdir(os.path.join(bp.static_folder, 'view', 'js', 'artefacts')):
        artefact_view_js_files = sorted(os.listdir(os.path.join(bp.static_folder, 'view', 'js', 'artefacts')))
    else:
        artefact_view_js_files = []
    artefact_view_js_files.extend(sorted(os.listdir(os.path.join(bp.static_folder, 'view', 'designer', 'js', 'artefacts'))))

    # Get Palette Icon Groups / Icons
    svg_files = []
    svg_icon_groups = {}
    # Read Files
    for (dirpath, dirnames, filenames) in os.walk(os.path.join(bp.static_folder, 'palette')):
        logger.debug('dirpath : {0!s:s}'.format(dirpath))
        logger.debug('dirnames : {0!s:s}'.format(dirnames))
        logger.debug('filenames : {0!s:s}'.format(filenames))
        if os.path.basename(dirpath) != 'palette':
            svg_files.extend([os.path.join(os.path.basename(dirpath), f) for f in filenames if f.endswith(".svg")])
            svg_icon_groups[os.path.basename(dirpath)] = [f for f in filenames if f.endswith(".svg")]
        else:
            svg_files.extend([f for f in filenames if f.endswith(".svg")])
    logger.debug('Files Walk : {0!s:s}'.format(svg_files))
    logger.debug('SVG Icon Groups {0!s:s}'.format(svg_icon_groups))

    palette_icon_groups = []
    for key in sorted(svg_icon_groups.keys()):
        palette_icon_group = {'name': str(key).title(), 'icons': []}
        for palette_svg in sorted(svg_icon_groups[key]):
            palette_icon = {'svg': os.path.join(key, palette_svg), 'title': os.path.basename(palette_svg).split('.')[0].replace('_', ' ')}
            palette_icon_group['icons'].append(palette_icon)
        palette_icon_groups.append(palette_icon_group)
    logger.debug('Palette Icon Groups : {0!s:s}'.format(palette_icon_groups))
    logJson(palette_icon_groups)

    # Read Fragment Files
    fragment_files = os.listdir(os.path.join(bp.static_folder, 'fragments', 'svg'))
    fragment_icons = []
    for fragment_svg in sorted(fragment_files):
        logger.debug('Fragment : {0!s:s}'.format(fragment_svg))
        logger.debug('Fragment full : {0!s:s}'.format(os.path.join(bp.static_folder, 'fragments', 'svg', fragment_svg)))
        fragment_icon = {'svg': fragment_svg, 'title': os.path.basename(fragment_svg).split('.')[0].replace('_', ' ').title()}
        logger.debug('Icon : {0!s:s}'.format(fragment_icon))
        fragment_icons.append(fragment_icon)

    # Walk Template directory Structure
    template_files = []
    template_dirs = {}
    logger.debug('Walking the template directories')
    rootdir = os.path.join(bp.static_folder, 'templates')
    for (dirpath, dirnames, filenames) in os.walk(rootdir, followlinks=True):
        logger.debug('dirpath : {0!s:s}'.format(dirpath))
        logger.debug('dirnames : {0!s:s}'.format(dirnames))
        logger.debug('filenames : {0!s:s}'.format(filenames))
        relpath = os.path.relpath(dirpath, rootdir)
        logger.debug('Relative Path : {0!s:s}'.format(relpath))
        template_files.extend([os.path.join(relpath, f) for f in filenames if f.endswith(".json")])
        template_dirs[relpath] = [f for f in filenames if f.endswith(".json")]
    logger.debug('Files Walk : {0!s:s}'.format(template_files))
    logger.debug('Template Dirs {0!s:s}'.format(template_dirs))

    template_groups = []
    for key in sorted(template_dirs.keys()):
        template_group = {'name': str(key).replace('_', ' ').title(), 'templates': [], 'directories': {}}
        for template_file in sorted(template_dirs[key]):
            try:
                okit_template = {'json': os.path.join(key, template_file), 'id': template_file.replace('.', '_')}
                filename = os.path.join(bp.static_folder, 'templates', key, template_file)
                template_json = readJsonFile(filename)
                logger.debug('Template Json : {0!s:s}'.format(template_json))
                okit_template['title'] = template_json['title']
                okit_template['description'] = template_json.get('description', template_json['title'])
                template_group['templates'].append(okit_template)
            except Exception as e:
                logger.debug(e)
        template_groups.append(template_group)
    logger.debug('Template Groups {0!s:s}'.format(template_groups))
    logJson(template_groups)

    template_categories = {}
    for key in sorted(template_dirs.keys()):
        name = str(key.split('/')[0]).replace('_', ' ').title()
        path = key
        category = template_categories.get(name, {'path': path, 'name': '', 'templates': [], 'children': {}})
        template_categories[name] = build_categories(path, key, category, sorted(template_dirs[key]))
    logger.debug('Categories {0!s:s}'.format(template_categories))
    logJson(template_categories)

    config_sections = {"sections": readConfigFileSections()}
    logger.debug('Config Sections {0!s:s}'.format(config_sections))

    #Render The Template
    return render_template('okit/okit_designer.html',
                           artefact_model_js_files=artefact_model_js_files,
                           artefact_view_js_files=artefact_view_js_files,
                           palette_icon_groups=palette_icon_groups,
                           fragment_icons=fragment_icons,
                           okit_templates_groups=template_groups,
                           okit_template_categories=template_categories,
                           developer_mode=developer_mode, experimental_mode=experimental_mode)


def build_categories(path, key, category, templates):
    category['name'] = str(key.split('/')[0]).replace('_', ' ').title()
    if len(key.split('/')) > 1:
        child_key = '/'.join(key.split('/')[1:])
        child_category = category['children'].get(str(child_key.split('/')[0]).replace('_', ' ').title(), {'path': path, 'name': '', 'templates': [], 'children': {}})
        build_categories(path, child_key, child_category, templates)
        category['children'][str(child_key.split('/')[0]).replace('_', ' ').title()] = child_category
    else:
        category['templates'] = templates
        category['templates'] = []
        for template_file in sorted(templates):
            try:
                json_file = os.path.join(category['path'], template_file)
                okit_template = {'json': json_file, 'id': json_file.replace('.', '_').replace('/', '_')}
                filename = os.path.join(bp.static_folder, 'templates', okit_template['json'])
                template_json = readJsonFile(filename)
                logger.debug('Template Json : {0!s:s}'.format(template_json))
                okit_template['title'] = template_json['title']
                okit_template['description'] = template_json.get('description', template_json['title'])
                category['templates'].append(okit_template)
            except Exception as e:
                logger.debug(e)
    logger.debug(category)
    return category


@bp.route('/propertysheets/<string:sheet>', methods=(['GET']))
def propertysheets(sheet):
    return render_template('okit/propertysheets/{0:s}'.format(sheet))


@bp.route('/valueproposition/<string:sheet>', methods=(['GET']))
def valueproposition(sheet):
    return render_template('okit/valueproposition/{0:s}'.format(sheet))


@bp.route('/generate/<string:language>/<string:destination>', methods=(['GET', 'POST']))
def generate(language, destination):
    logger.info('Language : {0:s} - {1:s}'.format(str(language), str(request.method)))
    logger.info('Destination : {0:s} - {1:s}'.format(str(destination), str(request.method)))
    logger.debug('JSON     : {0:s}'.format(str(request.json)))
    if request.method == 'POST':
        use_vars = request.json.get("use_variables", True)
        try:
            if destination == 'git':
                git_url, git_branch = request.json['git_repository'].split('*')
                parsed_git_url = giturlparse.parse(git_url)
                generate_git_dir = os.path.abspath(os.path.join(bp.static_folder, 'git'))
                logger.info(generate_git_dir)
                if not os.path.exists(generate_git_dir):
                    os.makedirs(generate_git_dir, exist_ok=True)
                git_repo_dir = os.path.abspath(os.path.join(generate_git_dir, parsed_git_url.name))
                if os.path.exists(git_repo_dir):
                    repo = Repo(git_repo_dir)
                    repo.remotes.origin.pull()
                else:
                    repo = Repo.clone_from(git_url, git_repo_dir, branch=git_branch, no_single_branch=True)
                    repo.remotes.origin.pull()
                destination_dir = os.path.abspath(os.path.join(git_repo_dir, request.json['git_repository_filename']))
            else:
                destination_dir = tempfile.mkdtemp();
            if language == 'terraform':
                generator = OCITerraformGenerator(template_root, destination_dir, request.json, use_vars=use_vars)
            elif language == 'ansible':
                generator = OCIAnsibleGenerator(template_root, destination_dir, request.json, use_vars=use_vars)
            elif language == 'terraform11':
                generator = OCITerraform11Generator(template_root, destination_dir, request.json)
            elif language == 'resource-manager':
                generator = OCIResourceManagerGenerator(template_root, destination_dir, request.json)
            elif language == 'markdown':
                generator = OkitMarkdownGenerator(template_root, destination_dir, request.json)
            generator.generate()
            generator.writeFiles()
            if destination == 'git':
                git_commit_msg = request.json['git_repository_commitmsg']
                repo.index.add(destination_dir)
                repo.index.commit("commit changes from okit:" + git_commit_msg)
                repo.remotes.origin.push(git_branch)
                return language.capitalize()+" files successfully uploaded to GIT Repository"
            else:
                zipname = generator.createZipArchive(os.path.join(destination_dir, language), "/tmp/okit-{0:s}".format(str(language)))
                logger.info('Zipfile : {0:s}'.format(str(zipname)))
                shutil.rmtree(destination_dir)
                filename = os.path.split(zipname)
                logger.info('Split Zipfile : {0:s}'.format(str(filename)))
                return zipname
        except Exception as e:
            logger.exception(e)
            return str(e), 500
    else:
        return send_from_directory('/tmp', "okit-{0:s}.zip".format(str(language)), mimetype='application/zip', as_attachment=True)


@bp.route('/saveas/<string:savetype>', methods=(['POST']))
def saveas(savetype):
    logger.info('Save Type : {0:s} - {1:s}'.format(str(savetype), str(request.method)))
    logger.debug('JSON     : {0:s}'.format(str(request.json)))
    if request.method == 'POST':
        try:
            filename = '{0!s:s}.json'.format(request.json['title'].replace(' ', '_').lower())
            if savetype == 'template':
                template_type = request.json['template_type']
                if len(template_type.strip()) == 0:
                    fullpath = os.path.abspath(os.path.join(bp.static_folder, 'templates', 'uncategorised', filename))
                else:
                    typedir = os.path.abspath(os.path.join(bp.static_folder, 'templates', template_type.strip().replace(' ', '_').lower()))
                    if not os.path.exists(typedir):
                        os.makedirs(typedir, exist_ok=True)
                    fullpath = os.path.abspath(os.path.join(typedir, filename))
                logger.info('Template File Name : {0!s:s}'.format(filename))
                logger.info('>>>>>> Path to file {0!s:s}'.format(fullpath))
                writeJsonFile(request.json, fullpath)
                return filename
            elif savetype == 'git':
                git_url, git_branch = request.json['git_repository'].split('*')
                git_commit_msg = request.json['git_repository_commitmsg']
                if request.json['git_repository_filename'] != '':
                    filename = request.json['git_repository_filename'].replace(' ', '_').lower()
                    if not filename.endswith('.json'):
                        filename = '{0!s:s}.json'.format(filename)
                if request.json['git_repository_directory'] != '':
                    filename = os.path.join(request.json['git_repository_directory'], filename)
                parsed_git_url = giturlparse.parse(git_url)
                template_git_dir = os.path.abspath(os.path.join(bp.static_folder, 'templates', 'git'))
                if not os.path.exists(template_git_dir):
                    os.makedirs(template_git_dir, exist_ok=True)
                git_repo_dir = os.path.abspath(os.path.join(template_git_dir, parsed_git_url.name))
                if os.path.exists(git_repo_dir):
                    repo = Repo(git_repo_dir)
                    repo.remotes.origin.pull()
                else:
                    repo = Repo.clone_from(git_url, git_repo_dir, branch=git_branch, no_single_branch=True)
                    repo.remotes.origin.pull()
                fullpath = os.path.abspath(os.path.join(git_repo_dir, filename))
                # Remove git info
                del request.json['git_repository']
                del request.json['git_repository_directory']
                del request.json['git_repository_filename']
                del request.json['git_repository_commitmsg']
                writeJsonFile(request.json, fullpath)
                repo.index.add(fullpath)
                repo.index.commit("commit changes from okit:" + git_commit_msg)
                repo.remotes.origin.push(git_branch)
                return filename
        except Exception as e:
            logger.exception(e)
            return str(e), 500


@bp.route('/dropdown/data', methods=(['GET', 'POST']))
def dropdownData():
    dropdown_file = os.path.abspath(os.path.join(bp.static_folder, 'json', 'dropdown.json'))
    if request.method == 'GET':
        dropdown_json = readJsonFile(dropdown_file)
        return dropdown_json
    elif request.method == 'POST':
        writeJsonFile(request.json, dropdown_file)
        return request.json
    else:
        return 'Unknown Method', 500


@bp.route('config/sections', methods=(['GET']))
def configSections():
    if request.method == 'GET':
        config_sections = {"sections": readConfigFileSections()}
        logger.info('Config Sections {0!s:s}'.format(config_sections))
        return config_sections
    else:
        return 'Unknown Method', 500

@bp.route('config/appsettings', methods=(['GET']))
def appSettings():
    if request.method == 'GET':
        config_settings = {"gitsections": readConfigFileSettings()}
        logger.info('Config Settings {0!s:s}'.format(config_settings))
        return config_settings
    else:
        return 'Unknown Method', 500

@bp.route('config/region/<string:section>', methods=(['GET']))
def configRegion(section):
    if request.method == 'GET':
        response = {"name": getConfigFileValue(section, 'region')}
        return response
    else:
        return 'Unknown Method', 500

@bp.route('config/validate', methods=(['GET']))
def configValidate():
    if request.method == 'GET':
        response = {"results": validateConfigFile()}
        return response
    else:
        return 'Unknown Method', 500


@bp.route('validate', methods=(['POST']))
def validateJson():
    logger.debug('JSON : {0:s}'.format(str(request.json)))
    if request.method == 'POST':
        logJson(request.json)
        # Validate input json
        validator = OCIJsonValidator(request.json)
        result = {"valid": validator.validate(), "results": validator.getResults()}
        return json.dumps(result, sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'

@bp.route('loadfromgit', methods=(['POST']))
def loadfromgit():
    logger.debug('JSON     : {0:s}'.format(str(request.json)))
    if request.method == 'POST':
        try:
            git_url, git_branch = request.json['git_repository'].split('*')
            parsed_git_url = giturlparse.parse(git_url)
            template_git_dir = os.path.abspath(os.path.join(bp.static_folder, 'templates', 'git'))
            if not os.path.exists(template_git_dir):
                os.makedirs(template_git_dir, exist_ok=True)
            git_repo_dir = os.path.abspath(os.path.join(template_git_dir, parsed_git_url.name))
            if os.path.exists(git_repo_dir):
                repo = Repo(git_repo_dir)
                repo.remotes.origin.pull()
            else:
                repo = Repo.clone_from(git_url, git_repo_dir, branch=git_branch, no_single_branch=True)
                repo.remotes.origin.pull()
            files = list(glob.iglob(os.path.join(git_repo_dir, "*.json")))
            logger.info(files)
            files_list = [f.replace("okit/okitweb/", "") for f in files]
            logger.debug('JSON     : {0:s}'.format(str(request.json)))
            logger.debug('Files Walk : {0!s:s}'.format(files_list))
            result = {"fileslist": files_list}
            logger.info(result)
            return json.dumps(result)
        except Exception as e:
            logger.exception(e)
            return str(e), 500

