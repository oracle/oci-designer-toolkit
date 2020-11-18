#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates.
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
source /etc/bashrc

# Upgrade pip
python3 -m pip install --upgrade pip==20.0.2

# Install required python modules
pip3 install --no-cache-dir \
      flask==1.1.1 \
      gunicorn==20.0.4 \
      oci==2.22.0 \
      pandas==1.1.2 \
      python-magic==0.4.18 \
      pyyaml==5.3.1 \
      requests==2.24.0 \
      xlsxwriter==1.3.6

