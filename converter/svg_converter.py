#!/usr/bin/python
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__ekitversion__ = "@VERSION@"
__ekitrelease__ = "@RELEASE@"
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "svg_converter"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


from contextlib import closing
import datetime
import getopt
import os
import re
import sys

import xml.etree.ElementTree as ET
from xml.dom import minidom
from svg.path import parse_path
from svg.path import Path, Line, Arc, CubicBezier, QuadraticBezier, Move

from common.ociLogging import getLogger

# Configure logging
logger = getLogger()

XML           = '<?xml version="1.0" encoding="utf-8"?>\n'
DOCTYPE       = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'
SVG_START_TAG = '<svg version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="{0!s:s}">\n'
STYLE         = '   <style type="text/css">.st0{fill:#F80000;}</style>\n'
G_START_TAG   = '   <g transform="translate(-140, -140) scale(2, 2)">\n'
PATH_TAG      = '      <path class="st0" d="{0!s:s}"/>\n'
G_END_TAG     = '   </g>\n'
SVG_END_TAG   = '</svg>\n'

# Execute workflow
def processWorkflow(args):
    ns_array = {
        'svg': 'http://www.w3.org/2000/svg',
        'xlink': 'http://www.w3.org/1999/xlink'
    }
    svg_files = [f for f in os.listdir(args['sourcedir']) if os.path.isfile(os.path.join(args['sourcedir'], f))]
    for svg_file in svg_files:
        logger.info('Converting SVG File {0!s:s}'.format(os.path.join(args['sourcedir'], svg_file)))
        svg_doc = minidom.parse(os.path.join(args['sourcedir'], svg_file))
        svg_tags = svg_doc.getElementsByTagName('svg')
        #logger.info('svg Tags')
        #for svg_tag in svg_tags:
        #    logger.info(svg_tag.getAttribute('id'))
        #    logger.info(svg_tag.getAttribute('viewBox'))
        #    logger.info(svg_tag.getAttribute('width'))
        #    logger.info(svg_tag.getAttribute('height'))
        #    logger.info(svg_tag.getAttribute('style'))
        #logger.info('g Tags')
        #g_tags = svg_doc.getElementsByTagName('g')
        #for g_tag in g_tags:
        #    logger.info(g_tag.firstChild.nodeValue)
        logger.info('Retrieving Path Tags')
        path_tags = svg_doc.getElementsByTagName('path')
        logger.info('Adjusting Paths')
        viewBox = svg_tags[0].getAttribute('viewBox')
        logger.info('Current View Box {0!s:s}'.format(viewBox))

        # Get Current View Box x/y for adjustment
        viewBox_points = viewBox.split()
        vbx = float(viewBox_points[0]) * -1
        vby = float(viewBox_points[1]) * -1
        logger.info('Adjustments x: {0!s:s} y: {1!s:s}'.format(vbx, vby))
        # Set View Box x/y to 0
        viewBox_points[0] = '0'
        viewBox_points[1] = '0'

        with closing(open(os.path.join(args['destdir'], svg_file), 'w')) as f:
            f.write(XML)
            f.write(DOCTYPE)
            f.write(SVG_START_TAG.format(' '.join(viewBox_points)))
            f.write(STYLE)
            f.write(G_START_TAG)
            for path_tag in path_tags:
                command_list = parsePath(path_tag.getAttribute('d'))
                command_list = updatePath(command_list, vbx, vby)
                f.write(PATH_TAG.format(pathToString(command_list)))
            f.write(G_END_TAG)
            f.write(SVG_END_TAG)
        logger.info('Written SVG File {0!s:s}'.format(os.path.join(args['destdir'], svg_file)))

    return


COMMANDS = 'MmZzLlHhVvCcSsQqTtAa'
COMMAND_RE = re.compile("([{0!s:s}])".format(COMMANDS))


def parsePath(path):
    #logger.info('Passed Path : {0!s:s}'.format(path))
    path = ''.join(path.split())
    #logger.info('Split & Joined Path : {0!s:s}'.format(path))
    #path = path.replace(' ', '').replace('\n', '').replace('\t', '')
    #logger.info('Replaced Path : {0!s:s}'.format(path))
    split_path = COMMAND_RE.split(path)
    #for x in split_path:
    #    logger.info('x = {0!s:s}'.format(x))

    #logger.info('Split Path : {0!s:s}'.format(split_path))
    i = 1
    command_list = []
    while i < len(split_path):
        #logger.info('{0:02d}) {1!s:s}'.format(i, split_path[i]))
        if split_path[i] in COMMANDS:
            command = {'command': split_path[i], 'points': [float(e) for e in split_path[i + 1].replace('-', ',-').split(',') if e != '']}
            command_list.append(command)
            i += 1
        i += 1
    #logger.info('Commands : {0!s:s}'.format(command_list))
    return command_list


def updatePath(command_list, vbx, vby):
    for command in command_list:
        if command['command'].isupper():
            #logger.info('Updating Command {0!s:s} : {1!s:s}'.format(command['command'], command['points']))
            if command['command'] in 'V':
                command['points'][0] += vby
            elif command['command'] in 'H':
                command['points'][0] += vbx
            else:
                i = 0;
                while i < len(command['points']):
                    command['points'][i] += vbx
                    command['points'][i + 1] += vby
                    i += 2
            #logger.info('Updated Command {0!s:s} : {1!s:s}'.format(command['command'], command['points']))

    return command_list


def pathToString(command_list):
    path_d = ' '.join(['{0!s:s}{1!s:s}'.format(cmd['command'], ','.join(format(p, "0.1f") for p in cmd['points'])) for cmd in command_list])
    #logger.info('Path.d {0!s:s}'.format(path_d))
    #return '<path class="st0" d="{0!s:s}"/>'.format(path_d)
    return path_d


def writeFile():
    return

# Set default values for Args
def defaultArgs():
    args = {}
    args['sourcedir'] = "./source"
    args['destdir'] = "./dest"
    return args


# Read Module Arguments
def readargs(opts, args):
    moduleargs = defaultArgs()

    # Read Module Command Line Arguments.
    for opt, arg in opts:
        if opt in ("-s", "--sourcedir"):
            moduleargs['sourcedir'] = arg
        elif opt in ("-d", "--destdir"):
            moduleargs['destdir'] = arg

    return moduleargs


def usage():
    return


# Main processing function
def main(argv):
    # Configure Parameters and Options
    options = 's:d:'
    longOptions = ['sourcedir=', 'destdir=']
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
