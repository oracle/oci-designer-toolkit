[![License: UPL](https://img.shields.io/badge/license-UPL-green)](https://img.shields.io/badge/license-UPL-green) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=oracle_oci-designer-toolkit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=oracle_oci-designer-toolkit)
# Oracle Cloud Infrastructure Designer and Visualisation Toolkit [0.69.0](CHANGELOG.md#version-0.69.0)

Full Release Details Can Found [0.69.0 Release](https://github.com/oracle/oci-designer-toolkit/releases/tag/v0.69.0).





## OKIT Desktop (OCD) [0.2.9](CHANGELOG.md#version-0.69.0)

OKIT Desktop is the next generation implementation of the OKIT Classic design tool that takes the concepts within OKIT Classic and re-implements them within
an Electron based desktop application, providing native installs for Mac, Windows and Linux.

**OKIT Desktop** Public Beta is now Available see [0.69.0 Release](https://github.com/oracle/oci-designer-toolkit/releases/tag/v0.69.0) for details.

The OKIT Desktop provides the user with a fully freeform Drag & Drop canvas with the ability to create multiple pages to represent the same design in alternative formats, as seen below. As with the OKIT Classic the properties of resources can be editted within the properties panel along with the ability to add detailed description of each resource, if required. The OKIT Desktop will provide feature compatibility with the OKIT Classic allowing the user multiple views of the design information:

- Views
    - Design
    - Documentation
    - Variables
    - Common Tags
    - Markdown
    - Tabular
    - Terraform

Exporting the design will now allow the following options:

- Export
    - Markdown
    - Terraform
    - Excel
    - Image

Importing the design will allow the following options
- Import
    - Query
        - OCI
    - Terraform

The OKIT Desktop release is also preparing for Multi-Cloud implementation of Oracle database and will be extended to include Azure, Google and AWS. This is currently Alpha release and hence limited in its functionality.

### Traditional Design
![Ocd Desktop](https://github.com/oracle/oci-designer-toolkit/blob/master/ocd/images/OcdDesktop3.png)
### Connection Based View
![Ocd Desktop Connections](https://github.com/oracle/oci-designer-toolkit/blob/master/ocd/images/OcdDesktop4.png)

### Installation
OKIT Desktop is the next iteration of OKIT and is currently available as a Beta release. 
The native installables can be found in the Assets section on the [0.69.0 Release](https://github.com/oracle/oci-designer-toolkit/releases/tag/v0.69.0).
1. MacOS
    1. [Arm dmg](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.69.0/ocd-0.2.7-arm64.dmg)
    2. [x64 dmg](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.69.0/ocd-0.2.7-x64.dmg)
2. Windows
    1. [Setup](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.69.0/ocd-0.2.7-Setup.exe)
3. Linux
    1. [rpm](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.69.0/ocd-0.2.7-1.x86_64.rpm)
    2. [deb](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.69.0/ocd_0.2.7_amd64.deb)

At present the binaries are unsigned so on Mac and Windows you will specifically need to authorise the first run.

For anyone trying to install the Desktop version on a Mac running Sequoia 15.x.x you will probably notice that you can no longer override the licence warning within settings. There is a way around this and it is to execute the following once thw dmg has been installed.
```bash
xattr -d com.apple.quarantine /Applications/ocd.app
```



## OKIT Classic [0.69.0](CHANGELOG.md#version-0.69.0)

OKIT Classic is the original browser based tool that allows the user to [design](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit), 
[deploy](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit) and visualise ([introspect/query](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature)) 
OCI environments through a graphical web based interface. 

- [Design](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)

    The Web based interface will allow architects and designers to build a visual representation of their infrastructure
    and then export this in a number of formats. 

    - svg
    - png
    - jpeg

- [Export](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)

    Once completed the design can be enhanced to add key property information allowing the designed infrastructure to
    be exported to a number of DevOps frameworks or Markdown for documentation.
    
    - Terraform
    - OCI Resource Manager
    - Markdown
    
    This allows for rapid proto-typing and building.

- [Introspect](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature)

    OKIT will also allow the user to introspect existing OCI environments, through simple query functionality embedded within the
    web interface, to provide a portable generic json file, that can be used to visualise existing systems or generate terraform/ansible.

### Installation
Detailed OKIT Installation steps can be found in the [OCI Designer Toolkit Installation Guide](okitclassic/documentation/Installation.md).
1. [MacOS](okitclassic/documentation/Installation.md#macos)
2. [Windows 10 / WSL (Ubuntu)](okitclassic/documentation/Installation.md#windows-10--wsl-ubuntu)
3. [Oracle Linux](okitclassic/documentation/Installation.md#oracle-linux-ol8)





## Releases

See [Releases](https://github.com/oracle/oci-designer-toolkit/releases)
  




## Blogs
- [Introduction to OKIT the OCI Designer Toolkit](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)
- [The OCI Designer Toolkit Templates Feature](https://www.ateam-oracle.com/the-oci-designer-toolkit-templates-feature)
- [The OCI Designer Toolkit Query Feature](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature)
- [OCI Designer Toolkit Resource Manager Integration](https://www.ateam-oracle.com/oci-designer-toolkit-resource-manager-integration)
- [The OCI Designer Toolkit Documentation Generation](https://www.ateam-oracle.com/the-oci-designer-toolkit-documentation-generation)





## Usage / Examples
The OKIT User / Usage Guide and worked examples can be found in the [OCI Designer Toolkit Usage Guide](okitclassic/documentation/Usage.md)





## Changes

See [CHANGELOG](CHANGELOG.md).





## Known Issues

You can find information on any known issues with OKIT here and under the Issues tab of this project's GitHub repository.
Any issues found with the tool should be raised on the projects issues page. Please check that the issue has not previously
been reported. 

## Contributing

This project welcomes contributions from the community. Before submitting a pull request, please [review our contribution guide](./CONTRIBUTING.md)

## Security

Please consult the [security guide](./SECURITY.md) for our responsible security vulnerability disclosure process

## License

Copyright (c) 2020, 2024, Oracle and/or its affiliates.

Released under the Universal Permissive License v1.0 as shown at
<https://oss.oracle.com/licenses/upl/>.


If you would like to extend OKIT the development documentation can be found in [OCI Designer Toolkit Development Guide](okitclassic/documentation/Development.md)
