# OCI Kinetic Infrastructure Toolkit

OCI Kinetic Infrastructure Toolkit (OKIT) is a a series of tools that allow the user to Query, Capture, Visualise and
Generate DevOps tooling scripts. Using the toolkit the DevOps user will be able to capture existing OCI environments,
through simple command line or web based interface, and then convert them to standard DevOps languages (see below). 
The web based drawing toll can also be used to generate simple architectural representations of customer systems that 
can quickly be turned into code and ultimately built in the OCI environment.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
    1. [Currently Implement Artifacts](#currently-implement-artifacts)
    2. [Prerequisites](#prerequisites)
    3. [Web Interface](#web-interface)
    4. [Command Line](#command-line)
3. [Development](#development)
4. [Contributing](#contributing)
5. [Examples](#examples)

## Installation
Although OKIT can simply be downloaded and the command line executed it is recommended that it be executed within a
docker container that can be built using the Dockerfile within this repository. This will guarantee that all the required 
python modules are installed and in addition provide a simple flask server that will present the web based application on
[http://localhost:8080/okit/designer](http://localhost:8080/okit/designer).

Therefore these installation instructions will describe the docker based implementation.

```bash
anhopki-mac:tmp anhopki$ git clone git@orahub.oraclecorp.com:andrew.hopkinson/okit.oci.web.designer.git

Cloning into 'okit.oci.web.designer'...
===============================================================================
            Oracle USA Inc. - Unauthorized Access Strictly Prohibited
-------------------------------------------------------------------------------
   WARNING: This is a restricted access server. If you do not have explicit
            permission to access this server, please disconnect immediately.
            Unauthorized access to this system is considered gross misconduct
            and may result in disciplinary action, including revocation of
            access privileges, immediate termination of employment.
===============================================================================
remote: Enumerating objects: 448, done.
remote: Counting objects: 100% (448/448), done.
remote: Compressing objects: 100% (208/208), done.
remote: Total 1455 (delta 287), reused 376 (delta 229)00 KiB/s
Receiving objects: 100% (1455/1455), 604.46 KiB | 798.00 KiB/s, done.
Resolving deltas: 100% (859/859), done.

anhopki-mac:tmp anhopki$ cd okit.oci.web.designer/docker/
anhopki-mac:docker anhopki$ lh

total 56
0 drwxr-xr-x  10 anhopki  staff   320B 15 Aug 10:08 .
0 drwxr-xr-x   9 anhopki  staff   288B 15 Aug 10:08 ..
8 -rwxr-xr-x   1 anhopki  staff   932B 15 Aug 10:08 build-docker-image.sh
8 -rwxr-xr-x   1 anhopki  staff   238B 15 Aug 10:08 connect-flask-bash-shell.sh
8 -rwxr-xr-x   1 anhopki  staff   241B 15 Aug 10:08 connect-gunicorn-bash-shell.sh
0 drwxr-xr-x   3 anhopki  staff    96B 15 Aug 10:08 docker
8 -rwxr-xr-x   1 anhopki  staff   1.6K 15 Aug 10:08 docker-env.sh
8 -rwxr-xr-x   1 anhopki  staff   512B 15 Aug 10:08 start-bash-shell.sh
8 -rwxr-xr-x   1 anhopki  staff   621B 15 Aug 10:08 start-flask.sh
8 -rwxr-xr-x   1 anhopki  staff   654B 15 Aug 10:08 start-gunicorn.sh

anhopki-mac:docker anhopki$ ./build-docker-image.sh
```

## Usage
### Currently Implement Artifacts
In the present release the following OCI artifacts have been implemented. The information captured in the properties may 
only be the minimum to create the artifacts but will be extended in the future.
- Virtual Cloud Network 
- Internet Gateway
- Route Table
- Security List
- Subnet
- Instance
- Load Balancer

### Prerequisites
Before executing any of the docker container scripts we OKIT requires that a OCI connection configuration file be created.
This file will contain the following:
```properties
[DEFAULT]
user=ocid1.user.oc1..aaaaaaaak6z......
fingerprint=3b:7e:37:ec:a0:86:1....
key_file=/root/.oci/oci_api_key.pem
tenancy=ocid1.tenancy.oc1..aaaaaaaawpqblfem........
region=us-phoenix-1

```
You will then need to create the following environment variable that points to the directory containing the config file.

```bash
export OCI_CONFIG_DIR=~/.oci/oci.config
```

### Web Interface
To use the Web Application you will first need to start the docker container and run either flask or gunicorn which can 
be achieved by running either of the following scripts, that can be found in the docker sub-directory.
```bash
anhopki-mac:docker anhopki$ ./start-flask.sh

DOCKERIMAGE = development/orahub/andrew.hopkinson/okit.oci.web.designer
/okit
HOSTNAME=start-flask
TERM=xterm
ANSIBLE_INVENTORY=/okit/ansible/config/ansible_hosts
LC_ALL=en_GB.UTF-8
FLASK_APP=okitweb
PYTHONIOENCODING=utf8
http_proxy=
ftp_proxy=
ANSIBLE_LIBRARY=:
PATH=/root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
PWD=/okit
LANG=en_GB.UTF-8
FLASK_DEBUG=development
https_proxy=
SHLVL=1
HOME=/root
LANGUAGE=en_GB:en
no_proxy=*
ANSIBLE_CONFIG_DIR=/okit/ansible/config
PYTHONPATH=:/okit/visualiser:/okit/okitweb:/okit
ANSIBLE_CONFIG=/okit/ansible/config/ansible.cfg
_=/usr/bin/env
 * Serving Flask app "okitweb" (lazy loading)
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: on
 * Running on http://0.0.0.0:8080/ (Press CTRL+C to quit)
 * Restarting with stat
```

```bash
anhopki-mac:docker anhopki$ ./start-gunicorn.sh

DOCKERIMAGE = development/orahub/andrew.hopkinson/okit.oci.web.designer
/okit/okitweb
HOSTNAME=start-gunicorn
TERM=xterm
ANSIBLE_INVENTORY=/okit/ansible/config/ansible_hosts
LC_ALL=en_GB.UTF-8
FLASK_APP=okitweb
PYTHONIOENCODING=utf8
http_proxy=
ftp_proxy=
ANSIBLE_LIBRARY=:
PATH=/root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
PWD=/okit/okitweb
LANG=en_GB.UTF-8
FLASK_DEBUG=development
https_proxy=
SHLVL=1
HOME=/root
LANGUAGE=en_GB:en
no_proxy=*
ANSIBLE_CONFIG_DIR=/okit/ansible/config
PYTHONPATH=:/okit/visualiser:/okit/okitweb:/okit
ANSIBLE_CONFIG=/okit/ansible/config/ansible.cfg
_=/usr/bin/env
[2019-08-15 14:32:05 +0000] [7] [INFO] Starting gunicorn 19.9.0
[2019-08-15 14:32:05 +0000] [7] [INFO] Listening at: http://0.0.0.0:8080 (7)
[2019-08-15 14:32:05 +0000] [7] [INFO] Using worker: sync
[2019-08-15 14:32:05 +0000] [10] [INFO] Booting worker with pid: 10
[2019-08-15 14:32:05 +0000] [11] [INFO] Booting worker with pid: 11
```
#### Designer
The Designer consists of 3 main areas.
1. Palette
2. Canvas
3. Properties Sheet

The palette should all currently available assets and they can be dragged from the palette on the canvas below. During the 
drag process the icon will indicate if the palette icon can be dropped on the underlying component. If appropriate a "+" 
sign will be displayed. Once the icon has been dropped the appropriate properties sheet will be displayed for the new asset.

If assets (e.g. subnet) are dropped within a containing asset (e.g. virtual cloud network) then it will be associated with the 
containing asset. Alternatively assets may be linked using connectors which can be dragged from the asset to associate
(e.g. route table) to the associated asset (e.g. subnet). Again the drop is only appropriate on certain components and 
the web front end will restrict this.

A simple diagram representing a virtual Cloud Network with associated Internet Gateway, Route Table, Security List and 
Instances fronted by a Load Balancer can be seen below.

![OKIT Designer Canvas](documentation/images/okit_web_interface.png?raw=true "OKIT Designer Canvas")

The hamburger menu in the top left will display a slide out menu with all available actions (described below).

##### Palette
- <img src="okitweb/static/okit/palette/Virtual_Cloud_Network.svg?sanitize=true" width="30" height="30"/> Virtual Cloud Network 
- <img src="okitweb/static/okit/palette/Internet_Gateway.svg?sanitize=true" width="30" height="30"/> Internet Gateway
- <img src="okitweb/static/okit/palette/Route_Table.svg.svg?sanitize=true" width="30" height="30"/> Route Table
- <img src="okitweb/static/okit/palette/Security_List.svg.svg?sanitize=true" width="30" height="30"/> Security List
- <img src="okitweb/static/okit/palette/Subnet.svg.svg?sanitize=true" width="30" height="30"/> Subnet
- <img src="okitweb/static/okit/palette/Instance.svg.svg?sanitize=true" width="30" height="30"/> Instance
- <img src="okitweb/static/okit/palette/Load_Balancer.svg.svg?sanitize=true" width="30" height="30"/> Load Balancer

##### Menu 
![OKIT Web Interface Menu](documentation/images/okit_menu.png?raw=true "OKIT Web Interface Menu")

- File
    - New
    - Load
    - Save
- Canvas
    - Redraw
- Export
    - SVG
    - Resource Manager
    - Orca
- Query
    - OCI
- Generate
    - Terraform
    - Ansible

###### File/New
Creates a new clear canvas.
###### File/Load
Allows the user to select a previously saved or command line generated json file.
###### File/Save
Saves the current diagram as a json representation.
###### Canvas/Redraw
Redraws the existing canvas this will have the effect of grouping similar assets.
###### Export/SVG
Will export the current diagram as an SVG object that can be distributed.
###### Export/Resource Manager
***(WIP)*** Will generate Terraform code and export the resulting zip file into the OCI Resource Manager.
###### Export/Orca
***(WIP)*** Convert the OKIT JSON format to Orca input format.
##### Query/OCI
Opens Query pages and populates the Compartment list. Once the user has chosen the compartment and added a virtual cloud network 
filter submitting will query OCI and draw the returning assets on the new designer canvas.
##### Generate/Terraform
Generate a set of Terraform that can be used to build the designed OCI infrastructure currently loaded and return as a zip file.
##### Generate/Ansible
Generate a set of Ansible that can be used to build the designed OCI infrastructure currently loaded  and return as a zip file.

### Command Line
To use the Command Line you will first need to start the docker container using the following script:
```bash
anhopki-mac:docker anhopki$ ./start-bash-shell.sh
DOCKERIMAGE = development/orahub/andrew.hopkinson/okit.oci.web.designer
[root@start-bash-shell workspace]#
```
Alternatively if you are running the Webb Application you can connect to the existing docker contain using either:

- connect-flask-bash-shell.sh
- connect-gunicorn-bash-shell.sh

The command line interface consists of a number of python programs as follows:
#### Capture
***(WIP)*** The capture python will connect to the specified OCI instance (defaults to config in users home directory) and 
queries OCI based on the specified filters. The resulting data is then written to the specified OKIT json file (okit.json)
and can be subsequently imported into the web based interface or used to generate the DevOps files (see [Generate](#generate)).
#### Validate
***(WIP)*** The validate python will read the specified OKIT json file (okit.json) and check if the references are consistent.
#### Generate
The generate python process takes a specified OKIT json file (okit.json) and converts it to a number terraform or ansible 
files that can then be used with the appropriate DevOps tooling to build the artifacts defined within the json file.
```bash
# Generate Terraform
python3 generate.py -f okit.json -d destination_directory -t

# Generate Ansible
python3 generate.py -f okit.json -d destination_directory -a

# Generate Terraform & Ansible
python3 generate.py -f okit.json -d destination_directory -t -a
```
#### Generate TF from OCI
This test program will connect to OCI with the default configuration and query based on the specified filter (-c) then generate
appropriate yerraform files below the specified directory.
```bash
cd test/unit.test
python3 ./generateTFfromOCI.py -d . -c Stefan
```

## Development

## Contributing

Bug reports, enhancement request and pull requests are welcome on the OraHub at [okit.oci.web.designer/issues](https://orahub.oraclecorp.com/cloud-tools-ateam/okit.oci.web.designer/issues)

## Examples

## Cleanup

