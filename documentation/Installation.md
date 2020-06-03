# OCI Designer Toolkit Installation Guide

Although OKIT can simply be downloaded and the command line executed it is recommended that it be executed within a
docker container that can be built using the Dockerfile within this repository. This will guarantee that all the required 
python modules are installed and in addition provide a simple flask server that will present the web based application on
[http://localhost/okit/designer](http://localhost/okit/designer).


## Table of Contents

1. [Clone Repository](#clone-repository)
2. [Docker](#docker)
    1. [Build Docker Image](#build-docker-image)
    2. [Start Docker Image](#start-docker-image)
3. [Vagrant](#vagrant)
    1. [Prerequisites](#prerequisites)
    2. [Copy the .oci folder](#copy-the-oci-folder)
    3. [Build Vagrant Image](#build-vagrant-image)


## Clone Repository
Before the building either the Docker or Vagrant Images the project will nee to be cloned from the Git Repository (or downloaded)
and it is recommended that the latest Stable Release be cloned. The latest stable version number if shown in the README
and the associated Release tag is in the format vX.Y.Z hence for the version 0.6.0 the Release tag will be 
**v0.6.0**. The command shows how this can be cloned to the local machine.

```bash
git clone -b v0.6.0 --depth 1 git@github.com:oracle/oci-designer-toolkit.git
```

or 

```bash
git clone -b v0.6.0 --depth 1 https://github.com/oracle/oci-designer-toolkit.git
```

### Download
If you do not have git installed locally the current release of OKIT can be retrieved by downloading it as a zip file from
https://github.com/oracle/oci-designer-toolkit/archive/v0.5.1.zip


## OCI Config File
Before executing any of the docker container scripts OKIT requires an OCI connection configuration file. This file 
contains the connection information used by OKIT when executing queries or exporting to Resource Manager.

__*Note:*__ The key_file entry __must not__ be an Absolute path on the host machine. The config directory will be mounted
to the docker, linux, root user ~/.oci directory.

If you have already installed the OCI SDK/CLI on you machine then you will have already created this file. If you do not 
have the sdk or cli installed then we will need to create a config as defined in the next section.

### Creating the Config File

Create the directory __<OKIT_ROOT_DIR>/containers/oci__ and within it a file called __config__ with contents similar to
that below.

```properties
[DEFAULT]
user=ocid1.user.oc1..aaaaaaaak6z......
fingerprint=3b:7e:37:ec:a0:86:1....
key_file=~/.oci/oci_api_key.pem
tenancy=ocid1.tenancy.oc1..aaaaaaaawpqblfem........
region=us-phoenix-1
```

Your pem key associated with your OCI Tenancy / Account should now be copied to the __<OKIT_ROOT_DIR>/containers/oci/oci_api_key.pem__.

Further information on the config file can be found on the OCI sdk page [SDK and CLI Configuration File](https://docs.cloud.oracle.com/en-us/iaas/Content/API/Concepts/sdkconfig.htm).


## Docker 
The docker image is the recommended runtime server and can be built and started using the scripts in the docker sub directory.
It should be noted that the current Docker script is designed for development purposes and mounts the source directories
at runtime. 

### Build Docker Image
```bash
cd oci-designer-toolkit
docker build --tag okit --file ./containers/docker/Dockerfile --force-rm ./containers/docker/
```

### Start Docker Image

- OKIT_ROOT_DIR  : Absolute Root Directory of the extracted / cloned OKIT repository
- OCI_CONFIG_DIR : Directory containing the OCI config file (OKIT_ROOT_DIR/containers/oci)

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

If you want to run the image in and interactive mode then replace to _-d_ in the above command with _-it_.


## Vagrant

### Prerequisites

1. Install [Oracle VM VirtualBox](https://www.virtualbox.org/wiki/Downloads)
2. Install [Vagrant](https://vagrantup.com/)

### Copy the OCI_CONFIG_DIR folder 
Copy the contents of the OCI_CONFIG_DIR directory to the oci-designer-toolkit/containers/vagrant/__oci__ folder. 

The vagrant should now have these folders & files: 
- Vagrantfile
- oci folder

### Build Vagrant Image
```bash
cd oci-designer-toolkit/containers/vagrant/
vagrant up; vagrant ssh
```
**NOTE**: This step takes about 30 minutes on my mac when you build the VM, a little longer the first time as the Vbox image 
is downloaded from github. Once the VM is built the vagrant up should just take a few seconds.
    
After the Vagrant VM is built the vagrant users home folder should have folders from the cloned oci-designer-toolkit 
repository exposed in the Vagrant vm in the vagrant users home directory (/okitweb, /visualiser & /output). The OKIT app 
should also be running. To access the app the ports have been forwarded to the host and you should be able to access 
OKIT on [http://localhost/okit/designer](http://localhost/okit/designer) from the host.

It should be noted that the current Vagrantfile script is designed for development purposes and and mounts the source directories
at runtime.

