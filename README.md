# OCI Designer Toolkit [0.4.1](ReleaseNotes.md#version-0.4.1)

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
Detailed OKIT Installation steps can be found in the [OCI Kinetic Infrastructure Toolkit Installation Guide](documentation/Installation.md).

### Quick Start
The docker image is the recommended runtime server and can be built and started using the scripts in the docker sub directory

#### Build Docker Image
```bash
cd docker/
./build-docker-image.sh
```

#### Start Docker Image
```bash
cd docker/
./start-okit-server.sh
```

Once started the Designer BUI can be accessed on [http://localhost/okit/designer](http://localhost/okit/designer)


## Usage / Examples
The OKIT User / Usage Guide and worked examples can be found in the [OCI Kinetic Infrastructure Toolkit Usage Guide](documentation/Usage.md)


## Changes

See [CHANGELOG](CHANGELOG.md).

## Known Issues

You can find information on any known issues with OKIT here and under the Issues tab of this project's GitHub repository.
Any issues found with the tool should be raised on the projects issues page. Please check that the issue has not previously
been reported. 


## Contributing
OCI Kinetic Infrastructure Toolkit is an open source project. See [CONTRIBUTING](CONTRIBUTING.md) for details.

If you would like to extend OKIT the development documentation can be found in [OCI Kinetic Infrastructure Toolkit Development Guide](documentation/Development.md)


