
# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "okitWebDesigner"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import configparser
import functools
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
from flask import current_app
from flask import jsonify
from flask import redirect
from flask import render_template
from flask import request
from flask import send_from_directory
from flask import session
from flask import url_for

import json
from common.okitCommon import jsonToFormattedString
from common.okitCommon import logJson
from common.okitCommon import readJsonFile
from common.okitCommon import standardiseIds
from common.okitCommon import writeJsonFile
from common.okitCommon import getOkitHome
from common.okitLogging import getLogger
from model.okitValidation import OCIJsonValidator
from generators.okitAnsibleGenerator import OCIAnsibleGenerator
from generators.okitTerraform11Generator import OCITerraform11Generator
from generators.okitTerraformGenerator import OCITerraformGenerator
from generators.okitResourceManagerGenerator import OCIResourceManagerGenerator
from generators.okitMarkdownGenerator import OkitMarkdownGenerator
from visualiser.common.okitCommon import readXmlFile

# Configure logging
logger = getLogger()

bp = Blueprint('okit', __name__, url_prefix='/okit', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())
template_root = f'{getOkitHome()}/visualiser/templates'


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
        logger.info(f'Read Config: {config}')
        for section in config:
            logger.info(f'Config Section: {section} - has tenancy {config.has_option(section, "tenancy")}')
        if 'DEFAULT' in config and config.has_option('DEFAULT', 'tenancy'):
            config_sections = ['DEFAULT']
        config_sections.extend(config.sections())
    else:
        config_sections = ['InstancePrincipal']
    logger.info('Config Sections {0!s:s}'.format(config_sections))
    return config_sections

def readAndValidateConfigFileSections(config_file='~/.oci/config'):
    if os.getenv('OCI_CLI_AUTH', 'config') != 'instance_principal':
        logger.debug('Config File {0!s:s}'.format(config_file))
        abs_config_file = os.path.expanduser(config_file)
        logger.debug('Config File {0!s:s}'.format(abs_config_file))
        config = configparser.ConfigParser()
        config.read(abs_config_file)
        config_sections = []
        # if 'DEFAULT' in config:
        #     config_sections = ['DEFAULT']
        # config_sections.extend(config.sections())
        for section in config:
            if config.has_option(section, 'tenancy'):
                entry = {
                    "section": section,
                    "valid": True,
                    "reason": ''
                }
                # Validate Key
                # key_file = config[section]['key_file']
                # if not os.path.exists(os.path.expanduser(key_file)):
                #     entry["valid"] = False
                #     entry["reason"] = f'{key_file} does not exist in ~/.oci'
                if config.has_option(section, 'key_file'):
                    key_file = config[section]['key_file']
                    if not os.path.exists(os.path.expanduser(key_file)):
                        entry["valid"] = False
                        entry["reason"] = '[{0!s:s}] Key File {1!s:s} does not exist.'.format(section, key_file)
                else:
                    entry["valid"] = False
                    entry["reason"] = '[{0!s:s}] Key File entry does not exist.'.format(section)
                config_sections.append(entry)
    else:
        config_sections = [{"section": 'InstancePrincipal', "valid": True, "reason": ''}]
    logger.info('Config Sections {0!s:s}'.format(config_sections))
    return config_sections

def validateConfigFile(config_file='~/.oci/config'):
    results = {"valid": True, "errors": [], "sections": {}}
    logger.debug(f'Validating Config File {config_file}')
    if os.getenv('OCI_CLI_AUTH', 'config') != 'instance_principal':
        logger.debug('Config File {0!s:s}'.format(config_file))
        abs_config_file = os.path.expanduser(config_file)
        logger.debug('Config File {0!s:s}'.format(abs_config_file))
        config = configparser.ConfigParser()
        config.read(abs_config_file)
        # if os.path.exists(abs_config_file) and os.path.isfile(abs_config_file):
        if len(config.sections()) == 0 and 'DEFAULT' not in config:
            results["valid"] = False
            results["errors"].append('OCI Connect Config file is either missing or empty.')
        else:
            for section in config:
                results["sections"][section] = {"valid": True}
                if config.has_option(section, 'key_file'):
                    key_file = config[section]['key_file']
                    if not os.path.exists(os.path.expanduser(key_file)):
                        results["valid"] = False
                        results["sections"][section]["valid"] = False
                        results["errors"].append('[{0!s:s}] Key File {1!s:s} does not exist.'.format(section, key_file))
                else:
                    results["valid"] = False
                    results["sections"][section]["valid"] = False
                    results["errors"].append('[{0!s:s}] Key File entry does not exist.'.format(section))
        logger.info(results)
    return results

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

def readGitConfigFile(config_file='~/.oci/git_repositories'):
    logger.debug('Setting File {0!s:s}'.format(config_file))
    abs_config_file = os.path.expanduser(config_file)
    logger.debug('Setting File {0!s:s}'.format(abs_config_file))
    config = configparser.ConfigParser()
    config.read(abs_config_file)
    repo_list = []
    for each_git_section in config.sections():
        repo_list.append({'label': each_git_section, 'branch': config[each_git_section]['branch'], 'url': config[each_git_section]['url']})
    logger.info(repo_list)
    return repo_list

def readStaticFiles(root):
    all_files = []
    for path, dirnames, filenames in os.walk(os.path.join(bp.static_folder, root)):
        # logger.info(f'Static: {bp.static_folder} \n\tPath: {path} \n\tRelative Path: {os.path.relpath(path, bp.static_folder)} \n\tDirectories: {dirnames} \n\tFiles: {filenames}')
        all_files.extend([os.path.join(path, filename) for filename in filenames])
    sorted_files = sorted(all_files, key=lambda file: (os.path.dirname(file), os.path.basename(file)))
    return sorted_files

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

def okit():
    local = current_app.config.get('LOCAL', False)
    if not local and session.get('username', None) is None:
        logger.info('<<<<<<<<<<<<<<<<<<<<<<<<< Redirect to Login >>>>>>>>>>>>>>>>>>>>>>>>>')
        return redirect(url_for('okit.login'), code=302)
    # Test if developer mode
    developer_mode = (request.args.get('developer', default='false') == 'true')
    if developer_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< Developer Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if experimental mode
    experimental_mode = (request.args.get('experimental', default='false') == 'true')
    if experimental_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< Experimental Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if cd3 mode
    cd3_mode = (request.args.get('cd3', default='false') == 'true')
    if cd3_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< CD3 Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if PCA mode
    pca_mode = (request.args.get('pca', default='false') == 'true')
    if pca_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< PCA Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if A2C mode
    a2c_mode = (request.args.get('a2c', default='false') == 'true')
    if a2c_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< A2C Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if Ansible mode
    ansible_mode = (request.args.get('ansible', default='false') == 'true')
    if ansible_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<< Ansible Mode >>>>>>>>>>>>>>>>>>>>>>>>")
    # Read Artifact Model Specific JavaScript Files
    artefact_model_js_files = sorted(os.listdir(os.path.join(bp.static_folder, 'model', 'js', 'artefacts')))
    # Read Artifact View Specific JavaScript Files
    if os.path.exists(os.path.join(bp.static_folder, 'view', 'js', 'artefacts')) and os.path.isdir(os.path.join(bp.static_folder, 'view', 'js', 'artefacts')):
        artefact_view_js_files = sorted(os.listdir(os.path.join(bp.static_folder, 'view', 'js', 'artefacts')))
    else:
        artefact_view_js_files = []
    artefact_view_js_files.extend(sorted(os.listdir(os.path.join(bp.static_folder, 'view', 'designer', 'js', 'artefacts'))))

    # Read Pallete Json
    palette_json = readJsonFile(os.path.join(bp.static_folder, 'palette', 'palette.json'))
    config_sections = {"sections": readConfigFileSections()}

    #Render The Template
    return render_template('okit/okit.html',
                           artefact_model_js_files=artefact_model_js_files,
                           artefact_view_js_files=artefact_view_js_files,
                           palette_json=palette_json,
                           local_okit=local,
                           developer_mode=developer_mode, experimental_mode=experimental_mode, cd3_mode=cd3_mode, a2c_mode=a2c_mode, pca_mode=pca_mode, ansible_mode=ansible_mode)

@bp.route('/', methods=(['GET']))
@bp.route('/okit', methods=(['GET']))
@bp.route('/designer', methods=(['GET']))
def designer_redirect():
 return render_template('okit/designer.html')

@bp.route('/console', methods=(['GET']))
def console():
    local = current_app.config.get('LOCAL', False)
    if not local and session.get('username', None) is None:
        logger.info('<<<<<<<<<<<<<<<<<<<<<<<<< Redirect to Login >>>>>>>>>>>>>>>>>>>>>>>>>')
        return redirect(url_for('okit.login'), code=302)
    # Test if developer mode
    developer_mode = (request.args.get('developer', default='false') == 'true')
    if developer_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< Developer Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if experimental mode
    experimental_mode = (request.args.get('experimental', default='false') == 'true')
    if experimental_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< Experimental Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if cd3 mode
    cd3_mode = (request.args.get('cd3', default='false') == 'true')
    if cd3_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< CD3 Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if PCA mode
    pca_mode = (request.args.get('pca', default='false') == 'true')
    if pca_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< PCA Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if OCI mode
    oci_mode = (request.args.get('oci', default='false') == 'true')
    if oci_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< OCI Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    if oci_mode and pca_mode:
        oci_mode = False
        pca_mode = False
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< OCI & PCA Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if A2C mode
    a2c_mode = (request.args.get('a2c', default='false') == 'true')
    if a2c_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< A2C Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if Ansible mode
    ansible_mode = (request.args.get('ansible', default='false') == 'true')
    if ansible_mode:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<< Ansible Mode >>>>>>>>>>>>>>>>>>>>>>>>")
    # Define Resource directories
    # Process Javascript & css files
    resource_dirs = ['model', 'view', 'properties', 'file', 'panels', 'pricing', 'spreadsheet', 'views']
    resource_files = {'js': [], 'css': []}
    for dir in resource_dirs:
        sorted_files = readStaticFiles(dir)
        resource_files['js'].extend([os.path.relpath(path, bp.static_folder) for path in sorted_files if os.path.splitext(path)[1] == '.js'])
        resource_files['css'].extend([os.path.relpath(path, bp.static_folder) for path in sorted_files if os.path.splitext(path)[1] == '.css'])
    logger.debug(jsonToFormattedString(resource_files))

    # Read Palette Json
    palette_json = readJsonFile(os.path.join(bp.static_folder, 'palette', 'palette.json'))
    # Read SVG File
    palette_json['svg'] = {}
    palette_json['files'] = {}
    for group in palette_json.get('groups', []):
        for resource in group.get('resources', []):
            palette_json['files'][resource['title'].lower()] = os.path.join('/', 'static', 'okit', 'palette', 'svg', resource['svg'])
            with open(os.path.join(bp.static_folder, 'palette', 'svg', resource['svg']), 'r') as svgFile:
                palette_json['svg'][resource['title'].lower()] = ''.join(svgFile.read().splitlines())

    #Render The Template
    return render_template('okit/okit_designer.html',
                           resource_files=resource_files,
                           palette_json=palette_json,
                           local_okit=local,
                           developer_mode=developer_mode, 
                           experimental_mode=experimental_mode, 
                           cd3_mode=cd3_mode, 
                           a2c_mode=a2c_mode, 
                           oci_mode=oci_mode, 
                           pca_mode=pca_mode, 
                           ansible_mode=ansible_mode)

@bp.route('oci', defaults={'target': 'oci'}, methods=(['GET']))
@bp.route('pca', defaults={'target': 'pca'}, methods=(['GET']))
@bp.route('c3', defaults={'target': 'c3'}, methods=(['GET']))
def designer(target):
    local = current_app.config.get('LOCAL', False)
    if not local and session.get('username', None) is None:
        logger.info('<<<<<<<<<<<<<<<<<<<<<<<<< Redirect to Login >>>>>>>>>>>>>>>>>>>>>>>>>')
        return redirect(url_for('okit.login'), code=302)
    pca_mode = (target == 'pca')
    c3_mode = (target == 'c3')
    oci_mode = (target == 'oci')
    developer_mode = False
    experimental_mode = False
    cd3_mode = False
    ansible_mode = False
    a2c_mode = False
    # # Test if developer mode
    # developer_mode = (request.args.get('developer', default='false') == 'true')
    # if developer_mode:
    #     logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< Developer Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # # Test if experimental mode
    # experimental_mode = (request.args.get('experimental', default='false') == 'true')
    # if experimental_mode:
    #     logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< Experimental Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # # Test if cd3 mode
    # cd3_mode = (request.args.get('cd3', default='false') == 'true')
    # if cd3_mode:
    #     logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<< CD3 Mode >>>>>>>>>>>>>>>>>>>>>>>>>>")
    # Test if PCA mode
    # # Test if Ansible mode
    # ansible_mode = (request.args.get('ansible', default='false') == 'true')
    # if ansible_mode:
    #     logger.info("<<<<<<<<<<<<<<<<<<<<<<<< Ansible Mode >>>>>>>>>>>>>>>>>>>>>>>>")
    # Define Resource directories
    # Process Javascript & css files
    resource_dirs = ['model', 'view', 'properties', 'file', 'panels', 'pricing', 'spreadsheet', 'views']
    resource_files = {'js': [], 'css': []}
    for dir in resource_dirs:
        sorted_files = readStaticFiles(dir)
        resource_files['js'].extend([os.path.relpath(path, bp.static_folder) for path in sorted_files if os.path.splitext(path)[1] == '.js'])
        resource_files['css'].extend([os.path.relpath(path, bp.static_folder) for path in sorted_files if os.path.splitext(path)[1] == '.css'])
    logger.debug(jsonToFormattedString(resource_files))

    # Read Palette Json
    palette_json = readJsonFile(os.path.join(bp.static_folder, 'palette', 'palette.json'))
    # Read SVG File
    palette_json['svg'] = {}
    palette_json['files'] = {}
    for group in palette_json.get('groups', []):
        for resource in group.get('resources', []):
            palette_json['files'][resource['title'].lower()] = os.path.join('/', 'static', 'okit', 'palette', 'svg', resource['svg'])
            with open(os.path.join(bp.static_folder, 'palette', 'svg', resource['svg']), 'r') as svgFile:
                palette_json['svg'][resource['title'].lower()] = ''.join(svgFile.read().splitlines())

    #Render The Template
    return render_template('okit/okit_designer.html',
                           resource_files=resource_files,
                           palette_json=palette_json,
                           local_okit=local,
                           oci_mode=oci_mode, 
                           pca_mode=pca_mode, 
                           c3_mode=c3_mode, 
                           target=target,
                           developer_mode=developer_mode, 
                           experimental_mode=experimental_mode, 
                           cd3_mode=cd3_mode, 
                           a2c_mode=a2c_mode, 
                           ansible_mode=ansible_mode)


# Template Processing
@bp.route('/panel/templates', methods=(['GET']))
def templates_panel():
    target = request.args.get('target', default='')
    logger.info(f'Template target {target}')
    # ref_arch_root = os.path.join(bp.static_folder, 'templates', 'reference_architecture')
    ref_arch_root = os.path.join(current_app.instance_path, 'templates', 'reference_architecture', target)
    ref_arch_templates = dir_to_json(ref_arch_root, current_app.instance_path, 'children', 'templates')
    # ref_arch_templates = dir_to_json(ref_arch_root, ref_arch_root, 'children', 'templates')
    ref_arch_category = {'name': 'Reference Architectures', 'path': 'reference_architecture', 'children': [], 'templates': []}
    ref_arch_category = hierarchy_category(ref_arch_category, ref_arch_templates, current_app.instance_path)
    # user_root = os.path.join('okit', 'templates', 'user')
    user_root = os.path.join(current_app.instance_path, 'templates', 'user')
    user_templates = dir_to_json(user_root, current_app.instance_path, 'children', 'templates')
    # user_templates = dir_to_json(user_root, user_root, 'children', 'templates')
    user_category = {'name': 'User', 'path': 'user', 'children': [], 'templates': []}
    user_category = hierarchy_category(user_category, user_templates, current_app.instance_path)
    template_categories = [ref_arch_category, user_category]
    logger.debug(f'Template Categories : {jsonToFormattedString(template_categories)}')

    #Render The Template
    return render_template('okit/templates_panel.html', template_categories=template_categories)

def dir_to_json(rootdir, reltodir=None, dkey='dirs', fkey='files'):
    # logger.info(f'Root Path: {rootdir}')
    # logger.info(f'Relative to Path: {reltodir}')
    # logger.info(f'Relative Path: {os.path.relpath(rootdir, reltodir)}')
    hierarchy = {
        'id': os.path.relpath(rootdir, reltodir).replace('/','_'),
        'name': os.path.basename(rootdir),
        'path': rootdir
    }
    hierarchy[dkey] = []
    hierarchy[fkey] = []
    if reltodir is not None:
        hierarchy['path'] = os.path.relpath(rootdir, reltodir)

    with os.scandir(rootdir) as it:
        for entry in it:
            if not entry.name.startswith('.'):
                if entry.name.endswith('.json') and entry.is_file():
                    # hierarchy[fkey].append(entry.name)
                    hierarchy[fkey].append({'id': entry.name.replace('.','_'), 'name': entry.name, 'json': entry.name, 'path': hierarchy['path']})
                elif entry.is_dir():
                    hierarchy[dkey].append(dir_to_json(os.path.join(rootdir, entry.name), reltodir, dkey, fkey))

    # logger.info(f'Directory Hierarchy : {jsonToFormattedString(hierarchy)}')
    hierarchy[fkey] = sorted(hierarchy[fkey], key=lambda d: d['name'])
    hierarchy[dkey] = sorted(hierarchy[dkey], key=lambda d: d['name'])
    return hierarchy

def hierarchy_category(category, hierarchy, root=''):
    logger.debug(f'Category : {jsonToFormattedString(category)}')
    logger.debug(f'Hierarchy : {jsonToFormattedString(hierarchy)}')
    logger.debug(f'Root : {root}')
    for template in hierarchy['templates']:
        path = hierarchy['path'] if hierarchy['path'] != '.' else ''
        category['templates'].append(get_template_entry(root, path, template['json']))
    for child in hierarchy['children']:
        category['children'].append(hierarchy_category({"name": os.path.basename(child["path"]).replace("_", " ").title(), "path": child["path"], "id": child["id"], "children": [], "templates": []}, child, root))
    return category

def get_template_entry(root, path, json_file):
    # json_file = os.path.join(path, template_file)
    okit_template = {'path': path, 'json': json_file, 'id': json_file.replace('.', '_').replace('/', '_')}
    try:
        filename = os.path.join(root, okit_template['path'], okit_template['json'])
        template_json = readJsonFile(filename)
        logger.debug('Template Json : {0!s:s}'.format(template_json))
        okit_template['name'] = template_json['title']
        okit_template['description'] = template_json.get('description', template_json['title'])
        okit_template['description'] = template_json['title']
    except Exception as e:
        logger.debug(e)
    return okit_template


@bp.route('/templates/load', methods=(['GET']))
def templates():
    if request.method == 'GET':
        templates_root = os.path.join(current_app.instance_path, request.args['root_dir'].strip('/'))
        templates = dir_to_json(templates_root, current_app.instance_path)
        logger.debug(f'Templates : {jsonToFormattedString(templates)}')
        return templates


@bp.route('/template/load', methods=(['GET']))
def template_load():
    if request.method == 'GET':
        template_file = request.args.get("template_file")
        return send_from_directory(current_app.instance_path, template_file, mimetype='application/json', as_attachment=False)


@bp.route('/template/save', methods=(['POST']))
def template_save():
    if request.method == 'POST':
        instance_path = current_app.instance_path
        root_dir = request.json["root_dir"].strip('/')
        template_filename = request.json["template_file"].strip('/')
        if not template_filename.endswith('.json'):
            template_filename = f'{template_filename}.json'
        okit_json = request.json["okit_json"]
        git = request.json.get('git', False)
        git_commit_msg = request.json.get('git_commit_msg', '')
        logger.info(f'Save Template : {root_dir} {template_filename}')

        template_dir = os.path.dirname(template_filename)
        full_dir = os.path.join(instance_path, root_dir, template_dir)
        full_filename = os.path.join(full_dir, os.path.basename(template_filename))
        full_filename = os.path.join(instance_path, root_dir, template_filename)
        if not os.path.exists(full_dir):
            os.makedirs(full_dir, exist_ok=True)
        writeJsonFile(okit_json, full_filename)
        if git:
            top_dir = os.path.normpath(os.path.dirname(template_filename)).split(os.sep)
            git_repo_dir = os.path.join(instance_path, root_dir, top_dir[0], top_dir[1])
            logger.debug(f'Git Root Dir : {git_repo_dir}')
            logger.debug(f'Template Filename : {template_filename}')
            logger.debug(f'Full Filename : {full_filename}')
            repo = Repo(git_repo_dir)
            repo.index.add(full_filename)
            repo.index.commit("commit changes from okit:" + git_commit_msg)
            repo.remotes.origin.pull()
            repo.remotes.origin.push()
        return template_filename


# Git Processing
@bp.route('/panel/git', methods=(['GET']))
def git_panel():
    if request.method == 'GET':
        repositories = readGitConfigFile()
        git_resources = {}
        for repo in repositories:
            logger.debug(f'Repo: {jsonToFormattedString(repo)}')
            label = repo['label']
            branch = repo['branch']
            url = repo['url']
            parsed_url = giturlparse.parse(url)
            logger.debug(f'Parsed Url: {parsed_url}')
            git_resource_dir = os.path.join(current_app.instance_path, 'git', parsed_url.resource)
            git_repo_dir = os.path.join(git_resource_dir, parsed_url.name)
            try:
                if os.path.exists(git_repo_dir):
                    repo = Repo(git_repo_dir)
                    repo.remotes.origin.pull()
                else:
                    repo = Repo.clone_from(url, git_repo_dir, branch=branch, no_single_branch=True)
                    repo.remotes.origin.pull()
            except Exception as e:
                logger.exception(e)
            git_resources[parsed_url.resource] = git_resource_dir
        git_repositories = []
        for git_resource, git_resource_dir in git_resources.items():
            repo_templates = dir_to_json(git_resource_dir, current_app.instance_path, 'children', 'templates')
            repository = {'name': git_resource, 'path': git_resource_dir, 'children': [], 'templates': []}
            git_repositories.append(repo_templates)
        #Render The Template
        logger.debug(f'Repository: {jsonToFormattedString(git_repositories)}')
        return render_template('okit/git_repositories_panel.html', git_repositories=git_repositories)


# Local Filesystem Processing
@bp.route('/panel/local', methods=(['GET']))
def local_panel():
    if request.method == 'GET':
        local_filesystem_dir = os.path.join(current_app.instance_path, 'local')
        local_filesystem = [dir_to_json(local_filesystem_dir, current_app.instance_path, 'children', 'templates')]
        #Render The Template
        # logger.debug(f'Local Filesystem: {jsonToFormattedString(local_filesystem)}')
        return render_template('okit/local_panel.html', local_filesystem=local_filesystem)


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
    if request.method == 'POST':
        logger.debug('JSON     : {0:s}'.format(str(request.json)))
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
                destination_dir = tempfile.mkdtemp()
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
        logger.info(f'Returning /tmp/okit-{language}.zip')
        return send_from_directory('/tmp', "okit-{0:s}.zip".format(str(language)), mimetype='application/zip', as_attachment=True)


# TODO: Delete
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


@bp.route('/dropdown/data/<string:profile>/<string:region>', methods=(['GET', 'POST']))
def dropdownData(profile, region):
    dropdown_dir = os.path.abspath(os.path.join(bp.static_folder, 'json', 'dropdown'))
    shipped_dropdown_file = os.path.abspath(os.path.join(dropdown_dir, 'dropdown.json'))
    # shipped_dropdown_file = os.path.abspath(os.path.join(bp.static_folder, 'json', 'dropdown', 'dropdown.json'))
    profile_dropdown_dir = os.path.abspath(os.path.join(dropdown_dir, 'profiles'))
    profile_dropdown_file = os.path.abspath(os.path.join(profile_dropdown_dir, profile, f'{region}.json'))
    # Check if profile specific dropdown file exists if not use the default
    if request.method == 'GET':
        if os.path.exists(profile_dropdown_file):
            dropdown_file = profile_dropdown_file
            logger.info(f'Loading Dropdown file {dropdown_file}')
            dropdown_json = readJsonFile(dropdown_file)
        else:
            dropdown_file = shipped_dropdown_file
            logger.info(f'Loading Dropdown file {dropdown_file}')
            dropdown_json = readJsonFile(dropdown_file)
            dropdown_json["shipped"] = True
            dropdown_json["default"] = True
        return dropdown_json
    elif request.method == 'POST':
        logger.info(f'Saving Dropdown file {profile_dropdown_file}')
        writeJsonFile(request.json, profile_dropdown_file)
        return request.json
    else:
        return 'Unknown Method', 500

@bp.route('dropdown', methods=(['DELETE', 'GET']))
def dropdownRemove():
    if request.method == 'DELETE':
        dropdown_dir = os.path.abspath(os.path.join(bp.static_folder, 'json', 'dropdown'))
        profile_dropdown_dir = os.path.abspath(os.path.join(dropdown_dir, 'profiles'))
        shutil.rmtree(profile_dropdown_dir)
        return '', 200
    elif request.method == 'GET':
        dropdown_dir = os.path.abspath(os.path.join(bp.static_folder, 'json', 'dropdown'))
        dropdown_file = os.path.abspath(os.path.join(dropdown_dir, 'dropdown.json'))
        dropdown_json = readJsonFile(dropdown_file)
        return dropdown_json
    else:
        return 'Unknown Method', 500


@bp.route('cache', methods=(['GET', 'POST']))
def okitCache():
    dropdown_dir = os.path.abspath(os.path.join(bp.static_folder, 'json', 'dropdown'))
    shipped_dropdown_file = os.path.abspath(os.path.join(dropdown_dir, 'dropdown.json'))
    cache_file = os.path.abspath(os.path.join(bp.static_folder, 'json', 'cache.json'))
    if request.method == 'GET':
        cache = {}
        logger.info('>>>>> Reading Cache')
        if os.path.exists(cache_file):
            cache = readJsonFile(cache_file)
        if cache.get('default', None) is None:
            cache['default'] = readJsonFile(shipped_dropdown_file)
            cache['profile'] = {}
        logger.debug(jsonToFormattedString(cache))
        return cache
    elif request.method == 'POST':
        writeJsonFile(request.json, cache_file)
        return
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

@bp.route('config/validated_sections', methods=(['GET']))
def configValidatedSections():
    if request.method == 'GET':
        config_sections = {"sections": readAndValidateConfigFileSections()}
        logger.info('Config Sections {0!s:s}'.format(config_sections))
        return config_sections
    else:
        return 'Unknown Method', 500

@bp.route('config/appsettings', methods=(['GET']))
def appSettings():
    if request.method == 'GET':
        config_settings = {"gitsections": readGitConfigFile()}
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

# TODO: Delete
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

