# OCI Designer Toolkit [0.6.0](CHANGELOG.md#version-0.6.0)

OCI designer toolKIT (OKIT) is a set of tools for enabling design, deploy and visualise OCI environments 
through a graphical web based interface. 

The Web based interface will allow architects and designers to build a visual representation of their infrastructure
and then export this in a number of formats. 

- svg
- png
- jpeg

Once completed the design can be enhanced to add key property information that will allow the designed infrastructure to
be exported to a number of DevOps frameworks.

- Ansible
- Terraform
- OCI Resource Manager

This allows for rapid proto-typing and building.

OKIT will also all the Operations user to capture existing OCI environments, through simple query functionality embedded in  
web interface, to provide a portable generic, json, file that can be used to visualise existing systems or generate terraform/ansible. 



## Installation
Detailed OKIT Installation steps can be found in the [OCI Designer Toolkit Installation Guide](documentation/Installation.md).

### Quick Start
The docker image is the recommended runtime server and can be built and started using the following simple docker commands.

#### Build Docker Image
```bash
cd oci-designer-toolkit
docker build --tag okit --file ./containers/docker/Dockerfile --force-rm ./containers/docker/
```

#### Start Docker Image
- OKIT_ROOT_DIR  : Absolute directory name for the extracted / cloned OKIT repository
- OCI_CONFIG_DIR : Directory containing the OCI config file. Details can be found in [OCI Designer Toolkit Installation Guide](documentation/Installation.md#oci-config-file).

```bash
cd oci-designer-toolkit
docker run -d --rm -p 80:80 \
           --name okit \
           --hostname okit \
           -v <OCI_CONFIG_DIR>:/root/.oci \
           -v <OKIT_ROOT_DIR>/okitweb:/okit/okitweb \
           -v <OKIT_ROOT_DIR>/visualiser:/okit/visualiser \
           -v <OKIT_ROOT_DIR>/log:/okit/log \
           okit
```

Once started the Designer BUI can be accessed on [http://localhost/okit/designer](http://localhost/okit/designer)


## Usage / Examples
The OKIT User / Usage Guide and worked examples can be found in the [OCI Designer Toolkit Usage Guide](documentation/Usage.md)


## Changes

See [CHANGELOG](CHANGELOG.md).

## Known Issues

You can find information on any known issues with OKIT here and under the Issues tab of this project's GitHub repository.
Any issues found with the tool should be raised on the projects issues page. Please check that the issue has not previously
been reported. 


## Contributing
OCI Designer Toolkit is an open source project. See [CONTRIBUTING](CONTRIBUTING.md) for details.

If you would like to extend OKIT the development documentation can be found in [OCI Designer Toolkit Development Guide](documentation/Development.md)


