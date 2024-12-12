[![License: UPL](https://img.shields.io/badge/license-UPL-green)](https://img.shields.io/badge/license-UPL-green) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=oracle_oci-designer-toolkit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=oracle_oci-designer-toolkit)
# Oracle Cloud Infrastructure Designer and Visualisation Toolkit [0.66.1](CHANGELOG.md#version-0.66.1)

Full Release Details Can Found [0.66.1 Release](https://github.com/oracle/oci-designer-toolkit/releases/tag/v0.66.1).

**OKIT - Open Cloud Designer** Public Beta is now Available see [0.66.1 Release](https://github.com/oracle/oci-designer-toolkit/releases/tag/v0.66.1) for details.
_____

OCI designer and visualisation toolKIT (OKIT) is a browser based tool that allows the user to [design](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit), 
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


## Changes

[Changes for the current release (0.66.1) are documented here.](CHANGELOG.md#version-0.66.1)


## Releases

See [Releases](https://github.com/oracle/oci-designer-toolkit/releases)
  
## Blogs
- [Introduction to OKIT the OCI Designer Toolkit](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)
- [The OCI Designer Toolkit Templates Feature](https://www.ateam-oracle.com/the-oci-designer-toolkit-templates-feature)
- [The OCI Designer Toolkit Query Feature](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature)
- [OCI Designer Toolkit Resource Manager Integration](https://www.ateam-oracle.com/oci-designer-toolkit-resource-manager-integration)
- [The OCI Designer Toolkit Documentation Generation](https://www.ateam-oracle.com/the-oci-designer-toolkit-documentation-generation)


## Installation
### OKIT-Web
Detailed OKIT Installation steps can be found in the [OCI Designer Toolkit Installation Guide](documentation/Installation.md).
1. [MacOS](documentation/Installation.md#macos)
2. [Windows 10 / WSL (Ubuntu)](documentation/Installation.md#windows-10--wsl-ubuntu)
3. [Oracle Linux](documentation/Installation.md#oracle-linux-ol8)
### OKIT-Ocd
OKIT-Ocd is the next iteration of OKIT and is currently available as a Beta release. The native installables can be found in the Assets section 
on the [0.66.1 Release](https://github.com/oracle/oci-designer-toolkit/releases/tag/v0.66.1).
1. MacOS
    1. [Arm dmg](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.66.1/ocd-0.2.6-arm64.dmg)
    2. [x64 dmg](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.66.1/ocd-0.2.6-x64.dmg)
2. Windows
    1. [Setup](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.66.1/ocd-0.2.6-Setup.exe)
3. Linux
    1. [rpm](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.66.1/ocd-0.2.6-1.x86_64.rpm)
    2. [deb](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.66.1/ocd_0.2.6_amd64.deb)



### OCI Config File

Create the OCI cli __config__ file in the directory __&lt;USER HOME DIR&gt;/.oci__ with contents similar to that below.
The __*key_file*__ is a fixed value because the contents of the __&lt;USER HOME DIR&gt;/.oci__ will be mounted to the
appropriate users home directory, as __~/.oci__, during the run process.

```properties
[DEFAULT]
user=ocid1.user.oc1..aaaaaaaak6z......
fingerprint=3b:7e:37:ec:a0:86:1....
key_file=~/.oci/oci_api_key.pem  
tenancy=ocid1.tenancy.oc1..aaaaaaaawpqblfem........
region=us-phoenix-1
```

If connecting to a PCA or C3 machine that requires a cert bundle then an additional entry will need to be added to the config file entry specifying
the location of the cert bundle similar to the following.
```properties
cert-bundle=~/.oci/certs/certbundle.cert
```

### GIT Settings File

If Git integration is required you will need to create a __git_repositories__ file within the directory 
__&lt;USER HOME DIR&gt;/.oci__ with contents similar to that below.

```properties
[OKIT Community Templates]
branch=main
url=git@github.com:username/okit-community-templates.git
  
[Example Repo]
branch = master
url = git@url1.git

[Internal]
branch = BRANCHNAME
url = git@url2.git
```

This properties file contains a list of the Git repositories you want to access. It assumes that you are using public/private
key access, the key files exist within your __&lt;USER HOME DIR&gt;/.ssh__ directory and the __&lt;USER HOME DIR&gt;/.ssh/config__
defines the key/url mapping, similar to the following.

```properties
Host github.com
	IdentityFile ~/.ssh/id_rsa_github
```


## Usage / Examples
The OKIT User / Usage Guide and worked examples can be found in the [OCI Designer Toolkit Usage Guide](documentation/Usage.md)

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


If you would like to extend OKIT the development documentation can be found in [OCI Designer Toolkit Development Guide](documentation/Development.md)
