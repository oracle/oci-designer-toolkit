
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "drawioXMLParser"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


from common.ociCommon import parseJsonString
from common.ociCommon import readXmlFile
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()

class OCIDrawIoXMLParser(object):
    # XML Tag names
    ROOT_TAG_NAME = 'root'
    OCI_OBJECT_TAG_NAME = 'object'
    # OCI XML Element Attributes
    RESOURCE_TYPE_KEY = 'type'

    def __init__(self, xml_file):
        self.xml_file = xml_file
        self.visualiser_json = {}
        self.tree = None
        return

    def parse(self, xml_file=None, **kwargs):
        if xml_file is None:
            xml_file = self.xml_file
        self.tree = readXmlFile(xml_file)
        xmlroot = self.tree.getroot()
        rootelement = xmlroot.find(self.ROOT_TAG_NAME)
        oci_object_elements_list = rootelement.findall(self.OCI_OBJECT_TAG_NAME)
        logger.info("Parsing Drawio Xml")
        for oci_object_element in oci_object_elements_list:
            #logger.info(oci_object_element.attrib)
            if self.RESOURCE_TYPE_KEY in oci_object_element.attrib:
                #logger.info('type in oci_object_element.attrib')
                oci_resource = oci_object_element.attrib[self.RESOURCE_TYPE_KEY]
                #self.visualiser_json[oci_resource] = {}
                oci_resource_data = {}
                for attribute_key in oci_object_element.attrib.keys():
                    #self.visualiser_json[oci_resource][attribute_key] = parseJsonString(oci_object_element.attrib[attribute_key])
                    oci_resource_data[attribute_key] = parseJsonString(oci_object_element.attrib[attribute_key])
                    logger.debug('{0:s}: {1}'.format(attribute_key, parseJsonString(oci_object_element.attrib[attribute_key])))
                # Because the output json contains lists of type we will check add "s" to the resource name and test if
                # it exist and if not create it.
                oci_resource_list = '{0:s}s'.format(oci_resource)
                if oci_resource_list not in self.visualiser_json:
                    self.visualiser_json[oci_resource_list] = []
                self.visualiser_json[oci_resource_list].append(oci_resource_data)
            else:
                logger.info('type not in oci_object_element.attrib')
            #logger.info('Type: {0:s}'.format(oci_object_element.attrib.get('type', 'Not Specified')))
            #logger.info('Name: {0:s}'.format(oci_object_element.attrib.get('name', 'Not Specified')))
            #logger.info('CIDR: {0:s}'.format(oci_object_element.attrib.get('cidr', 'Not Specified')))
            #logger.info('DNS: {0:s}'.format(oci_object_element.attrib.get('dns_label', 'Not Specified')))
        return

    def getJson(self):
        return self.visualiser_json

