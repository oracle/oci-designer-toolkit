# Release Notes

## Version 0.16.0
**Release Date**: 20th January 2021
### Features
1. Description now displayed as a right side panel allowing multi line entry (Enhancement Request #165)
2. Remove dialog associated with Save As Template because the Title & Description are now part of the main screen.
3. Add Preference to display the OCID for a Resource.
4. Simple GIT integration for saving Template / Terraform / Ansible files.
5. Export to Markdown to provide design documentation, description field (Enhancement Request #165) allows Markdown whilst each contains a Documentation field to provide resource specific information.

### Bug Fixes
1. Object Storage Bucket not displaying queried name (Issue #206)


## Version 0.15.0 
**Release Date**: 9th December 2020
### Features
1. Cut / Copy / Paste / Clone functionality added.
2. Updated Developer Guide on creating new Artefacts.
3. Artefact Skeleton generator for developer kick start.

### Bug Fixes
1. Adding an instance and an autonomous database in the same compartment overlays them on the canvas Issue #187
2. Resolve issue parsing TF Json.
3. Undefined variable in ansible export Issue: #189


## Version 0.14.1 
**Release Date**: 18th November 2020
### Bug Fixes
1. Reinstate Public / Private to Subnet description
2. Fix delete issue with IPSec
3. Fix delete issue with CPE


## Version 0.14.0 
**Release Date**: 18th November 2020
### Features
1. Add collapse / expand to container style artefacts Compartment / VCN / Subnet.
2. Implement updated, Oracle Standard, Look and Feel for diagram elements.
3. Add Preferences option to choose display label (Name / Resource / None) this will be displayed below the element on the SVG (Enhancement: #126).
4. Add OKIT specific "Definition" field to all artefacts to allow a free text definition of the artefact (Enhancement: #149).
5. Add preference to specify the type of tooltip to be displayed (Name / Definition / Summary) when hovering over elements in the diagram.
6. Add artefact element highlighting when the properties sheet is open. Moving the cursor over the properties sheet will highlight the associated artefact. 
7. Implement simple Auto Save functionality to save model every 60 seconds to local storage (Enhancement: #169).
8. Generate Title & Description for queried diagrams (Enhancement: #164).

### Bug Fixes
1. Fix issue where MySQL Databases could not be deleted.


## Version 0.13.0 
**Release Date**: 28th October 2020
### Features
1. Read Load Balancer Shapes from OCI / Cached OCI Values
2. Simple Command Line generator (visualiser/okit_generator) to convert OKIT.
3. Add MySQL Resource / Artefact.
4. Add Cost Estimation functionality for the designed model. This is based on the Oracle public APIs.
5. Add top-level Dockerfile and update Runtime build documentation. 
6. Enable Instance Principal Authentication for Query/Resource Manager.

### Bug Fixes
1. Build script on Windows fail (Issue: #135)
2. Instances were picking up Network Security Groups assigned to Autonomous Database during Terraform generation.
3. Decoding Instance Metadata cloud-init data fails to decode .(Issue: #55)

## Version 0.12.0 
**Release Date**: 7th October 2020
### Features
1. Enhanced feedback for multi region query.
2. Cache Regions
3. Cache Compartments for specific Profile.
4. Add functionality for Customer Premise Equipment.
5. IPSec Connections added.
6. Remote peering functionality added but current the user will still need to add the peering id.
7. Dynamic Routing Gateway simplified and connections created from the new IPSec Connection & Remote Peering Connection.
8. Database System/Autonomous name displayed on the canvas (ENH REQ: Issue: #120).
9. Experimental Import from Terraform JSON Format file.
10. Export to Resource Manage local GitHub directory.

### Bug Fixes
1. Fix Service Gateway only offers all services when drawn but then provisions Object Storage #107
2. Fix Service Gateway related route rules do not allow setting a Destination Service #109
3. Add clean functionality to the json object to remove null / undefined to resolve null element issue in Autonomous Databases.
4. Update Virtual Cloud Network and Subnet CIDR generation to check existing CIDRs. This resolves the duplicate CIDR issue.


## Version 0.11.0 
**Release Date**: 16th September 2020
### Features
1. Modify Multiple Select Options to Checkbox Group
2. Add Option to Query Dialog to allow the user to specify if the query will drill down into Sub-Compartments.
3. Modify start functionality to allow the user to specify a local directory where the user templates will be saved.
4. Add display/edit of the Model Title and Description to the web interface.

### Bug Fixes
1. Database System CPU Count causing error when generating Terraform (Issue: #98)
2. Network Security Groups, for a VCN, were not deleted when the VCN is deleted.
3. DRG not being displayed if it was not attached to a VCN following a query.


## Version 0.10.2 
**Release Date**: 27th August 2020
### Bug Fixes
1. Resolve issue where deleting an artefact would cause an addition OKE cluster to be created if one exists on the canvas. In addition deleting OKE caused it to be removed from the model but not the view. 


## Version 0.10.1 
**Release Date**: 27th August 2020
### Bug Fixes
1. Querying occasionally hit a condition where the SVG rectangle does not exist before attempting to get the bounding client information (Issue: #86) 


## Version 0.10.0 
**Release Date**: 26th August 2020
### Features
1. Modify the Hamburger menu to replace the mouseover events for menu display to mouse click events.
2. Add OKE Cluster functionality. Corrently works in a similar way to the advanced console create (OKIT-13).
3. Add count field to instance to allow generation of X duplicate version of an instance. Save time and space creating duplicates.
4. Add ability to specify Subnet for Autonomous Database (Issue: #76 & Issue: #81).
5. Add OKE example fragment.

### Bug Fixes
1. Add test for existing of image_id for edge cases when it is missing from query (Issue: #79).
2. Querying of Dynamic Routing Gateway occasionally cause console error (Issue: #80).
3. Internet Gateways could only be created on the first subnet in a vcn (Issue: #71).


## Version 0.9.2 
**Release Date**: 7th August 2020
### Bug Fixes
1. Unable to drop gateways on second or subsequent VCNs (Issue #73).


## Version 0.9.1 
**Release Date**: 6th August 2020
### Bug Fixes
1. Config file warning being displayed when only [DEFAULT] section defined (OKIT-110).


## Version 0.9.0 
**Release Date**: 5th August 2020
### Features
1. Split Designer View functionality from OKIT Model (OKIT-89).
2. Update Json associated with the Fragments to conform to new structure and remove non Reference Architecture templates because these are fragments. (OKIT-101).
3. Check oci config file to identify if the key file exists in the container and if not display error icon with associated click / alert message (OKIT-48 / OKIT-96).
4. Add preferences option (Hide Attached Artefacts) to indicate if Route Tables / Security List should be displayed as part of the Virtual Cloud Networks as well as an attachment.
5. Hide Service CIDR when Service Gateway in Route Rule is selected.

### Bug Fixes
1. Resolve issue with the "description" for Network Security Groups which was being incorrectly rendered in the generated Terraform.
2. Attached Route Tables / Security List property edits were lost. (OKIT-70).
3. Resolve issue with the "compartment_id" for Compartment which was being incorrectly rendered in the generated Terraform.
4. During query AD specific Subnets return Availability Domain as string not integer value, this is now converted (OKIT-105).
5. Deleting Defined Tags did not remove them from the model (OKIT-106).
6. Instance OS & Version information not retrieved during Query (OKIT-108).
7. DRG Ansible template contains '=' not ':' (GitHub Issue #61).
8. Quotes added to security Ingress / Egress rules (GitHub Issue #65).


## Version 0.8.0 
**Release Date**: 15th July 2020
### Features
1. Add Explorer / Tree View for the Artefacts in the diagram (OKIT-90).
2. When Creating Route Table / Security List for VCN modify the Default versions for the first Route Table / Security List defined.
3. HA Web Application Reference Architecture Template.
4. Replace Preferences Menu Option with side panel. 

### Bug Fixes
1. Resolve issues where, occasionally, the Open/Load function would not reopen a file.
2. Modify Vagrant Box Url to the new location. (Issue: #37)
3. Clean Hub & Spoke Template
4. Resolve pem key privilege issues.


## Version 0.7.0 
**Release Date**: 24th June 2020
### Features
1. Windows PowerShell Docker Helper Scripts.
2. Add setting for last selected Region and Compartment for Query and Resource Manager Export.
3. Modify Resource Manager dialog to close when the stack has been created and display progress bar during creation.
4. Specify stack name during export to Resource Manager
5. Update existing Resource Manager Stacks
6. When Creating Security List / Route Table modify the Default for the Security List / Route Table rather than create.
7. First implementation of simple json validation and display of results. This can be manually executed or will be automatically execute during export to Terraform, Ansible or Resource Manager and only when successful will this be allowed.
8. Hub & Spoke Network Topology Reference Architecture.
9. Enable Bare Metal Shapes.

### Bug Fixes
1. Service Gateway with null route_table_id will not generate Terraform / Ansible / RM. Route table values can not be assigned within the GUI.
2. Dynamic Routing Gateway assigning the VCN Id to Compartment Id (OKIT-73).
3. Defined Tags not generating correctly for Terraform.
4. Terraform being generated with invalid characters (OKIT-84).


## Version 0.6.0 
**Release Date**: 3rd June 2020
### Features
1. Optional generation of variable file for Ansible and Terraform, defaults:
   1. Terraform : True
   2. Ansible : True
2. Resource Manager no longer uses variable file for anything other than connection information.
3. Switch to new Oracle Icons as defined in https://docs.cloud.oracle.com/en-us/iaas/Content/API/Concepts/sdkconfig.htm.
4. Add Config Profile selection to the Query Popup so we can specify alternative tenancy information.
5. Add Profile / Region / Compartment selection to the Resource Manager export rather than using DEFAULT profile values.
6. Add Plan / Apply toggle to Resource Manager export.
7. Move DRG to VCN Parent rather than Compartment
8. Check for Update
9. Highlight selected artefact (Toggles on/off).
10. Database Systems

### Bug Fixes
1. Palette did not scroll
2. Link to OCI Console should be data driven #20 
3. 100 variable limit with Resource Manager causes upload failure (Issue #09)
4. Add Tenancy root to selectable list of compartments (Issue: #21)
5. Generation of terraform with regional subnet throws error for missing availability domain. (Issue: #22).
6. Missing logs (default log location now /okit/log/okit.log in container).
7. Export to Resource Manager:
    1. Error message modified so that it does not always say the compartment does not exist when failing (OKIT-67).
    2. Compartment Name is not checked for uniqueness (OKIT-5).
    3. Error planning job with no Tags (OKIT-45).


## Version 0.5.1 
**Release Date**: 18th May 2020
### Features
1. Consolidate vangrant and docker files below container directory.
2. Remove requirement to run bash scripts to build docker container
3. Document pure docker commands.

### Bug Fixes



## Version 0.5.0 
**Release Date**: 13th May 2020
### Features
1. Querying Overlay
2. Extend Block Storage Properties
3. Default OCI_CONFIG_DIR variable to ~/.oci

### Bug Fixes
1. Update User Guide and make examples platform independent 



## Version 0.4.1 
**Release Date**: 24th April 2020
### Features
1. Slide Out Menu

### Bug Fixes
1. When querying Instances missing user_data would cause an exception to be thrown.
2. Route Table Route Rule endpoint map did not include 'drg' which caused and exception to be raised when querying.



## Version 0.4.0 
**Release Date**: 22nd April 2020
### Features
1. Extended Instance 
    1. VNIC Support allowing full specification of vnics / secondary vnics (with the exception of private IP).
    2. Network Security Groups
    3. Multiple VNICs for same Subnet
2. Network Security Groups
3. Extend File Storage System
    1. Min / Max Size
    2. Anonymous GID/UID
    3. Identity Squash
    4. Privileged Source Port
    5. Network Security Groups
4. Modified Look
    1. Tweaked Colours
    2. Remove Curved Corners on Artifacts
    3. Centralise Load Balancer & Instance Icons

### Bug Fixes
1. Discovery conflict between compartment and subnet attachment. Instance not in the same compartment as there primary vnic were drawn in the compartment of their primary vnic not the correct one.
2. JSON: network_entity_id value is empty in route_tables.route_rules



## Version 0.3.0 
**Release Date**: 1st April 2020
### Features
1. Canvas Grid is now optional.
2. Default expand Optional Parameters
3. Export to image (jpeg & png)
4. Display OKIT Version in footer
5. Fully Supported Artifacts
    1. Virtual Cloud Networks
    2. Subnets
    3. Security Lists
6. Improved Support for
    1. Instance
    2. Load Balancer
7. Cleaner Look and Feel
    1. Change colors to more closely match OCI Console
    2. Palette, Properties and JSON View panels now slide of the screen to give more visual real estate.
    3. Setting panel replaced by Preferences Dialog accessible from menu.
        1. Canvas Grid On/Off
        2. Default Route Table for VCN
        3. Default Security List for VCN
        4. Timestamp Filenames (Adds timestamp to save files)
        5. Auto Expand "Advanced Properties" indicates that the advanced properties will be displayed by default in properties panel.
        6. Profile to be used within the oci config when accessing OCI
8. Change JSON Structure to more closely represent that returned by querying OCI.
9. Reference Architecture Templates
    1. CockroachDB Cluster
### Bug Fixes
1. Canvas Scrollbar becomes hidden when the region tabs are displayed
2. Canvas draw fails when JSON contains unattached DRG
3. Public IP Assigned to Instance in private Subnet



## Version 0.2.0 
**Release Date**: 6th March 2020
### Features
1. Save As Template
2. Sub Compartments
3. Freeform Tags
4. Defined Tags - Assumes the user types the names correctly.
5. Fully Supported Artifacts
    1. Compartments
    2. Route Table
    3. Internet Gateways
    4. NAT Gateways
    5. Local Peering Gateways
### Bug Fixes
1. Terraform creation failed when the subnet was not attached to a Route Table.
2. Unattached DRGs caused the display of the JSON to fail.



## Version 0.1.0
**Release Date**: 6th February 2020

Initial internal release providing a number of basic functionality with required properties. This release allows for the 
drawing of infrastructure, generation of Ansible & Terraform for the implemented artifacts and the querying of multiple
regions to generate diagrams representing implemented infrastructure.
### Features
1. Infrastructure Creation Web Interface
    1. Compartment
    2. Virtual Cloud Networks
    3. Subnets
    4. Instances
    5. Load Balancers
    6. Internet Gateways
    7. NAT Gateways
    8. Local Peering Gateways
    9. Block Storage
    10. Object Storage
    11. File Storage
    12. Autonomous Database
    13. Service Gateway
2. Ansible Script Generation
3. Terraform Script Generation
4. Export to Resource Manager
5. Multi Regional Query of implemented Artifacts
6. File (Diagram) Management
    1. New
    2. Save
    3. Load
