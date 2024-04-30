# OCI Designer Toolkit Resource (Artefact) Development
The following guide will take you through a step by step process for developing a new Palette Resource / Artefact for use 
within OKIT. To implement the new Resource / Artefact a number of new Artefact specific files will need to created whilst 
integration will require modification of core Javascript files.

## Table of Contents

1. [Naming Convention](#naming-convention)
2. [Resource (Artefact) Files](#artefact-resource-files)
3. [New Files](#new-files)
    1. [Frontend Files](#frontend-files)
    2. [Backend Files](#backend-files)
4. [Updated Files](#updated-files)
    1. [Frontend Files](#frontend-files)
    2. [Backend Files](#backend-files)
5. [Running Docker for Development](#running-docker-for-development)

## Naming Convention
All files associated with an artifact will have file names based on the artifact. If we take the ***Block Storage Volume***
artifact as an example it can be seen, from above, that all files are named in the same fashion with the exception of the
palette SVG file. 

All files must be named as per artifact name with the spaces replaced by underscores and converted to lowercase. The exception 
to this is the palette SVG where title case should be used instead of lower case. The reason for this is that the palette
file name will be manipulated (removing the underscore) and used to dynamically reference all Javascript function names.  

## Resource (Artefact) Files
To add an Artefact to OKIT you will need to create number of files that provide the core functionality associated with the 
Artefact. In addition to fully integrated the new Artefact into the BUI a number of the core JavaScript / Python scripts will
need to be updated. The remainder of this document will describe the functionality / files that must be implemented. 

For the worked example we will create the ***Block Storage Volume*** Resource (Artefact) and thus describe how the files
are generated and then subsequently modified.

## New Files
To facilitate and ease the initial development of new Artefacts OKIT provides a Skeleton Code generator that will create
skeleton files for the new Artefacts. The developer can then simply updated these with the Artefact Specific functionality.

### Frontend Files
- [Artefact Model JavaScript](#artefact-model-javascript)
- [Artefact View JavaScript](#artefact-view-javascript)
- [Palette SVG](#palette-svg)
- [Properties HTML](#properties-html)

### Backend Files
- [Artefact Python Facade](#artefact-python-facade)
- [Terraform Jinja2 Template](#terraform-jinja2-template)

### Generating Skeletons
```bash
cd skeletons
python3 okitCodeSkeletonGenerator.py --name "<New Artefact Name>"
```
#### Worked Example
```bash
python3 okitCodeSkeletonGenerator.py --name "Block Storage Volume"
INFO: Writing File: ../okitweb/static/okit/model/js/artefacts/block_storage_volume.js
INFO: Writing File: ../okitweb/static/okit/view/designer/js/artefacts/block_storage_volume.js
INFO: Writing File: ../okitweb/static/okit/palette/svg/Block_Storage_Volume.svg
INFO: Writing File: ../okitweb/templates/okit/propertysheets/block_storage_volume.html
INFO: Writing File: ../okitweb/templates/okit/valueproposition/block_storage_volume.html
INFO: Writing File: ../visualiser/facade/ociBlockStorageVolume.py
```

### Artefact Model JavaScript
#### Generated Skeleton
Following generation a model file will be created in the **okitweb/static/okit/model/js/artefacts** directory as shown below.
```javascript
/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Block Storage Volume Javascript');

/*
** Define Block Storage Volume Class
*/
class BlockStorageVolume extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.block_storage_volumes.length + 1);
        this.compartment_id = data.parent_id;
        /*
        ** TODO: Add Resource / Artefact specific parameters and default
        */
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Clone Functionality
    */
    clone() {
        return new BlockStorageVolume(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'bsv';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Block Storage Volume';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newBlockStorageVolume = function(data) {
    this.getBlockStorageVolumes().push(new BlockStorageVolume(data, this));
    return this.getBlockStorageVolumes()[this.getBlockStorageVolumes().length - 1];
}
OkitJson.prototype.getBlockStorageVolumes = function() {
    if (!this.block_storage_volumes) {
        this.block_storage_volumes = [];
    }
    return this.block_storage_volumes;
}
OkitJson.prototype.getBlockStorageVolume = function(id='') {
    for (let artefact of this.getBlockStorageVolumes()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteBlockStorageVolume = function(id) {
    for (let i = 0; i < this.block_storage_volumes.length; i++) {
        if (this.block_storage_volumes[i].id === id) {
            this.block_storage_volumes[i].delete();
            this.block_storage_volumes.splice(i, 1);
            break;
        }
    }
}
```
#### Skeleton Modification
At this point the skeleton is incomplete and requires that Artefact specific elements and functions are added. For our 
worked example we will need add and initialise the following fields:

- availability_domain = '1';
- size_in_gbs = 1024;
- backup_policy = 'bronze';
- vpus_per_gb = '10';

In addition if the object was created from a query we know that the returned availability_domain will be the full name 
and it will need to be converted to a single digit.

Because the **Block Storage Volume** can be attached to an Instance we will need to provide additional functional to remove
any reference to it on delete. This is done by adding the deleteChildren() function that will be call automatically on delete.

Following the update the model JavaScript will be modified as below:
```javascript
/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Block Storage Volume Javascript');

/*
** Define Block Storage Volume Class
*/
class BlockStorageVolume extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.block_storage_volumes.length + 1);
        this.compartment_id = data.parent_id;
        this.availability_domain = '1';
        this.size_in_gbs = 1024;
        this.backup_policy = 'bronze';
        this.vpus_per_gb = '10';
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Check if built from a query
        if (this.availability_domain.length > 1) {
            this.region_availability_domain = this.availability_domain;
            this.availability_domain = this.region_availability_domain.slice(-1);
        }
    }
    /*
    ** Clone Functionality
    */
    clone() {
        return new BlockStorageVolume(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Instance references
        for (let instance of this.getOkitJson().getInstances()) {
            for (let i=0; i < instance.block_storage_volume_ids.length; i++) {
                if (instance.block_storage_volume_ids[i] === this.id) {
                    instance.block_storage_volume_ids.splice(i, 1);
                }
            }
        }
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'bsv';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Block Storage Volume';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newBlockStorageVolume = function(data) {
    this.getBlockStorageVolumes().push(new BlockStorageVolume(data, this));
    return this.getBlockStorageVolumes()[this.getBlockStorageVolumes().length - 1];
}
OkitJson.prototype.getBlockStorageVolumes = function() {
    if (!this.block_storage_volumes) {
        this.block_storage_volumes = [];
    }
    return this.block_storage_volumes;
}
OkitJson.prototype.getBlockStorageVolume = function(id='') {
    for (let artefact of this.getBlockStorageVolumes()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteBlockStorageVolume = function(id) {
    for (let i = 0; i < this.block_storage_volumes.length; i++) {
        if (this.block_storage_volumes[i].id === id) {
            this.block_storage_volumes[i].delete();
            this.block_storage_volumes.splice(i, 1);
            break;
        }
    }
}
```

### Artefact View JavaScript
#### Generated Skeleton
Following generation a view file will be created in the **okitweb/static/okit/view/designer/js/artefacts** directory as shown below.
```javascript
/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Block Storage Volume View Javascript');

/*
** Define Block Storage Volume View Class
*/
class BlockStorageVolumeView extends OkitArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }
    // TODO: Return Artefact Parent id e.g. vcn_id for a Internet Gateway
    get parent_id() {return this.artefact.vcn_id;}
    // TODO: Return Artefact Parent Object e.g. VirtualCloudNetwork for a Internet Gateway
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/block_storage_volume.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/block_storage_volume.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return BlockStorageVolume.getArtifactReference();
    }
    static getDropTargets() {
        // TODO: Return List of Artefact Drop Targets Parent Object Reference Names e.g. VirtualCloudNetwork for a Internet Gateway
        return [VirtualCloudNetwork.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropBlockStorageVolumeView = function(target) {
    let view_artefact = this.newBlockStorageVolume();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newBlockStorageVolume = function(obj) {
    this.getBlockStorageVolumes().push(obj ? new BlockStorageVolumeView(obj, this) : new BlockStorageVolumeView(this.okitjson.newBlockStorageVolume(), this));
    return this.getBlockStorageVolumes()[this.getBlockStorageVolumes().length - 1];
}
OkitJsonView.prototype.getBlockStorageVolumes = function() {
    if (!this.block_storage_volumes) {
        this.block_storage_volumes = [];
    }
    return this.block_storage_volumes;
}
OkitJsonView.prototype.getBlockStorageVolume = function(id='') {
    for (let artefact of this.getBlockStorageVolumes()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.deleteBlockStorageVolume = function(id='') {
    this.okitjson.deleteBlockStorageVolume(id);
    this.update();
}
OkitJsonView.prototype.loadBlockStorageVolumes = function(block_storage_volumes) {
    for (const artefact of block_storage_volumes) {
        this.getBlockStorageVolumes().push(new BlockStorageVolumeView(new BlockStorageVolume(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.cloneBlockStorageVolume = function(obj) {
    const clone = obj.artefact.clone();
    clone.display_name += 'Clone';
    clone.id = clone.okit_id;
    this.okitjson.block_storage_volumes.push(clone);
    this.update(this.okitjson);
}
```
#### Skeleton Modification
At this point the generated file is incomplete and will require that a number of functions be modified to specify the valid
drop location for the Artefact. in the case of **Block Storage Volume** this will be a Compartment. 

- get parent_id()
- get parent()
- static getDropTargets() - The new Resource getArtifactReference() will need to be added to the parent Resource position method (e.g. getLeftArtifacts() of Compartment for **Block Storage Volume**)

In addition we will add a functionality required to highlight associated Artefacts (for Block Storage Volume this will be 
Instance it is attached to) by creating the following functions:

- addAssociationHighlighting()
- removeAssociationHighlighting()

Following the update the model JavaScript will be modified as below:
```javascript
/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Block Storage Volume View Javascript');

/*
** Define Block Storage Volume View Class
*/
class BlockStorageVolumeView extends OkitArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    /*
    ** SVG Processing
    */
    // Add Specific Mouse Events
    addAssociationHighlighting() {
        for (let instance of this.getOkitJson().getInstances()) {
            if (instance.block_storage_volume_ids.includes(this.id)) {
                $(jqId(instance.id)).addClass('highlight-association');
            }
        }
        $(jqId(this.artefact_id)).addClass('highlight-association');
    }
    removeAssociationHighlighting() {
        for (let instance of this.getOkitJson().getInstances()) {
            if (instance.block_storage_volume_ids.includes(this.id)) {
                $(jqId(instance.id)).removeClass('highlight-association');
            }
        }
        $(jqId(this.artefact_id)).removeClass('highlight-association');
    }
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/block_storage_volume.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/block_storage_volume.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return BlockStorageVolume.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropBlockStorageVolumeView = function(target) {
    let view_artefact = this.newBlockStorageVolume();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newBlockStorageVolume = function(obj) {
    this.getBlockStorageVolumes().push(obj ? new BlockStorageVolumeView(obj, this) : new BlockStorageVolumeView(this.okitjson.newBlockStorageVolume(), this));
    return this.getBlockStorageVolumes()[this.getBlockStorageVolumes().length - 1];
}
OkitJsonView.prototype.getBlockStorageVolumes = function() {
    if (!this.block_storage_volumes) {
        this.block_storage_volumes = [];
    }
    return this.block_storage_volumes;
}
OkitJsonView.prototype.getBlockStorageVolume = function(id='') {
    for (let artefact of this.getBlockStorageVolumes()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.deleteBlockStorageVolume = function(id='') {
    this.okitjson.deleteBlockStorageVolume(id);
    this.update();
}
OkitJsonView.prototype.loadBlockStorageVolumes = function(block_storage_volumes) {
    for (const artefact of block_storage_volumes) {
        this.getBlockStorageVolumes().push(new BlockStorageVolumeView(new BlockStorageVolume(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.cloneBlockStorageVolume = function(obj) {
    const clone = obj.artefact.clone();
    clone.display_name += 'Clone';
    clone.id = clone.okit_id;
    this.okitjson.block_storage_volumes.push(clone);
    this.update(this.okitjson);
}
```

### Palette SVG
#### Generated Skeleton
Following generation an empty SVG file will be created in the **okitweb/static/okit/palette/svg** directory as shown below. 
Because this is created in the hidden directory it will not be displayed in the Palette by default but once modified it 
should be moved to the appropriate palette subdirectory.
```svg
<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 24.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Block_Storage_Volume" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
     y="0px" viewBox="0 0 161.9 162" enable-background="new 0 0 161.9 162" xml:space="preserve">
<g>
</g>
</svg>
```
#### Skeleton Modification
For OKIT view to compliant with Oracle display standards we should use one of the svg files defined in 
[Oracle Graphics for Topologies and Diagrams](https://docs.cloud.oracle.com/en-us/iaas/Content/General/Reference/graphicsfordiagrams.htm).
The SVG zip file should contain an SVG file that can be used and the skeleton can be modified to include the appropriate 
path elements within the containing &lt;g&gt; tag.
Following the update the model JavaScript will be modified as below:
```svg
<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 24.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Block_Storage_Volume" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
     y="0px" viewBox="0 0 161.9 162" enable-background="new 0 0 161.9 162" xml:space="preserve">
    <g>
        <path fill="#312D2A" d="M153.1,152.5H9.4V26.8h143.8V152.5z M18.4,143.5h125.8V35.8H18.4V143.5z M152.6,9.1H8.9v9h143.8V9.1z
             M78,87.6H46.4V56H78V87.6z M53.4,80.6H71V63H53.4V80.6z M115.6,87.6H84V56h31.6V87.6z M91,80.6h17.6V63H91V80.6z M78.4,124.7H46.9
            V93.2h31.6V124.7z M53.9,117.7h17.6v-17.6H53.9V117.7z M116,124.7H84.5V93.2H116V124.7z M91.5,117.7H109v-17.6H91.5V117.7z"/>
    </g>
</svg>
```


### Properties HTML
#### Generated Skeleton
Following generation a property sheet HTML file will be created in the **okitweb/templates/okit/propertysheets** directory as shown below.
```jinja2
<!--
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
-->
{% extends "okit/propertysheets/base_property_sheet.html" %}
{% block title_block %}Block Storage Volume{% endblock %}
{% block required_properties_table_rows_block %}{% endblock %}
{% block optional_properties_table_rows_block %}{% endblock %}
{% block optional_properties_block %}{% endblock %}
```
#### Skeleton Modification
At this point the skeleton is incomplete and requires that Artefact specific html elements to be added. For our 
worked example we will need add the following fields:

- availability_domain
- size_in_gbs
- backup_policy
- vpus_per_gb

```jinja2
<!--
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
-->
{% extends "okit/propertysheets/base_property_sheet.html" %}
{% block title_block %}Block Storage Volume{% endblock %}
{% block required_properties_table_rows_block %}
    <div class='tr'><div class='td'>Availability Domain</div><div class='td'><select id="availability_domain" class="okit-property-value">
        <option value="1" selected="selected">Availability Domain 1</option>
        <option value="2">Availability Domain 2</option>
        <option value="3">Availability Domain 3</option>
    </select></div></div>
{% endblock %}
{% block optional_properties_table_rows_block %}
    <div class='tr'><div class='td'>Size (in GB)</div><div class='td'><input type="text" id="size_in_gbs" name="size_in_gbs" class="okit-property-value"></div></div>
    <div class='tr'><div class='td'>Backup Policy</div><div class='td'><select id="backup_policy" class="okit-property-value">
        <option value="bronze" selected="selected">Bronze</option>
        <option value="silver">Silver</option>
        <option value="gold">Gold</option>
    </select></div></div>
    <div class='tr'><div class='td'>Performance</div><div class='td'><select id="vpus_per_gb" class="okit-property-value">
        <option value="10" selected="selected">Balanced</option>
        <option value="20">Higher</option>
        <option value="0">Lower</option>
    </select></div></div>
{% endblock %}
{% block optional_properties_block %}{% endblock %}
```

### Artefact Python Facade
#### Generated Skeleton
Following generation a Python Facade file will be created in the **visualiser/facades** directory as shown below.
```python
#!/usr/bin/python

# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociBlockStorageVolume"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIBlockStorageVolumeConnection

# Configure logging
logger = getLogger()


class OCIBlockStorageVolumes(OCIBlockStorageVolumeConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.block_storage_volumes_json = []
        super(OCIBlockStorageVolumes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        block_storage_volumes = oci.pagination.list_call_get_all_results(self.client.list_block_storage_volumes, compartment_id=compartment_id).data

        # Convert to Json object
        block_storage_volumes_json = self.toJson(block_storage_volumes)
        logger.debug(str(block_storage_volumes_json))

        # Filter results
        self.block_storage_volumes_json = self.filterJsonObjectList(block_storage_volumes_json, filter)
        logger.debug(str(self.block_storage_volumes_json))

        return self.block_storage_volumes_json
```
#### Skeleton Modification
Although the generated file provides all the core functionality for a an OKIT OCI Python facade it is likely that it will 
require some minor changes. The developer should reference [Oracle Cloud Infrastructure Python SDK ](https://oracle-cloud-infrastructure-python-sdk.readthedocs.io/en/latest/)
and the specific [API](https://oracle-cloud-infrastructure-python-sdk.readthedocs.io/en/latest/api/landing.html) for the Artefact
being created.

In our worked example we will need to modify the name of the API list function from the generated **self.client.list_block_storage_volumes** 
to the correct name **self.client.list_volumes** which will result in the following file.
```python
#!/usr/bin/python

# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociBlockStorageVolume"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIBlockStorageVolumeConnection

# Configure logging
logger = getLogger()


class OCIBlockStorageVolumes(OCIBlockStorageVolumeConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.block_storage_volumes_json = []
        super(OCIBlockStorageVolumes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        block_storage_volumes = oci.pagination.list_call_get_all_results(self.client.list_volumes, compartment_id=compartment_id).data

        # Convert to Json object
        block_storage_volumes_json = self.toJson(block_storage_volumes)
        logger.debug(str(block_storage_volumes_json))

        # Filter results
        self.block_storage_volumes_json = self.filterJsonObjectList(block_storage_volumes_json, filter)
        logger.debug(str(self.block_storage_volumes_json))

        return self.block_storage_volumes_json
```
### Terraform Jinja2 Template
_Note:_ This file is currently not generated and will need to be created.

The terraform jinja2 template essentially consists of all actions that would need to occur to create the artifact using
terraform. It will consist of a number of data based statements to convert names to ids as well as the terraform data source.

Finally the Ids (ocids) returned by the data source will be assigned to local variables in a specific format {{resource_name}}_id
this will allow it to be referenced other artifacts. The {{resource_name}} will be generated from the display name into a 
known format.
```jinja2

# ------ Get List Volume Backup Policies
data "oci_core_volume_backup_policies" "{{ resource_name }}VolumeBackupPolicies" {
}
data "template_file" "{{ resource_name }}VolumeBackupPolicyIds" {
    count    = length(data.oci_core_volume_backup_policies.{{ resource_name }}VolumeBackupPolicies.volume_backup_policies)
    template = data.oci_core_volume_backup_policies.{{ resource_name }}VolumeBackupPolicies.volume_backup_policies[count.index]["id"]
}
data "template_file" "{{ resource_name }}VolumeBackupPolicyNames" {
    count    = length(data.oci_core_volume_backup_policies.{{ resource_name }}VolumeBackupPolicies.volume_backup_policies)
    template = data.oci_core_volume_backup_policies.{{ resource_name }}VolumeBackupPolicies.volume_backup_policies[count.index]["display_name"]
}
data "template_file" "{{ resource_name }}VolumeBackupPolicyIdx" {
    count    = length(data.template_file.{{ resource_name }}VolumeBackupPolicyNames.*.rendered)
    template = index(data.template_file.{{ resource_name }}VolumeBackupPolicyNames.*.rendered, {{ backup_policy | safe }})
}

# ------ Create Block Storage Volume
resource "oci_core_volume" "{{ resource_name }}" {
    # Required
    compartment_id = {{ compartment_id }}
    availability_domain = data.oci_identity_availability_domains.AvailabilityDomains.availability_domains[{{ availability_domain | safe | default(1) }} - 1]["name"]
    # Optional
    display_name   = {{ display_name | safe }}
    size_in_gbs    = {{ size_in_gbs | safe }}
    vpus_per_gb    = {{ vpus_per_gb | safe }}
{% if defined_tags is defined %}
    defined_tags   = {{ defined_tags | safe }}
{% endif %}
{% if freeform_tags is defined %}
    freeform_tags  = {{ freeform_tags | safe }}
{% endif %}
}

locals {
    {{ resource_name }}_id = oci_core_volume.{{ resource_name }}.id
}

# ------ Create Block Storage Backup Policy
resource "oci_core_volume_backup_policy_assignment" "{{ resource_name }}BackupPolicy" {
    asset_id  = local.{{ resource_name }}_id
    policy_id = data.template_file.{{ resource_name }}VolumeBackupPolicyIds.*.rendered[index(data.template_file.{{ resource_name }}VolumeBackupPolicyNames.*.rendered, {{ backup_policy | safe }})]
}
```

## Updated Files
Once the core files for the new Resource (Artefact) have been created the developer will need to integrate these into the
existing functionality by editing a number of common script files. The required edits will be described in the following sections. 
### Frontend Files

### Backend Files
- [OCI Query Python](#oci-query-python)
- [Generator Python](#generator-python)

### OCI Query Python
To facilitate querying of the new Resource (Artefact) we will need to modify the **visualiser/query/ociQuery.py** file 
to include the new Resource in the **SUPPORTED_RESOURCES** list and the **DISCOVERY_OKIT_MAP** object. The correct name 
to be entered into the **SUPPORTED_RESOURCES** can be identified by looking at the **visualiser/discovery/oci_discovery_client.py** 
whilst the entry in the **DISCOVERY_OKIT_MAP** will be used to map the name to the OKIT model list.

### Generator Python
The **visualiser/generators/ociGenerator.py** python code will need to be edited to include a Render method for the new Resource (Artefact)
and the existing **generate()** method will need to be modified to call the new Render method.

Although the sequence in which resource creation occurs does not matter for terraform it does for other language such as ansible, python or bash. 
To allow for these language restrictions the new call needs to be placed before any artifact that will link to / use the new artifact. 
To this end the calls to render have been split into logical sections based on which artifacts they are contained within. 
In our example the Block Storage Volume must exist before an Instance can use it hence it occurs before the instance processing.
#### Edit generate Method
The **generate()** needs to be modified to loop through the list of new artefacts and call the new Render method.
```python
        # -- Block Storage Volumes
        for block_storage_volume in self.visualiser_json.get('block_storage_volumes', []):
            self.renderBlockStorageVolume(block_storage_volume)
```
#### Create Render Method
The render method will take the new artefact definition and generated / store the variables required for the jinja2 templates
[Terraform Jinja2 Template](#terraform-jinja2-template) before rednering the
templates and storing the result in the **self.create_sequence** list.
```python
    def renderBlockStorageVolume(self, artefact):
        # Reset Variables
        self.initialiseJinja2Variables()
        # Read Data
        standardisedName = self.standardiseResourceName(artefact['display_name'])
        resourceName = '{0:s}'.format(standardisedName)
        self.jinja2_variables['resource_name'] = resourceName
        self.jinja2_variables['output_name'] = artefact['display_name']
        # Process Block Storage Volume Data
        logger.info('Processing Block Storage Volume Information {0!s:s}'.format(standardisedName))
        # -- Define Variables
        # --- Required
        # ---- Compartment Id
        self.jinja2_variables["compartment_id"] = self.formatJinja2IdReference(self.standardiseResourceName(self.id_name_map[artefact['compartment_id']]))
        # ---- Availability Domain
        self.addJinja2Variable("availability_domain", artefact["availability_domain"], standardisedName)
        # ---- Display Name
        self.addJinja2Variable("display_name", artefact["display_name"], standardisedName)
        # ---- Backup Policy
        self.addJinja2Variable("backup_policy", artefact["backup_policy"], standardisedName)
        # ---- Size In GBs
        self.addJinja2Variable("size_in_gbs", artefact["size_in_gbs"], standardisedName)
        # --- Optional
        # ---- VPU
        self.addJinja2Variable("vpus_per_gb", artefact["vpus_per_gb"], standardisedName)
        # ---- Tags
        self.renderTags(artefact)

        # -- Render Template
        jinja2_template = self.jinja2_environment.get_template("block_storage_volume.jinja2")
        self.create_sequence.append(jinja2_template.render(self.jinja2_variables))
        logger.debug(self.create_sequence[-1])
        return
```

## Running Docker for Development
When developing we do not want to keep building our docker image to access the new/modified code so for development and 
testing we should mount the local directories during the run command and this can be achieved as follows.
```bash
docker run -it --rm -p 80:80 --name okit --hostname okit \
    -v ${OCI_CONFIG_DIR}:/root/.oci \
    -v ${OKIT_GITHUB}/okitweb:/okit/okitweb \
    -v ${OKIT_GITHUB}/skeletons:/okit/skeletons \
    -v ${OKIT_GITHUB}/visualiser:/okit/visualiser \
    -v ${OKIT_WORKSPACE}/log:/okit/log \
    okit
```
