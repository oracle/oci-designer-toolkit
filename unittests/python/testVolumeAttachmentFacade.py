import unittest

from facades.ociCompartment import OCICompartments
from facades.ociVolumeAttachment import OCIVolumeAttachments
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class VolumeAttachmentTests(unittest.TestCase):
    def test_volume_attachment_query(self):
        logger.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<< test_volume_attachment_query >>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        # Get Wizards Compartment
        oci_compartments = OCICompartments()
        compartments = oci_compartments.listTenancy(filter={'name': 'Wizards'})
        if len(compartments) == 0:
            self.assertEqual(True, False)
        oci_volume_attachments = OCIVolumeAttachments();
        for compartment in compartments:
            logger.info('Processing Compartment {0!s:s} - {1!s:s}'.format(compartment['name'], compartment['id']))
            volume_attachments = oci_volume_attachments.list(compartment_id=compartment['id']);
            logger.info('Volume Atachments : {0!s:s}'.format(str(volume_attachments)))

if __name__ == '__main__':
    unittest.main()
