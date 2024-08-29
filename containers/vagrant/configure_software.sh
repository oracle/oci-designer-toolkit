#!/bin/bash

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export PATH=/usr/local/bin:/usr/bin:${PATH}

# Install new yum repos
yum install -y \
  oraclelinux-developer-release-el7 \
  oracle-softwarecollection-release-el7
# Update base image
yum update -y
# Install additional packages
yum install -y \
    git \
    python36 \
    python3-pip
# Clean Yum
rm -rf /var/cache/yum

# Add Environment
echo 'export PYTHONIOENCODING="utf8"'                                            >> /etc/bashrc
echo 'export PYTHONPATH=":/okit/visualiser:/okit/okitweb:/okit"'                 >> /etc/bashrc
echo 'export FLASK_APP=okitweb'                                                  >> /etc/bashrc
echo 'export FLASK_DEBUG=development'                                            >> /etc/bashrc
echo ''                                                                          >> /etc/bashrc
echo 'export PATH=/opt/python/bin:${PATH} '                                      >> /etc/bashrc
echo ''                                                                          >> /etc/bashrc
echo "alias startflask='python3 -m flask run --host=0.0.0.0 --port=80 --no-debugger'" >> /etc/bashrc
echo "alias startgunicorn='gunicorn --bind=0.0.0.0:80 --workers=2 --limit-request-line 0 '\''okitweb:create_app()'\'''" >> /etc/bashrc
echo "alias startnginx='nginx;gunicorn --workers=2 --limit-request-line 0 --bind=0.0.0.0:5000 okitweb.wsgi:app'" >> /etc/bashrc
echo ''                                                                          >> /etc/bashrc

echo 'export OKIT_DIR=/okit' >> /etc/bashrc
echo 'export OKIT_GITHUB_DIR=/okit_github' >> /etc/bashrc
echo 'export OKIT_BRANCH="master"' >> /etc/bashrc

source /etc/bashrc

# Create Directories
mkdir -p ${OKIT_DIR}
mkdir -p ${OKIT_GITHUB_DIR}
chmod 777 ${OKIT_DIR}
chmod 777 ${OKIT_GITHUB_DIR}
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
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/config ${OKIT_DIR}/config
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitweb ${OKIT_DIR}/okitweb
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/visualiser ${OKIT_DIR}/visualiser
ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitweb/static/okit/templates/reference_architecture ${OKIT_DIR}/instance/templates/reference_architecture

