# OCI Kinetic Infrastructure Toolkit Installation Guide

Although OKIT can simply be downloaded and the command line executed it is recommended that it be executed within a
docker container that can be built using the Dockerfile within this repository. This will guarantee that all the required 
python modules are installed and in addition provide a simple flask server that will present the web based application on
[http://localhost:8080/okit/designer](http://localhost:8080/okit/designer).


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
and the associated Release tag is in the format Release-<Version> hence for the version 0.1.0 the Reease tag will be 
**Release-0.1.0**. The command shows how this can be cloned to the local machine.

```bash
your-mac:tmp git clone -b Release-0.1.0 --depth 1 git@<Git Repo URL>:<Repository>/okit.oci.web.designer.git
```


## Docker 
The docker image is the recommended runtime server and can be built and started using the scripts in the docker sub directory

### Build Docker Image
```bash
your-mac:tmp youruser$ cd okit.oci.web.designer/docker/
your-mac:docker
your-mac:docker youruser$ ./build-docker-image.sh
```

### Start Docker Image
```bash
your-mac:tmp youruser$ cd okit.oci.web.designer/docker/
your-mac:docker
your-mac:docker youruser$ ./start-okit-server.sh
```


## Vagrant

### Prerequisites

1. Install [Oracle VM VirtualBox](https://www.virtualbox.org/wiki/Downloads)
2. Install [Vagrant](https://vagrantup.com/)
3. If you have VirtualBox 6.1 installed you need to apply a small fix to get Vagrant to work, 
[Vagrant 2.2.6 on VirtualBox 6.1](https://blogs.oracle.com/scoter/getting-vagrant-226-working-with-virtualbox-61-ga)

### Copy the .oci folder 
From your home directory to the okit.oci.web.designer/vagrant folder. 

The vagrant should now have these folders & files: 
- Vagrantfile
- run-as-root.sh
- run-as-vagrant.sh
- README.md
- The .oci folder

### Build Vagrant Image
```bash
your-mac:tmp youruser$ cd okit.oci.web.designer/vagrant/
your-mac:vagrant youruser$ vagrant up; vagrant ssh
```
**NOTE**: This step takes about 30 minutes on my mac when you build the VM, a little longer the first time as the Vbox image 
is downloaded from github. Once the VM is built the vagrant up should just take a few seconds.
    
After the Vagrant VM is built the vagrant users home folder should have folders from the cloned okit.oci.web.designer 
repository exposed in the Vagrant vm in the vagrant users home directory (/okitweb, /visualiser & /output). The OKIT app 
should also be running. To access the app the ports have been forwarded to the host and you should be able to access 
OKIT on http://localhost:8080/okit/designer from the host.

