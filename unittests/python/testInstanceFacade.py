import unittest

from facades.ociCompartment import OCICompartments
from facades.ociInstance import OCIInstances
from common.ociCommon import jsonToFormattedString
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class InstanceTests(unittest.TestCase):
    def test_instance_query(self):
        logger.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<< test_instance_query >>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        # Get Wizards Compartment
        oci_compartments = OCICompartments()
        compartments = oci_compartments.listTenancy(filter={'name': 'Wizards'})
        if len(compartments) == 0:
            self.assertEqual(True, False)
        oci_instances = OCIInstances();
        for compartment in compartments:
            logger.info('Processing Compartment {0!s:s} - {1!s:s}'.format(compartment['name'], compartment['id']))
            instances = oci_instances.list(compartment_id=compartment['id']);
            logger.info('Instances : {0!s:s}'.format(jsonToFormattedString(instances)))

    def test_instance_volume_attachment_query(self):
        logger.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<< test_instance_query >>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        # Get Wizards Compartment
        oci_compartments = OCICompartments()
        compartments = oci_compartments.listTenancy(filter={'name': 'Wizards'})
        if len(compartments) == 0:
            self.assertEqual(True, False)
        oci_instances = OCIInstances();
        for compartment in compartments:
            logger.info('Processing Compartment {0!s:s} - {1!s:s}'.format(compartment['name'], compartment['id']))
            instances = oci_instances.list(compartment_id=compartment['id'], filter={'display_name': 'okit'});
            logger.info('Instances : {0!s:s}'.format(jsonToFormattedString(instances)))
            for instance_obj in oci_instances.instances_obj:
                volume_attachments = instance_obj.getVolumeAttachments().list()
                logger.info('Volume Attachements : {0!s:s} {1!s:s}'.format(instance_obj.data['display_name'], jsonToFormattedString(volume_attachments)))


if __name__ == '__main__':
    unittest.main()
