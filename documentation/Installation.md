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
and the associated Release tag is in the format v<Version> hence for the version 0.5.0 the Release tag will be 
**v0.5.0**. The command shows how this can be cloned to the local machine.

```bash
git clone -b v0.5.0 --depth 1 git@github.com:oracle/oci-designer-toolkit.git
```


## Docker 
The docker image is the recommended runtime server and can be built and started using the scripts in the docker sub directory.
It should be noted that the current Docker script is designed for development purposes and mounts the source directories
at runtime. 

### Build Docker Image
```bash
cd oci-designer-toolkit/docker/
./build-docker-image.sh
```

### Start Docker Image
```bash
cd oci-designer-toolkit/docker/
./start-okit-server.sh
```


## Vagrant

### Prerequisites

1. Install [Oracle VM VirtualBox](https://www.virtualbox.org/wiki/Downloads)
2. Install [Vagrant](https://vagrantup.com/)

### Copy the .oci folder 
From your home directory to the oci-designer-toolkit/vagrant folder. 

The vagrant should now have these folders & files: 
- Vagrantfile
- The .oci folder

### Build Vagrant Image
```bash
cd oci-designer-toolkit/vagrant/
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

