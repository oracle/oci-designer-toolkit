
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
import os
import shutil
import tempfile
import time
import urllib
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
    return config_sections

def getConfigFileValue(section, key, config_file='~/.oci/config'):
    logger.debug('Config File {0!s:s}'.format(config_file))
    abs_config_file = os.path.expanduser(config_file)
    logger.debug('Config File {0!s:s}'.format(abs_config_file))
    config = configparser.ConfigParser()
    config.read(abs_config_file)
    return config[section][key]

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
    # Read Artifact Specific JavaScript Files
    oci_assets_js = sorted(os.listdir(os.path.join(bp.static_folder, 'js', 'oci_artefacts')))
    # Read Artifact View Specific JavaScript Files
    artefact_view_js_files = sorted(os.listdir(os.path.join(bp.static_folder, 'view', 'designer', 'js', 'artefact')))

    # Get Palette Icon Groups / Icons
    svg_files = []
    svg_icon_groups = {}
    # Read Files
    for (dirpath, dirnames, filenames) in os.walk(os.path.join(bp.static_folder, 'palette')):
        logger.debug('dirpath : {0!s:s}'.format(dirpath))
        logger.debug('dirnames : {0!s:s}'.format(dirnames))
        logger.debug('filenames : {0!s:s}'.format(filenames))
        if os.path.basename(dirpath) != 'palette':
            svg_files.extend([os.path.join(os.path.basename(dirpath), f) for f in filenames])
            svg_icon_groups[os.path.basename(dirpath)] = filenames
        else:
            svg_files.extend(filenames)
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
        logger.info('Fragment : {0!s:s}'.format(fragment_svg))
        logger.info('Fragment full : {0!s:s}'.format(os.path.join(bp.static_folder, 'fragments', 'svg', fragment_svg)))
        fragment_icon = {'svg': fragment_svg, 'title': os.path.basename(fragment_svg).split('.')[0].replace('_', ' ').title()}
        logger.info('Icon : {0!s:s}'.format(fragment_icon))
        fragment_icons.append(fragment_icon)

    # Walk Template directory Structure
    template_files = []
    template_dirs = {}
    logger.debug('Walking the template directories')
    rootdir = os.path.join(bp.static_folder, 'templates')
    for (dirpath, dirnames, filenames) in os.walk(rootdir):
        logger.debug('dirpath : {0!s:s}'.format(dirpath))
        logger.debug('dirnames : {0!s:s}'.format(dirnames))
        logger.debug('filenames : {0!s:s}'.format(filenames))
        relpath = os.path.relpath(dirpath, rootdir)
        logger.debug('Relative Path : {0!s:s}'.format(relpath))
        template_files.extend([os.path.join(relpath, f) for f in filenames])
        template_dirs[relpath] = filenames
    logger.debug('Files Walk : {0!s:s}'.format(template_files))
    logger.debug('Template Dirs {0!s:s}'.format(template_dirs))

    template_groups = []
    for key in sorted(template_dirs.keys()):
        template_group = {'name': str(key).replace('_', ' ').title(), 'templates': []}
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

    config_sections = {"sections": readConfigFileSections()}
    logger.info('Config Sections {0!s:s}'.format(config_sections))

    #Render The Template
    return render_template('okit/okit_designer.html',
                           oci_assets_js=oci_assets_js,
                           artefact_view_js_files=artefact_view_js_files,
                           palette_icon_groups=palette_icon_groups,
                           fragment_icons=fragment_icons,
                           okit_templates_groups=template_groups)


@bp.route('/propertysheets/<string:sheet>', methods=(['GET']))
def propertysheets(sheet):
    return render_template('okit/propertysheets/{0:s}'.format(sheet))


@bp.route('/valueproposition/<string:sheet>', methods=(['GET']))
def valueproposition(sheet):
    return render_template('okit/valueproposition/{0:s}'.format(sheet))


@bp.route('/generate/<string:language>', methods=(['GET', 'POST']))
def generate(language):
    logger.info('Language : {0:s} - {1:s}'.format(str(language), str(request.method)))
    logger.debug('JSON     : {0:s}'.format(str(request.json)))
    if request.method == 'POST':
        use_vars = request.json.get("use_variables", True)
        try:
            destination_dir = tempfile.mkdtemp();
            if language == 'terraform':
                generator = OCITerraformGenerator(template_root, destination_dir, request.json, use_vars=use_vars)
            elif language == 'ansible':
                generator = OCIAnsibleGenerator(template_root, destination_dir, request.json, use_vars=use_vars)
            elif language == 'terraform11':
                generator = OCITerraform11Generator(template_root, destination_dir, request.json)
            generator.generate()
            generator.writeFiles()
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
            if savetype == 'template':
                filename = '{0!s:s}.json'.format(request.json['title'].replace(' ', '_').lower())
                template_type = request.json['template_type']
                if len(template_type.strip()) == 0:
                    fullpath = os.path.abspath(os.path.join(bp.static_folder, 'templates', 'uncategorised', filename))
                else:
                    typedir = os.path.abspath(os.path.join(bp.static_folder, 'templates', template_type.strip().replace(' ', '_').lower()))
                    if not os.path.exists(typedir):
                        os.makedirs(typedir)
                    fullpath = os.path.abspath(os.path.join(typedir, filename))
                logger.info('Template File Name : {0!s:s}'.format(filename))
                logger.info('>>>>>> Path to file {0!s:s}'.format(fullpath))
                writeJsonFile(request.json, fullpath)
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


@bp.route('config/region/<string:section>', methods=(['GET']))
def configRegion(section):
    if request.method == 'GET':
        response = {"name": getConfigFileValue(section, 'region')}
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

