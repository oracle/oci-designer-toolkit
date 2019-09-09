import unittest

from facades.ociCompartment import OCICompartments
from facades.ociResourceManager import OCIResourceManagers
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class ResourceManagerTests(unittest.TestCase):
    def test_resource_manager_query_stacks(self):
        logger.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<< test_resource_manager_query_stacks >>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        # Get Wizards Compartment
        oci_compartments = OCICompartments()
        compartments = oci_compartments.listTenancy(filter={'name': 'Wizards'})
        #compartments = oci_compartments.listTenancy()
        if len(compartments) == 0:
            self.assertEqual(True, False)
        oci_resource_managers = OCIResourceManagers();
        for compartment in compartments:
            logger.info('Processing Compartment {0!s:s} - {1!s:s}'.format(compartment['name'], compartment['id']))
            stacks = oci_resource_managers.list(compartment_id=compartment['id']);
            logger.info('Stacks : {0!s:s}'.format(str(stacks)))

    def test_resource_manager_query_jobs(self):
        logger.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<< test_resource_manager_query_jobs >>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        # Get Wizards Compartment
        oci_compartments = OCICompartments()
        compartments = oci_compartments.listTenancy(filter={'name': 'Wizards'})
        #compartments = oci_compartments.listTenancy()
        if len(compartments) == 0:
            self.assertEqual(True, False)
        oci_resource_managers = OCIResourceManagers();
        for compartment in compartments:
            logger.info('Processing Compartment {0!s:s} - {1!s:s}'.format(compartment['name'], compartment['id']))
            stacks = oci_resource_managers.list(compartment_id=compartment['id']);
            for stack in oci_resource_managers.resource_managers_obj:
                logger.info('Processing Stack {0!s:s} - {1!s:s}'.format(stack.data['display_name'], stack.data['id']))
                jobs = stack.listJobs()
                logger.info('Jobs : {0!s:s}'.format(str(jobs)))

if __name__ == '__main__':
    unittest.main()
