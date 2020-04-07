
# Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

ARG os_version=latest
ARG os=oraclelinux
FROM ${os}:${os_version}
LABEL version="0.4.0"
LABEL description="OKIT Web Server."
SHELL ["/bin/bash", "-c"]
ENV http_proxy ${http_proxy}
ENV https_proxy ${https_proxy}
# Set Python Variables
ENV PYTHONIOENCODING=utf8
ENV PYTHONPATH=":/okit/visualiser:/okit/okitweb:/okit"
# Flask
ENV FLASK_APP=okitweb
ENV FLASK_DEBUG=development
# Define System
ENV LANG en_GB.UTF-8
ENV LANGUAGE en_GB:en
ENV LC_ALL en_GB.UTF-8
ENV PATH=/root/bin:${PATH}

# Update base image
RUN yum update -y ; \
    if [ ! -z /usr/bin/ol_yum_configure.sh ]; then /usr/bin/ol_yum_configure.sh;yum update -y; fi \
# Install new yum repos
# Configure new OL package list
 && yum install -y \
#    oracle-softwarecollection-release-el7 \
#    oraclelinux-developer-release-el7 \
    oracle-epel-release-el7 \
 && yum repolist all \
# Install additional packages
 && yum update -y \
 && yum install -y \
        nginx-1.12.2-2.el7 \
        python36 \
        python3-pip \
 && yum repolist all \
 && yum clean all \
# Install pip
 && rm -fv /usr/bin/python3 ; \
    ln -sv /usr/bin/python3.6 /usr/bin/python3 ; \
    cd /tmp ; \
    python3 -m pip install --upgrade pip==20.0.2 ; \
    cd ~ \
# Install required python modules
 && cd /tmp ; \
    pip3 install \
        click==7.0 \
        flask==1.1.1 \
        gunicorn==20.0.4 \
        itsdangerous==1.1.0 \
        jinja2==2.10.3 \
        markupsafe==1.1.1 \
        oci==2.6.0 \
        pyyaml==5.2 \
        werkzeug==0.16.0 \
# Set-up env
 && echo ''                                                                          >> /etc/bashrc ; \
    echo "alias lh='ls -lash' "                                                      >> /etc/bashrc ; \
    echo "alias lt='ls -last' "                                                      >> /etc/bashrc ; \
    echo "alias env='/usr/bin/env | sort' "                                          >> /etc/bashrc ; \
    echo "alias ips='ip -f inet address' "                                           >> /etc/bashrc ; \
    echo "alias pymods='for m in \$(pip3 list | cut -d \" \" -f 1); do echo; pip3 show \${m} 2>/dev/null; done'" >> /etc/bashrc ; \
    echo ''                                                                          >> /etc/bashrc ; \
    echo 'export PATH=/opt/python/bin:${PATH} '                                      >> /etc/bashrc ; \
    echo ''                                                                          >> /etc/bashrc ; \
    cd ~  \
# Create Workspace
 && mkdir -p /workspace; \
    mkdir -p /okit/{config,visualiser,okitweb,workspace}; \
    env | sort
# Copy nginx conf information
COPY okit_nginx.conf /etc/nginx/conf.d/okit.conf
COPY nginx.conf /etc/nginx/nginx.conf
