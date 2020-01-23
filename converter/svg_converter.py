#!/usr/bin/python

# Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
# The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "svg_converter"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import getopt
import os
import re
import sys
from contextlib import closing
from xml.dom import minidom

from common.ociLogging import getLogger

# Configure logging
logger = getLogger()

XML           = '<?xml version="1.0" encoding="utf-8"?>\n'
DOCTYPE       = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'
SVG_START_TAG = '<svg version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="{0!s:s}">\n'
STYLE         = '   <style type="text/css">{0!s:s}</style>\n'
G_START_TAG   = '   <g transform="translate(-140, -140) scale(2, 2)">\n'
LINE_TAG      = '      <line     class="{0!s:s}" x1="{1!s:s}" y1="{2!s:s}" x2="{3!s:s}" y2="{4!s:s}"/>\n'
POLYLINE_TAG  = '      <polyline class="{0!s:s}" points="{1!s:s}"/>\n'
POLYGON_TAG   = '      <polygon  class="{0!s:s}" points="{1!s:s}"/>\n'
CIRCLE_TAG    = '      <circle   class="{0!s:s}" cx="{1!s:s}" cy="{2!s:s}" r="{3!s:s}"/>\n'
RECT_TAG      = '      <rect     class="{0!s:s}" x="{1!s:s}" y="{2!s:s}" width="{3!s:s}" height="{4!s:s}"/>\n'
PATH_TAG      = '      <path     class="{0!s:s}" d="{1!s:s}"/>\n'
G_END_TAG     = '   </g>\n'
SVG_END_TAG   = '</svg>\n'

# Execute workflow
def processWorkflow(args):
    svg_files = [f for f in os.listdir(args['sourcedir']) if os.path.isfile(os.path.join(args['sourcedir'], f))]
    for svg_file in svg_files:
        logger.info('Converting SVG File {0!s:s}'.format(os.path.join(args['sourcedir'], svg_file)))
        svg_doc = minidom.parse(os.path.join(args['sourcedir'], svg_file))
        style_tags = svg_doc.getElementsByTagName('style')
        styles = []
        for style_tag in style_tags:
            styles.append(style_tag.firstChild.nodeValue)
        logger.debug('Styles : {0!s:s}'.format(styles))
        styles_string = ';'.join(styles)
        logger.debug('Styles String : {0!s:s}'.format(styles_string))
        svg_tags = svg_doc.getElementsByTagName('svg')
        logger.debug('svg Tags')
        for svg_tag in svg_tags:
            logger.debug(svg_tag.getAttribute('id'))
            logger.debug(svg_tag.getAttribute('viewBox'))
            logger.debug(svg_tag.getAttribute('width'))
            logger.debug(svg_tag.getAttribute('height'))
            logger.debug(svg_tag.getAttribute('style'))
        logger.debug('g Tags')
        g_tags = svg_doc.getElementsByTagName('g')
        for g_tag in g_tags:
            logger.debug(g_tag.firstChild.nodeValue)
        logger.debug('Retrieving Path Tags')
        path_tags = svg_doc.getElementsByTagName('path')
        logger.debug('Adjusting Paths')
        viewBox = svg_tags[0].getAttribute('viewBox')
        logger.debug('Current View Box {0!s:s}'.format(viewBox))

        # Get Current View Box x/y for adjustment
        viewBox_points = viewBox.split()
        vbx = float(viewBox_points[0]) * -1
        vby = float(viewBox_points[1]) * -1
        logger.debug('Adjustments x: {0!s:s} y: {1!s:s}'.format(vbx, vby))
        # Set View Box x/y to 0
        viewBox_points[0] = '0'
        viewBox_points[1] = '0'
        # Need to modify this to walk the child Hierarchy of the first g looking for path, line, polyline, circle & rect
        with closing(open(os.path.join(args['destdir'], svg_file), 'w')) as f:
            f.write(XML)
            f.write(DOCTYPE)
            f.write(SVG_START_TAG.format(' '.join(viewBox_points)))
            f.write(STYLE.format(styles_string))
            f.write(G_START_TAG)
            if len(g_tags) > 0:
                processGTag(g_tags[0], f, vbx, vby)
            else:
                for path_tag in path_tags:
                    processPathTag(path_tag, f, vbx, vby)
            f.write(G_END_TAG)
            f.write(SVG_END_TAG)
        logger.info('   Written SVG File {0!s:s}\n'.format(os.path.join(args['destdir'], generateOutputFilename(svg_file))))

    return


def processGTag(node, file, vbx, vby):
    for child in node.childNodes:
        if child.nodeName == 'line':
            processLineTag(child, file, vbx, vby)
        elif child.nodeName == 'polyline':
            processPolylineTag(child, file, vbx, vby)
        elif child.nodeName == 'polygon':
            processPolygonTag(child, file, vbx, vby)
        elif child.nodeName == 'circle':
            processCircleTag(child, file, vbx, vby)
        elif child.nodeName == 'rect':
            processRectTag(child, file, vbx, vby)
        elif child.nodeName == 'path':
            processPathTag(child, file, vbx, vby)
        elif child.nodeName == 'g':
            processGTag(child, file, vbx, vby)
    return


def processLineTag(node, file, vbx, vby):
    style_class = node.getAttribute('class')
    x1 = float(node.getAttribute('x1'))
    y1 = float(node.getAttribute('y1'))
    x2 = float(node.getAttribute('x2'))
    y2 = float(node.getAttribute('y2'))
    # Adjust
    x1 += vbx
    y1 += vby
    x2 += vbx
    y2 += vby
    file.write(LINE_TAG.format(style_class, x1, y1, x2, y2))
    return


def processPolylineTag(node, file, vbx, vby):
    style_class = node.getAttribute('class')
    points = parsePolyline(node.getAttribute('points'))
    points = updatePolyline(points, vbx, vby)
    file.write(POLYLINE_TAG.format(style_class, polylineToString(points)))
    return


def processPolygonTag(node, file, vbx, vby):
    style_class = node.getAttribute('class')
    points = parsePolygon(node.getAttribute('points'))
    points = updatePolygon(points, vbx, vby)
    file.write(POLYGON_TAG.format(style_class, polygonToString(points)))
    return


def processCircleTag(node, file, vbx, vby):
    style_class = node.getAttribute('class')
    cx = float(node.getAttribute('cx'))
    cy = float(node.getAttribute('cy'))
    r = float(node.getAttribute('r'))
    # Adjust
    cx += vbx
    cy += vby
    file.write(CIRCLE_TAG.format(style_class, cx, cy, r))
    return


def processRectTag(node, file, vbx, vby):
    style_class = node.getAttribute('class')
    x = float(node.getAttribute('x'))
    y = float(node.getAttribute('y'))
    width = float(node.getAttribute('width'))
    height = float(node.getAttribute('height'))
    # Adjust
    x += vbx
    y += vby
    file.write(RECT_TAG.format(style_class, x, y, width, height))
    return


def processPathTag(node, file, vbx, vby):
    style_class = node.getAttribute('class')
    command_list = parsePath(node.getAttribute('d'))
    command_list = updatePath(command_list, vbx, vby)
    file.write(PATH_TAG.format(style_class, pathToString(command_list)))
    return


COMMANDS = 'MmZzLlHhVvCcSsQqTtAa'
COMMAND_RE = re.compile("([{0!s:s}])".format(COMMANDS))


def parsePath(path):
    logger.debug('Passed Path : {0!s:s}'.format(path))
    path = ''.join(path.split())
    logger.debug('Split & Joined Path : {0!s:s}'.format(path))
    split_path = COMMAND_RE.split(path)

    logger.debug('Split Path : {0!s:s}'.format(split_path))
    i = 1
    command_list = []
    while i < len(split_path):
        logger.debug('{0:02d}) {1!s:s}'.format(i, split_path[i]))
        if split_path[i] in COMMANDS:
            command = {'command': split_path[i], 'points': [float(e) for e in split_path[i + 1].replace('-', ',-').split(',') if e != '']}
            command_list.append(command)
            i += 1
        i += 1
    logger.debug('Commands : {0!s:s}'.format(command_list))
    return command_list


def updatePath(command_list, vbx, vby):
    for command in command_list:
        if command['command'].isupper():
            logger.debug('Updating Command {0!s:s} : {1!s:s}'.format(command['command'], command['points']))
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
            logger.debug('Updated Command {0!s:s} : {1!s:s}'.format(command['command'], command['points']))

    return command_list


def pathToString(command_list):
    path_d = ' '.join(['{0!s:s}{1!s:s}'.format(cmd['command'], ','.join(format(p, "0.1f") for p in cmd['points'])) for cmd in command_list])
    logger.debug('Path.d {0!s:s}'.format(path_d))
    return path_d


def parsePolyline(polyline):
    logger.debug('Passed Polyline : {0!s:s}'.format(polyline))
    points = [float(p) for p in polyline.replace(' ', ',').split(',') if p != '']
    logger.debug('Replace & Split Polyline : {0!s:s}'.format(points))
    return points


def updatePolyline(points, vbx, vby):
    logger.debug('Polyline Points : {0!s:s}'.format(points))
    i = 0;
    while i < len(points):
        points[i] += vbx
        points[i + 1] += vby
        i += 2
    logger.debug('Updated Polyline Points : {0!s:s}'.format(points))
    return points


def polylineToString(points):
    polyline_points = ','.join(format(p, "0.1f") for p in points)
    logger.debug('Polyline.points {0!s:s}'.format(polyline_points))
    return polyline_points


def parsePolygon(polygon):
    logger.debug('Passed Polygon : {0!s:s}'.format(polygon))
    points = [float(p) for p in polygon.replace(' ', ',').split(',') if p != '']
    logger.debug('Replace & Split Polygon : {0!s:s}'.format(points))
    return points


def updatePolygon(points, vbx, vby):
    logger.debug('Polygon Points : {0!s:s}'.format(points))
    logger.debug('Updated Polygon Points : {0!s:s}'.format(points))
    return points


def polygonToString(points):
    polygon_points = ','.join(format(p, "0.1f") for p in points)
    logger.debug('Polygon.points {0!s:s}'.format(polygon_points))
    return polygon_points


def writeFile():
    return


def generateOutputFilename(filename):
    return filename.replace('OCI_', '')


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
