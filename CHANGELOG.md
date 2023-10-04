# Release Notes


## Version 0.55.0
**Release Date**: 4th October 2023
### Features
1. Extend PCA Query to lookup Images in all Tenancy Compartments.
2. Remove unsupported DNS Zone icon.
3. Prep for C3 Release.
### Bug Fixes
1. Resolve issue where availability domain was not passed as integer to the subnet.jinja2


## Version 0.54.5
**Release Date**: 22nd September 2023
### Features
### Bug Fixes
1. Update Linux Native install instructions to specify OCI Config information must exist below roots home directory.


## Version 0.54.4
**Release Date**: 31st August 2023
### Features
### Bug Fixes
1. Fix issue where banner dropdown failing to load on hard refresh.


## Version 0.54.3
**Release Date**: 31st August 2023
### Features
### Bug Fixes
1. Modify load calls for OkitOciData to use Promise and async.


## Version 0.54.2
**Release Date**: 29th August 2023
### Features
### Bug Fixes
1. Fix issue where Export To Resource Manager was not using Session based configuration.


## Version 0.54.1
**Release Date**: 25th August 2023
### Features
### Bug Fixes
1. Fix issue where missing config caused server to return error for subscription check and switch from OCI to PCA. Also missing config caused query to fail.


## Version 0.54.0
**Release Date**: 23rd August 2023
### Features
1. Rebranding for PCA interface.
2. Simple Session based config for OCI. Allow the user to specify in the browser the connection config information. This should only be used with HTTPS.
### Bug Fixes


## Version 0.53.0
**Release Date**: 12th July 2023
### Features
1. Add platform to okit_query.py
2. Add Auto Scaling for OCI.
3. Add Instance Pool & Instance Configuration to PCA
### Bug Fixes
1. Remove agent_config from TF generated for PCA-X9 which does not support this.
2. Fix validation error message text associated with DRG Distribution Statements.


## Version 0.52.0
**Release Date**: 21st June 2023
### Features
1. Add Integration Instance Resource
2. Add Instance Configuration Resource for OCI
3. Add Instance Pools Resource for OCI
### Bug Fixes
1. Fix incorrect Markdown generation when markdown view displayed
2. Resolve issue where PCA Loadbalancers were not linking all backend instances.
3. Resolve miss identified image source type during PCA query.


## Version 0.51.0
**Release Date**: 31st May 2023
### Features
1. Modify PCA Query Region Select to single region
2. Update top Level Dockerfile to use OL8 and Python 3.8 and change python3 alternative.
3. Remove 8-slim container directory because default is now OL8
4. Modify OKIT BUI Endpoints th have one specific to OCI and one specific to PCA.
5. Add support for Load Balancer resource for PCA.
### Bug Fixes


## Version 0.50.1
**Release Date**: 12th May 2023
### Features
### Bug Fixes
1. Remove reference to oci.data_connectivity which is no longer part of the OCI API.


## Version 0.50.0
**Release Date**: 10th May 2023
### Features
1. Remove Terraform version restriction associated with PCA deployments.
2. Automatically display documentation when opening a template.
3. Update CNE Template to add Proxy information.
4. Support DGR attachment for PCA (Issue #581)
### Bug Fixes


## Version 0.49.0
**Release Date**: 19th April 2023
### Features
1. Add Pod Shapes and Enhanced Option to OKE Cluster / Node Pool (This update requires the later oci python API and existing installation will need to be updated)
2. Update PCA-XA Prometheus TEMPLATE WITH DOCUMENTATION.
### Bug Fixes
1. Add OKE Cluster Pricing / BoM functionality for Basic Clusters (ISSUE #579)


## Version 0.48.0
**Release Date**: 29th March 2023
### Features
1. Prometheus / Node Exporter Monitoring Template
2. Update Oracle CNE Simple Template to use the olcne quick install.
### Bug Fixes
1. Remove vnics 'instance_id' entry from queried Instances


## Version 0.47.0
**Release Date**: 8th March 2023
### Features
1. Add Heatwave functionality to MySQL DB System (Issue: #268)
2. Allow spcification of Deletion and Backup Policies for MySQL DB Systems.
3. Allow creation of VCN With a variable for CIDR Block (Issue: #554)
4. Add Basic Data Science Project / Notebook Session (Issue: #567)
5. Add setting to show state of queried resources by changing colour of resource boundary
### Bug Fixes


## Version 0.46.1
**Release Date**: 21st February 2023
### Features
1. Add OKE Specific Images
### Bug Fixes
1. Resolve issue where results for reference selects were no sorted correctly and the call would cause a JavaScript error.
2. Resolve issue where query was not returning block volume attachments correctly for instance.


## Version 0.46.0
**Release Date**: 15th February 2023
### Features
1. Update OKE Cluster functionality to be a container styles resource.
2. Add Node Pool as a separate resource.
3. Allow OKE Cluster to be dropped on compartment.
4. Update Cache to include Node Pool Options.
### Bug Fixes


## Version 0.45.0
**Release Date**: 25th January 2023
### Features
1. Update Network Firewall to use fixed Terraform Resource.
2. Add Vault Secret Resource.
3. Modify Build process to use resourses.txt.
4. Display if public IP assigned to instance in tabular view.
5. Sum Instance Memory and display in title on tabular view.
### Bug Fixes
1. Clear saved cache file when refreshing cache.


## Version 0.44.0
**Release Date**: 30th November 2022
### Features
1. Update Linux Install Instructions.
2. Remove deprecated Terraform 'template_file' usage this will require a Cache refresh and potentially resetting the Block Volume Backup Policy.
### Bug Fixes
1. Issue: #556 Variables are not reflected in stack export (Write missing Variables to Resource Manager stack)
2. Resolve auto generation of incorrect dns labels
3. Issue: #561 OKE and Mysql always created in okit deployment compartment (use compartment_id not compartment_ocid)
4. Issue: #557 Creating mysql cloud service with HA creates Standalone mysql database #557 (Set HA Flag)
5. Remove display of VCN Default Id connections when mouse over VCN.


## Version 0.43.0
**Release Date**: 9th November 2022
### Features
1. Exadata Cloud Infrastructure
2. Allow Load Balancer to be dropped on Compartment.
3. Allow Network Load Balancer to be dropped on Compartment.
4. Switch Service Gateway Properties to new style.
5. Display Tags in Tabular View
6. Modify default view to not display connections.
    1. Add property to resource that allows the user to specify if connection should be drawn for this resource.
    2. Add setting to allow the user to display all connections.
    3. Add setting to allow the user to display connections on Mouse Over.
### Bug Fixes
1. Fix NSG Rule local reference in generated Terraform.


## Version 0.42.0
**Release Date**: 19th October 2022
### Features
1. Autonomous JSON Database.
2. Autonomous APEX Database.
3. Update OCI Link to new common cloud url.
4. Add Markdown View
5. Increase Resource display width when name display is selected.
6. New PCA-X9 Template for HA VIP Configuration
### Bug Fixes
1. Issue #540 : Check does not verify DNS-Label 
2. Convert VCN CIDR_BLOCKS to string in MArkdown export.
3. Add correct DBHome & Database information to Database System following query.


## Version 0.41.0
**Release Date**: 28th September 2022
### Features
1. Add import button for Instance SSH Key.
2. Add Network Firewall Resource (Currently no Terraform Generation).
3. Add Variables View allowing specification of Terraform Variables that can be used within the design.
4. Update Cost Estimator to include Network Firewall.
### Bug Fixes
1. Resolve issue where Properties sheets were not unlocked following "Enable R/W"


## Version 0.40.0
**Release Date**: 7th September 2022
### Features
1. Streamline / refactor backend javascript / css file identification and load functionality
2. Update Properties sheet for 
    1. MySQL Database and allow drop on Compartment.
    2. Database Systems.
    3. Autonomous Database.
3. Update Discovery process to execute gets for NoSQL Tables and Indexes.
4. Extend NoSQL Query to display DDL & Indexes in properties.
5. Drop ExaData from Database System Shapes because this is no longer the preferred implementation.
6. Implement Version 2 of Cost Estimation / BoM ([Matches new online estimation tool](https://www.oracle.com/uk/cloud/costestimator.html))
    1. Analytics Instance
    1. Autonomous Database
    1. Block Storage Volume
    1. Database System
    1. File System (Properties allow for usage Estimates)
    1. Instance
    1. Load Balancer
    1. MySQL Database System
    1. NoSQL Database
    1. Object Storage Bucket (Properties allow for usage Estimates)
    1. Visual Builder Instance
7. GitHub Enhancement #537 : Problem with object with subnet in different compartment (resolved for Database System)
### Bug Fixes
1. In markdown generation switch to using documentation not definition
2. Move logging debug message in generate "GET" that accesses unknown element.
3. Resolve Config validation issue where configs with only DEFAULT reported an error.
4. Add missing Route Rule information when querying PCA.
5. Test if Health Checker data specified when exporting to Markdown.


## Version 0.39.0
**Release Date**: 27th July 2022
### Features
1. Extend PCA Resource Query to include:
    1. Groups
    2. Policies
    3. Users
2. Add __namespace__ field to config to allow specification of the Object Storage namespace for PCA because the client.get_namespace is not implemented.
3. Extend Tablular View to display additional information
    1. Instance
        1. Shape
        2. Memory
        3. OCPUs
    2. Groups
        1. Users
        2. User Count
4. New Properties sheet.
    1. Analytics Instance
5. New Resource
    1. NoSQL Table / Index __(Creation only)__
6. Remove Python module version specification and allow use of latest.
### Bug Fixes
1. Fix issue where PCA queried Compartment was not displayed as the top level compartment
2. Resolve issues where documentation information was not be reloaded for resources.


## Version 0.38.0
**Release Date**: 6th July 2022
### Features
1. Disable config selection for invalid entries.
2. Remove current Cost Estimator because it is using the old, deprecated costing interface.
3. Update Properties Sheet
    1. Internet Gateway
    2. NAT Gateway
    3. Local Peering Gateway
    4. Bastion
    5. DRG Attachment
### Bug Fixes
1. Fix issue where Instance was set to public IP on private network and private on public network.
2. Fix issue where Subnets can not be deleted if an instance exists in another subnet.
3. Resolve issue where Server Type was still being added to Terraform for DHCP Options which specify Search Domain as the type.
4. Add filtering of PCA Queries data for all types of resource.


## Version 0.37.0
**Release Date**: 25th May 2022
### Features
1. Display Alert Icon if there is an issue with the OCI Config file and it is identified as not valid.
2. Add conversion routine to change old style File Storage Systems to new 2 part Mount Target and File System.
3. New Resources
    1. Data Integration Workspace.
    2. KMS Vault.
    3. KMS Key.
    4. Visual Builder Instance
4. Updated Resources
    1. File System (Allow KMS Key Selection)
    2. Block Volume (Allow KMS Key Selection)
    3. Object Storage Bucket (Allow KMS Key Selection)
    4. Load Balancer - Allow specification of multiple Backend Sets and Listeners.
5. Update Discovery Code to include additional resources requires the python module to be upgraded to the latest release.
6. Remove Object Storage from PCA flagged OKIT designs.
7. Update Terraform Generation to create multiple files based on OCI groupings. (Issue: #308 - Terraform export should use multiple files)
8. Update Copyright.
9. Update DNS Label when vcn / subnet name changes.
10. Add generic association Highlighting and connection drawing.
11. Update resource view to allow selection of resources to display.
### Bug Fixes
1. Fix resource_name generation based on display_name to correctly Title Case.
2. Fix issue where route rules were specifying DRG Attachment Id not DRG Id.
3. Fix issue with Route Rule specifying Service Gateway not displaying the correct destination on query.
4. Fix Fast Discovery compartment chunking algorithm to generate correct length queries.
5. Resolve issue where Security List Egress rules properties were writing to source field not destination field.


## Version 0.36.0
**Release Date**: 4th May 2022
### Features
1. New Look and Feel for Validation Panel
2. New Resources
    1. Network Load Balancer.
    2. Oracle Digital Assistant (ODA Instance)
3. New Properties layout for Object Storage Bucket implementing additional options for Auto Tiering, versioning and object events.
### Bug Fixes
1. Resolve issues where match_criteria was not being tested as defined in jinja2 template for DRG Distributions.
2. Resolve issue where invalid local variable names were generated within the load balancer terraform.
3. Remove spurious quotes from route rule destination.
4. For PCA remove shape_config from instance terraform.


## Version 0.35.0
**Release Date**: 13th April 2022
### Features
1. Add Subnet validation for duplicate DNS Label.
2. New Properties panels:
    1. Instance
3. Extend Volume Attachment information for Instances
4. Sort Local / Git / Reference Architecture Side panels by filename.
5. Add generic render function for Terraform Generation.
6. Update Terraform Jinja2 templates to work with new generation functionality.
7. Display Palette once file is opened.
### Bug Fixes
1. Resolve issue when querying single compartment for PCA not returning any compartments.
2. Resolve issue where duplicate Display Names were still being reported as an error.
3. Add missing "Stateless" flag to Security list Ingress/Egress rule generation.
4. Add test to see if import_drg_route_distribution_id exists during Terraform generation.
5. Fix issue where network entity in route rule was not filtered by vcn id
6. Resolve missing Icon in Relationship view
7. Update Price Calculator to check if resource in OKIT model before attempting to access it (Issue: #519)
8. Fixed Unable to export to Terraform (Issue: #520)


## Version 0.34.0
**Release Date**: 23rd March 2022
### Features
1. New Properties Sheet format added for 
    1. Block Storage Volume
2. Add Option to Generate Terraform on Save
3. Store Save Filename within model to allow for it to be populated during Save.
4. Extend Validation to check for Cyclic Route Table/Rules references with DRG Attachments.
5. Add Import from Terraform State files.
6. Add Import from Resource Manager Stack.
7. Update Route Rules to all Service Gateway Rule to specify either All or Object Storage.
### Bug Fixes
1. Move clone functionality to the top level class to resolve duplicate resource_name issue.
2. Resolve issue where vcn cidr_blocks were being converted from an array to a string.
3. Resolve Delete issue which caused the subnet.js to fail to load on FireFox.
4. Resolve issue where exporting to Resource Manager never retrieved the Regions / Compartments
5. Fix issue where Load Balancers with NSGs were generating invalid Terraform
6. Resolve issue where Region List was being returned as undefined.
7. Fix issues where DRG Attachment Id was used for Route Table not DRG Id


## Version 0.33.0
**Release Date**: 2nd March 2022
### Features
1. BOAT Authentication added (Requires tenancy_override in config file to indicate the actual tenancy whilst tenancy indicates the authentication tenancy)
2. New Properties Sheet format added for 
    1. Compartment
    2. Dhcp Option
    3. Route Table
    4. Security list
    5. Subnet
    6. VCN
3. Update Vagrant build functionality to clone Git Repository during build rather than copy file information and add a run-server.sh script that attempts to pull latest update before running the server.
4. Add Query Functionality for PCA-X9
5. Add URL arguments to lock the diagram type to either PCA-X9 or OCI
    1. PCA-X9: pca=true 
    2. OCI: oci=true 
### Bug Fixes
1. Fix error in query size when tenancy contains a large number of compartments.


## Version 0.32.1
**Release Date**: 17th February 2022
### Features
### Bug Fixes
1. Add missing home_region provider to the Terraform generated for Resource Manager.


## Version 0.32.0
**Release Date**: 9th February 2022
### Features
1. Add Target specific resource check to validation.
2. Update Mount Target properties to new layout.
3. Change default for Block Volume attachment to paravirualised.
4. Add refresh toolbar icon.
### Bug Fixes
1. Fix issue where Custom image information is lost if the properties are reopened.
2. Hide Export to Resource Manager when PCA Selected.
3. Fix issue where queried Mount Targets were losing the exports when the properties were open.


## Version 0.31.1
**Release Date**: 26th December 2021
### Features
### Bug Fixes
1. Fix Standardised resource name issue when querying switching from using queried id, which is not alway present, to uuid.


## Version 0.31.0
**Release Date**: 19th January 2022
### Features
1. Add deployment target (platform) drop-down to specify where the design will be deployed. This modifies the palette icons available.
2. Restructure generated terraform files.
3. Add Save As Terraform to allow saving to the container local directory / local directory if OKIT is installed natively.
4. Update Installation guide to include information on alternatives to Docker.
5. Add Unique resource_name element to the model.
6. Force Plan only for RM Update.
7. Allow the user to select Custom Images for Instances. This assumes that the design will be deployed to the Tenancy/Region where the image exists.
### Bug Fixes
1. Test that instance has primary_vnic defined.
2. Resolve issue where queried compartments containing a route table with a rule pointing to a DRG were not displaying the rule correctly.
3. Fix issue where Read Only DRGs were not specifying the ocid as a local variable.
4. Fix display of spurious right side panel when clicking validation errors.
5. Convert file system availability domain name to number.


## Version 0.30.1
**Release Date**: 9th December 2021
### Features
1. Add Terraform view which will display the generated Terraform (First Release)
### Bug Fixes
1. Fix Standardised resource name issue when display_name contain non-alphanumeric characters.
2. Resolve query issue where querying db_homes caused a NoneType exception.


## Version 0.30.0
**Release Date**: 1st December 2021
### Features
1. Add DRG / DRG Attachments to Markdown
2. Add Mount Table / File Systems to Markdown
3. Add unique OKIT Model id to each OKIT design and add as a Freeform Tag.
4. Tag Resource Manager Stack with unique OKIT Model id.
### Bug Fixes
1. Resolve issue where DRGv2 were not showing it Route Rules.
2. Add Analytics Instance to the query discovery mapping class to include missing queries information.
3. Replace missing code to generate private network Analytics Instance.


## Version 0.29.0
**Release Date**: 10th November 2021
### Features
1. File Storage System split into Mount Target and File System to allow a Mount Target to export multiple File Systems.
2. Dynamic Routing Gateway extended to include to be a Compartment Resources and DRG Attachments used to connect to VCN.
3. DRG Extended to include Route Table and Distribution functionality.
4. Model Load functionality modified so that it checks if a Resources Compartment id exists in the model and if not assigns it to the root deployment compartment.
5. Save / Load functionality modified to Save to container directory and current Save/Load moved to Import/Export OKIT Json.
6. Highlight selected row in Tabular view.
7. Hide Profile Select within query when using Instance Principal.
### Bug Fixes
1. Query fixed so that when querying a tenancy all sub compartments are no longer assigned null compartment id and appear overlaid.
2. Fix issue when using Instance Principal where the url contained a space.


## Version 0.28.0
**Release Date**: 20th October 2021
### Features
1. User / Groups View added
    1. Allow the creation / definition of local Users
    2. Allow the creation / definition of OCI Groups
2. Bastion as a Service functionality added to main design canvas.
3. Update cache functionality to store based on Configuration & Region.
4. Add "OKIT Reference" Tag to all resources created via OKIT to allow for future expansion / reference.
### Bug Fixes
1. Add missing policy documentation to export to markdown.
2. Fix Save As Template to add .json if not specified.
3. Resolve issue where the default dhcp option would generate terraform with an empty search_domain_names if the server type was changed and then changed back.


## Version 0.27.1
**Release Date**: 1st October 2021
### Bug Fixes
1. Force rename of DhcpOptions.svg to DHCPOptions.svg. The master had not changed case originally to match development branch.
2. Include the User Defined Terraform in the Resource Manager zip. 
3. Resolve issue with File Storage System failing to display properties correctly.


## Version 0.27.0
**Release Date**: 29th September 2021
### Features
1. Convert left bar named tabs to simple icon tabs based on OCI console design.
    1. Palette : <img src="./okitweb/static/svg/palette.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
    2. Model Explorer : <img src="./okitweb/static/svg/explorer.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
    2. Templates : <img src="./okitweb/static/svg/templates.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
    2. GitHub : <img src="./okitweb/static/svg/git.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
2. Convert right bar named tabs to simple toolbar icons based on OCI console design.
    1. Preferences : <img src="./okitweb/static/svg/settings.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
    2. Validate : <img src="./okitweb/static/svg/validate.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
    2. Templates : <img src="./okitweb/static/svg/templates.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
    2. Properties : <img src="./okitweb/static/svg/properties.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
    2. Cost Estimate : <img src="./okitweb/static/svg/cost_estimate.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
    2. Documentation : <img src="./okitweb/static/svg/notes.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
    2. User Define Terraform : <img src="./okitweb/static/svg/terraform.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
    2. Global Tags : <img src="./okitweb/static/svg/tags.svg?sanitize=true" width="15" height="15" style="background-color: white"/>
3. Add the ability for the user to define custom Terraform code that will be included in the terraform zip file in a user_defined.tf file.
4. Add Global level Freeform/Defined Tags that will be added to all resources created by OKIT.

### Bug Fixes
1. GitHub Issue #459 : [UI] "DHCP option" icon missing.
2. Resolve issue where Read-Only was being ignored for DRGs.


## Version 0.26.0
**Release Date**: 8th September 2021
### Features
1. Temporarily deprecate Ansible export by making it command line flag driven (ansible=true)
2. Add Policy Resource to Palette and allow the user to drag them onto the canvas. It assumes that the user understands the policy statement syntax. All policies will be created within the users home region.

### Bug Fixes
1. GitHub Issue #440 : Cannot generate terraform when NSG have Rules.
2. Fix issue where DB System were always created in the root deployment compartment not specified sub-compartment.
3. GitHub Issue #447 : Unable to create Object Storage Bucket with OKIT


## Version 0.25.1
**Release Date**: 20th August 2021
### Bug Fixes
1. Add missing symbolic link to to level Dockerfile to resolve the failure to display Templates in the designer.


## Version 0.25.0
**Release Date**: 18th August 2021
### Features
1. Templates Moved from main menu to sidebar and now opened on a Double Click.
2. Pan and Zoom added to SVG display returning to 1:1 during redraw.
3. Display Git Directories as a side panel and allow for double click open.
4. Reorganise Reference Architecture Templates

### Bug Fixes
1. Fix query pagination issues where not all resources were being retrieved.
2. Remove uses of Terraform Data Resource oci_identity_tenancy
3. GitHub Issue #406: Sub-Menu options can't be selected in Chrome (Subtract scrollbar width)


## Version 0.24.5
**Release Date**: 19th July 2021
### Bug Fixes
1. Resolve issue where Shapes may be missing from query which caused query to fail silently.


## Version 0.24.4
**Release Date**: 15th July 2021
### Bug Fixes
1. Resolve issue with dropping NAT Gateways on canvas
2. Resolve issue with Dropping MySQL Database Systems on canvas
3. Resolve issue with dropping IPSec Connection on canvas


## Version 0.24.3
**Release Date**: 13th July 2021
### Bug Fixes
1. Resolve issue causing preference modification not to be saved.


## Version 0.24.2
**Release Date**: 9th July 2021
### Bug Fixes
1. Resolve issue with missing Instance shapes due to fail compatibility query.


## Version 0.24.1
**Release Date**: 8th July 2021
### Bug Fixes
1. Resolve issue stopping Compartments being dragged from the palette and dropped on the canvas


## Version 0.24.0
**Release Date**: 7th July 2021
### Features
1. User Template menu dynamically updated when design saved as a template.
2. Enable Read/Write menu item added to allow the user to switch a queried design to a writeable / deployable design.
3. Update favicon.
4. Add Double Click to resource Icon to Open/Close Properties.
5. Add Config Select to main toolbar to allow selection of the connection where the dropdown data will be selected from. In addition accessible Regions for the Connection profile will be selected.
6. Add Region select to main toolbar.
7. Cache Dropdown data & Region data per connection profile within the browsers local storage to improve performance.
8. Add clear Dropdown Data cache to force refresh of cached data.
9. Add Target selector to restrict palette based on chosen deployment target. This is early work preparing for the PCA release / Terraform cli.
10. Add cd3=true URL parameter to enable import of CD3 spreadsheet.

### Bug Fixes
1. Correctly generate DHCP Options for VCN Default generated resource.
2. Resolve issue with Private Endpoint Label not being specified for ADB.
3. Fix FLASK_APP definition for Vagrant flask.service.


## Version 0.23.1
**Release Date**: 21st June 2021
### Bug Fixes
1. Fix issue with Terraform generation of Loadbalancers where the subnet ids were not being added to the resource.


## Version 0.23.0
**Release Date**: 16th June 2021
### Features
1. Json View to allow user to see model.
2. Updated Explorer View Side Panel.
3. Analytics Instance Resource.
4. Queried components are marked as Read Only and will generate Terraform Data commands rather than Resource statements.
5. Sort Tabular View Tabs alphabetically.
6. View select list added to the header.
7. Mark top level Compartment on New Diagram as "Deployment Compartment" for new designs to indicate that it will not be created but just represents the root compartment where the resources will be created.

### Bug Fixes
1. GitHub Issue #316 : OKIT attempts to add defined_tags to oci_core_network_security_group_security_rule
2. Remove spurious variables.
3. Fix invalid local DHCP variable name when not using default.
4. Resolve space in output variable name.


## Version 0.22.1
**Release Date**: 26th May 2021
### Bug Fixes
1. Resolve display issue with new icon when running FireFox



## Version 0.22.0
**Release Date**: 26th May 2021
### Features
1. Add DHCP Options Resource.
2. Update OCI Instance installation to include additional IDCS Steps
3. Add Relationship View to show a force layout of connections between OCI resources.
4. Move Resource Documentation to Notes tab on the property sheet rather than inline property allowing larger editor.
5. Switch VCN to use multiple CIDR Blocks rather than just the single CIDR Block.
6. Allow users to specify which Route Table / Security List / Dhcp Option is the default for a VCN.
7. Update Icons to latest versions.
8. Upgrade JQuery to 3.6.0

### Bug Fixes
1. Resolve issue where region was not being passed to Instance Principal queries.
2. GitHub Issue #315: Query for sub-compartments adds "/" to name 
3. Resolve issue where fast discovery was not returning DbHome & DbNode for ExaCC.
4. Fix issue with display when Subnet has a Security list that is no longer in the model.



## Version 0.21.0
**Release Date**: 5th May 2021
### Features
1. Ability to query / Display ExaCC configuration, this is a query only feature allowing for display and generation of documentation.

### Bug Fixes
1. GitHub Issue #304 : documentation/Installation.md contains reference to dev branches.
2. GitHub Issue #269 : Internal Server Error.
3. Instance primary vnic hostname_label access key error.
4. Update Fast Discovery to retrieve detailed MySqlDatabase information.


## Version 0.20.0
**Release Date**: 14th April 2021
### Features
1. Add Command line svg generation based on the "**.okit**" file format. The [okit-cli](documentation/okit-cli.md) will allow the user to convert an OKIT "**.json**" file to the upcomming "**.okit**" file and subsequently generated an .svg file.
2. Change default Query to normal query rather than fast discovery and allow user to select "Fast Discovery" from the Query dialog when in developer mode.

### Bug Fixes
1. Add code to check that the required elements are returned from a Fast Discovery query before attempting to use them.


## Version 0.19.2
**Release Date**: 26th March 2021
### Bug Fixes
1. Fix error caused when Node Pool is missing from the fast discovery.


## Version 0.19.1
**Release Date**: 24th March 2021
### Bug Fixes
1. Fix Config directory Mount Issue when building from GitHub

## Version 0.19.0
**Release Date**: 24th March 2021
### Features
1. Add OCI console Authentication when running OKIT server within an OCI instance. This still requires Instance Principal but secures the OKIT designer pages.
2. Enhancement request: Show block volume attachments to instances in the tabular view (Issue #265)
3. Add Freeform Tag "OKITStack" to OKIT Generated Resource Manager Stacks

### Bug Fixes
1. Description of SecList rules in OKIT is not transferred to the actual deployment in the Resource Mgr (Issue #272).
2. Cost estimation shows "Updated" and "OKIT version" as first 2 lines (Issue #270).
3. Validation issue: should not be able to choose Logical Volume Management when provisioning a RAC db in DBCS (Issue #271).
4. Add validation for IPSec DRG / CPE & Remote Peering DRG


## Version 0.18.0
**Release Date**: 3rd March 2021
### Features
1. Add OCPU & Memory option when selecting Flex Instance (OKIT-133).
2. Change default shape for Instances to Flex.
3. Add Min/Max Bandwidth for flexible Loadbalancer shape.
4. Default Loadbalancer to flexible.
5. Test for empty Network Entity Id on Route Rule.
6. Fast Discovery. Use the OCI query api functionality instead of list based interface for retrieving OCI Resources when executing Query. The classic query is still available if the default fast discovery is turned off within the preferences.
7. Add validation to LPG to check if the connected route table has valid rules.
8. Implement "Information" messages on validation.

### Bug Fixes
1. Add IP Validation to CPE.
2. Add static route validation to IPSec Connection.
3. Correct accidental element change on MySqlDatabaseSystem self.v -> self.port.
4. Terraform DB System template was not building Fault Domain list correctly.


## Version 0.17.0
**Release Date**: 10th February 2021
### Features
1. Simple Tabular view added to display the required properties for resources in a table format (OKIT-124).
2. Allow Subnets to be place in compartments that do not contain the associated Virtual Cloud Network (OKIT-128).
3. Update Copyright

### Bug Fixes
1. Compartment name is now displayed correctly for queried compartment.


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
