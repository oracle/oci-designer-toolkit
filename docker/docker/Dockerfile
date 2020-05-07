
# Copyright © 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

ARG os_version=7-slim
ARG os=oraclelinux
FROM ${os}:${os_version}
LABEL version="0.5.0" \
      description="OKIT Web Server." \
      copyright="Copyright (c) 2020, Oracle and/or its affiliates."
SHELL ["/bin/bash", "-c"]
ENV http_proxy=${http_proxy} \
    https_proxy=${https_proxy} \
    PYTHONIOENCODING=utf8 \
    PYTHONPATH=":/okit/visualiser:/okit/okitweb:/okit" \
    FLASK_APP=okitweb \
    FLASK_DEBUG=development \
    LANG=en_GB.UTF-8 \
    LANGUAGE=en_GB:en \
    LC_ALL=en_GB.UTF-8 \
    PATH=/root/bin:${PATH}

# Update base image
# Install new yum repos
RUN yum install -y \
    oracle-softwarecollection-release-el7 \
#   Required for nginx
    oracle-epel-release-el7 \
# Install additional packages
 && yum update -y \
 && yum install -y \
        nginx-1.12.2-2.el7 \
        python36 \
        python3-pip \
 && yum clean all \
# Install pip
 && cd /tmp ; \
    python3 -m pip install --upgrade pip==20.0.2 ; \
    cd ~ \
# Install required python modules
 && cd /tmp ; \
    pip3 install --no-cache-dir \
        click==7.0 \
        flask==1.1.1 \
        gunicorn==20.0.4 \
        itsdangerous==1.1.0 \
        jinja2==2.10.3 \
        markupsafe==1.1.1 \
        oci==2.6.0 \
        pyyaml==5.2 \
        werkzeug==0.16.0 \
        cryptography==2.8 \
# Create Workspace
 && mkdir -p /workspace; \
    mkdir -p /okit/{config,visualiser,okitweb,workspace}; \
    env | sort
# Copy nginx conf information
COPY okit_nginx.conf /etc/nginx/conf.d/okit.conf
COPY nginx.conf /etc/nginx/nginx.conf
