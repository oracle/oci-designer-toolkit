# OCI Designer Toolkit Installation Guide

## Table of Contents

1. [OCI Connection Information](#oci-connection-information)
    1. [Key File](#key-file)
    2. [Config File](#config-file)
2. [Git Connection](#git-connection)
    1. [GIT Repositories File](#git-repository-file)
3. [MacOS](#macos)
4. [Windows 10 / WSL (Ubuntu)](#windows-10--wsl-ubuntu)
5. [Oracle Linux](#oracle-linux-ol8)
6. [Container](#container)
    1. [Docker](#docker)
    2. [Lima (MacOS)](#lima-macos)
    3. [Vagrant / VirtualBox](#vagrant--virtualbox)











## OCI Connection Information

If you already have the OCI sdk/cli installed on you machine you can use the previously generated pem key and config file
we will assume that this exists in &lt;USER HOME DIR&gt;/.oci 

### Key File

If you do not have a previously generated private key you will need to create a private/public key pair for use with OKIT and OCI.
These keys can be generated using the following commands as defined in [Required Keys and OCIDs](https://docs.cloud.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm).

```bash
openssl genrsa -out <USER HOME DIR>/.oci/oci_api_key.pem 2048   
openssl rsa -pubout -in <USER HOME DIR>/.oci/oci_api_key.pem -out <USER HOME DIR>/.oci/oci_api_key_public.pem                                  
```

Upload the generated __oci_api_key_public.pem__ to OCI through the [console](https://docs.cloud.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm) and record the associated fingerprint following upload.

### Config File

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
Further information on the config file can be found on the OCI sdk page [SDK and CLI Configuration File](https://docs.cloud.oracle.com/en-us/iaas/Content/API/Concepts/sdkconfig.htm).










## Git Connection

### GIT Repositories File

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
key access and the key files exist within your __&lt;USER HOME DIR&gt;/.ssh__ directory and the __&lt;USER HOME DIR&gt;/.ssh/config__
defines the key/url mapping.










## MacOS

### Package Install
Install the following packages using [Homebrew](https://brew.sh/)
```bash
brew install git
brew install python3
brew install libmagic
```

### Install
```bash
export OKIT_DIR=${HOME}/okit
export OKIT_GITHUB_DIR=${HOME}/okit_github
export OKIT_BRANCH='master'
mkdir -p ${OKIT_DIR}
mkdir -p ${OKIT_GITHUB_DIR}
# Create Python Virtual Environment
python3 -m venv ${OKIT_DIR}/.venv
# Activate Virtual Environment
source ${OKIT_DIR}/.venv/bin/activate
# Update python modules
python3 -m pip install -U pip
python3 -m pip install -U setuptools
# Clone OKIT 
git clone -b ${OKIT_BRANCH} https://github.com/oracle/oci-designer-toolkit.git ${OKIT_GITHUB_DIR}/oci-designer-toolkit
# Install OKIT Required python modules
python3 -m pip install --no-cache-dir -r ${OKIT_GITHUB_DIR}/oci-designer-toolkit/requirements.txt
# Create OKIT Required Directories
mkdir -p ${OKIT_DIR}/{log,instance/git,instance/local,instance/templates/user,workspace,ssl}
# Link Directories
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/config ${OKIT_DIR}/config
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/okitserver ${OKIT_DIR}/okitserver
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/modules ${OKIT_DIR}/modules
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/okitserver/static/okit/templates/reference_architecture ${OKIT_DIR}/instance/templates/reference_architecture
```

### Run
```bash
export OKIT_DIR=${HOME}/okit
export OKIT_LOGFILE=${OKIT_DIR}/log/okit.log
export PYTHONPATH=:${OKIT_DIR}/modules:${OKIT_DIR}/okitserver:${OKIT_DIR}
# Activate Virtual Environment
source ${OKIT_DIR}/.venv/bin/activate
# Run Server
${OKIT_DIR}/.venv/bin/gunicorn okitserver.wsgi:app --config ${OKIT_DIR}/config/gunicorn_http.py
```

## Windows 10 / WSL (Ubuntu)
This installation procedure assumes you have previously installed Windows Subsystem for Linux 2.

### Package Install
```bash
sudo apt install git
sudo apt install python3
sudo apt install libmagic-dev
sudo apt install python3-venv
```

### Install
```bash
export OKIT_DIR=${HOME}/okit
export OKIT_GITHUB_DIR=${HOME}/okit_github
export OKIT_BRANCH='master'
mkdir -p ${OKIT_DIR}
mkdir -p ${OKIT_GITHUB_DIR}
# Create Python Virtual Environment
python3 -m venv ${OKIT_DIR}/.venv
# Activate Virtual Environment
source ${OKIT_DIR}/.venv/bin/activate
# Update python modules
python3 -m pip install -U pip
python3 -m pip install -U setuptools
# Clone OKIT 
git clone -b ${OKIT_BRANCH} https://github.com/oracle/oci-designer-toolkit.git ${OKIT_GITHUB_DIR}/oci-designer-toolkit
# Install OKIT Required python modules
python3 -m pip install --no-cache-dir -r ${OKIT_GITHUB_DIR}/oci-designer-toolkit/requirements.txt 
# Create OKIT Required Directories
mkdir -p ${OKIT_DIR}/{git,local,log,instance/git,instance/local,instance/templates/user,workspace,ssl}
# Link Directories
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/config ${OKIT_DIR}/config
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/okitserver ${OKIT_DIR}/okitserver
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/modules ${OKIT_DIR}/modules
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/okitserver/static/okit/templates/reference_architecture ${OKIT_DIR}/instance/templates/reference_architecture
```

### Run
```bash
export OKIT_DIR=${HOME}/okit
export OKIT_LOGFILE=${OKIT_DIR}/log/okit.log
export PYTHONPATH=:${OKIT_DIR}/modules:${OKIT_DIR}/okitserver:${OKIT_DIR}
# Activate Virtual Environment
source ${OKIT_DIR}/.venv/bin/activate
# Run Server
${OKIT_DIR}/.venv/bin/gunicorn okitserver.wsgi:app --config ${OKIT_DIR}/config/gunicorn_http.py
```

__Note:__ You may need to replace "localhost" in the OKIT URL with the IP Address of you WSL2 Virtual Machine.

## Oracle Linux (OL8)

If you have a Linux machine and would like to install OKIT directly without the need for Docker or Vagrant then 
this can be achieved using the following simple instructions. We assume that you have already created the appropriate OCI SDK config
file in, __root users__ ~/.oci and associated ssh keys/config in ~/.ssh.

The instructions below give 2 options for the server either HTTP or HTTPS and it is up to the user to choose the appropriate 
command based on their requirements.

These instructions will install OKIT in the root directory __/okit__. If you would like OKIT in an alternative directory 
modify the OKIT_DIR environment variable. In addition the __/etc/systemd/system/gunicorn.service__ and __${OKIT_DIR}/config/gunicorn_http*.py__ 
files will need to modified to reflect this new location.

__NOTE: The service will run as root and hence will require the oci config and associated key files to be below roots home directory__

```bash
export OKIT_DIR=${HOME}/okit
export OKIT_GITHUB_DIR=${HOME}/okit_github
export OKIT_BRANCH='master'
mkdir -p ${OKIT_DIR}
mkdir -p ${OKIT_GITHUB_DIR}
# Install Required Packages 
sudo bash -c "yum update -y"
sudo bash -c "yum install -y git"
sudo bash -c "yum install -y openssl"
sudo bash -c "yum install -y oci-utils"
# This is not required for OL8
sudo bash -c "yum install -y python-oci-cli"
# Update Python Modules
sudo bash -c "python3 -m pip install -U pip"
sudo bash -c "python3 -m pip install -U setuptools"
# Clone OKIT
git clone -b ${OKIT_BRANCH} https://github.com/oracle/oci-designer-toolkit.git ${OKIT_GITHUB_DIR}/oci-designer-toolkit
# Install OKIT Required python modules
sudo bash -c "python3 -m pip install --no-cache-dir -r ${OKIT_GITHUB_DIR}/oci-designer-toolkit/requirements.txt"
# Create OKIT Required Directories
mkdir -p ${OKIT_DIR}/{log,instance/git,instance/local,instance/templates/user,workspace,ssl}
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/config ${OKIT_DIR}/config
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/okitserver ${OKIT_DIR}/okitserver
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/modules ${OKIT_DIR}/modules
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/okitserver/static/okit/templates/reference_architecture ${OKIT_DIR}/instance/templates/reference_architecture
# Link to root level okit directory
sudo bash -c "ln -sv ${OKIT_DIR} /okit"
# Open Firewall
sudo firewall-offline-cmd  --add-port=80/tcp
sudo firewall-offline-cmd  --add-port=443/tcp
sudo systemctl restart firewalld
# Add additional environment information 
sudo bash -c "echo 'export OKIT_DIR=:${OKIT_DIR}' >> /etc/bashrc"
sudo bash -c "echo 'export PYTHONPATH=:${OKIT_DIR}/modules:${OKIT_DIR}/okitserver:/okit' >> /etc/bashrc"
sudo bash -c "echo 'export PATH=$PATH:/usr/local/bin' >> /etc/bashrc"
# Generate ssl Self Sign Key
sudo bash -c "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ${OKIT_DIR}/ssl/okit.key -out ${OKIT_DIR}/ssl/okit.crt -subj '/C=GB/ST=Berkshire/L=Reading/O=Oracle/OU=OKIT/CN=www.oci_okit.com'"

##################################################################################################################
#####                        If HTTPS / 443 Is required                                                      #####
##### Copy GUnicorn Service File (HTTPS)                                                                     #####
##################################################################################################################
sudo bash -c "cp -v ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/containers/services/gunicorn.https.service /etc/systemd/system/gunicorn.service"
##################################################################################################################
#####                        If HTTP / 80 Is required                                                        #####
##### Copy GUnicorn Service File (HTTP)                                                                      #####
##################################################################################################################
sudo bash -c "cp -v ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/containers/services/gunicorn.http.service /etc/systemd/system/gunicorn.service"

# Enable Gunicorn Service
sudo systemctl enable gunicorn.service
sudo systemctl start gunicorn.service
sudo systemctl status gunicorn.service
```





















## Container

### Docker / Rancher Desktop

The docker image  can be built and started using the scripts in the docker sub directory.
It should be noted that the current Docker script is designed for development purposes and mounts the source directories
at runtime. 

#### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop) or Rancher Desktop.
- Create local directory __~/okit/user/templates__ for storage of custom templates.
- [Copy Config & Key Files](#copy-config--key-files)

#### Docker Build
```bash
cd oci-designer-toolkit
docker build --tag okit --file ./containers/docker/Dockerfile --force-rm .
```

#### Docker Update
```bash
cd oci-designer-toolkit
docker rmi okit
docker build --tag okit --no-cache --file ./Dockerfile --force-rm .
```

#### Start Docker Container
```bash
cd oci-designer-toolkit
docker run -d --rm -p 80:80 
        --name okit \
        --hostname okit \
        --volume <USER HOME DIR>/.oci:/root/.oci \
        --volume <USER HOME DIR>/.ssh:/root/.ssh \
        --volume <PATH TO USER TEMPLATES DIR>:/okit/instance/templates/user \
        --volume <PATH TO GIT DIR>:/okit/instance/git \
        --volume <PATH TO LOCAL DIR>:/okit/instance/local \
        okit
```

### Quick Start Runtime

Docker is the recommended runtime container for OKIT and the project contains a top-level Dockerfile to facilitate direct
building, of the runtime environment, from the docker command line.

#### Build Docker Container
```bash
docker build --tag okit --no-cache --force-rm https://github.com/oracle/oci-designer-toolkit.git
```

#### Run Container

```bash
docker run -d --rm -p 80:80 --volume <USER HOME DIR>/okit/user/templates:/okit/templates --volume <USER HOME DIR>/.oci:/root/.oci --volume <USER HOME DIR>/.ssh:/root/.ssh --name okit okit
```

Once started the Designer BUI can be accessed on [http://localhost/okit/designer](http://localhost/okit/designer)

### Lima (MacOS)

[Lima](https://github.com/lima-vm/lima) is an alternative option to Docker Desktop to run a container based OKIT installation on MacOS. 
It will build a container based on the existing Dockerfile without any modifications.

Install Lima using Homebrew
```bash
brew install lima
```

Lima runs a Linux VM in the background that is used for running the containers, to start the Lima VM service run
```bash
limactl start
```

Lima uses containerd as its container run-time and nertctl as the Docker-compatible CLI for containerd. 
As containerd is running in the VM, not on the Mac directly the lima command passes the nerdctl commands to the VM.  
For most docker commands the equivalent is to run lima nerdctl

With Lima installed and running we need to build the OKIT container, replacing the regular docker build with
```bash
cd oci-designer-toolkit
lima nerdctl rmi okit
lima nerdctl build --tag okit --no-cache --file ./Dockerfile .
```

Run OKIT using the container run command, adjust or add additional required volume mounts as required
```bash
lima nerdctl run --rm -p 80:80 \
        --name okit \
        --hostname okit \
        --volume <USER HOME DIR>/.oci:/root/.oci \
        --volume <USER HOME DIR>/.ssh:/root/.ssh \
        --volume <PATH TO USER TEMPLATES DIR>:/okit/instance/templates/user \
        --volume <PATH TO GIT DIR>:/okit/instance/git \
        --volume <PATH TO LOCAL DIR>:/okit/instance/local \
        okit
```

To stop the OKIT container
```bash
lima nerdctl stop okit
```

To stop the Lima service VM
```bash
limactl stop
```

### Vagrant / VirtualBox

#### Prerequisites
- Install [Oracle VM VirtualBox](https://www.virtualbox.org/wiki/Downloads)
- Install [Vagrant](https://vagrantup.com/)
- Create local directory __~/okit/user/templates__ for storage of custom templates.
- [Copy Config & Key Files](#copy-config--key-files)

#### Vagrant Build

##### MacOS / Linux
```bash
cd oci-designer-toolkit/containers/vagrant
vagrant up; vagrant reload; vagrant ssh
```
##### Windows
```bash
cd oci-designer-toolkit\containers\vagrant
vagrant up & vagrant reload & vagrant ssh
```
**NOTE**: This step takes about 30 minutes on my mac when you build the VM, a little longer the first time as the Vbox image 
is downloaded from github. Once the VM is built the vagrant up should just take a few seconds.








