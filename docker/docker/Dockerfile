
# Copyright © 2020, Oracle and/or its affiliates. All rights reserved.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

ARG os_version=latest
ARG os=oraclelinux
FROM ${os}:${os_version}
LABEL version="1.0"
LABEL description="OKIT OCI Web Designer Server."
SHELL ["/bin/bash", "-c"]
ENV http_proxy ${http_proxy}
ENV https_proxy ${https_proxy}
# Set Python Variables
ENV PYTHONIOENCODING=utf8
ENV PYTHONPATH=":/okit/visualiser:/okit/okitweb:/okit"
# Specify Ansible Config variables
ENV ANSIBLE_CONFIG_DIR=/okit/config/ansible
ENV ANSIBLE_INVENTORY=${ANSIBLE_CONFIG_DIR}/ansible_hosts
ENV ANSIBLE_CONFIG=${ANSIBLE_CONFIG_DIR}/ansible.cfg
ENV ANSIBLE_LIBRARY=${SRC}:${ANSIBLE_LIBRARY}
# Flask
ENV FLASK_APP=okitweb
ENV FLASK_DEBUG=development
# Define System
ENV LANG en_GB.UTF-8
ENV LANGUAGE en_GB:en
ENV LC_ALL en_GB.UTF-8
ENV PATH=/root/bin:${PATH}

# Add ol addons repo to yum
#RUN yum-config-manager --enable *_addons *_developer

# Update base image
RUN yum update -y ; \
    if [ ! -z /usr/bin/ol_yum_configure.sh ]; then /usr/bin/ol_yum_configure.sh;yum update -y; fi \
# Install new yum repos
# Configure new OL package list
 && yum install -y \
    oracle-softwarecollection-release-el7 \
    oraclelinux-developer-release-el7 \
    oracle-epel-release-el7 \
 && yum repolist all \
# Install additional packages
 && yum update -y && yum install -y \
        ansible \
        curl \
        git \
        make \
        nginx \
        openssl \
        #python \
        python36 \
        sudo \
        tar \
        terraform \
        tree \
        unzip \
        wget \
        zip \
 && yum repolist all \
 && yum clean all \
# Install pip
 && rm -fv /usr/bin/python3 ; \
    ln -sv /usr/bin/python3.6 /usr/bin/python3 ; \
    cd /tmp ; \
    curl https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py ; \
    python3 /tmp/get-pip.py ; \
    pip3 install --upgrade pip ; \
    cd ~ \
# Install required python modules
 && cd /tmp ; \
    pip3 install \
        #ansible \
        flask==1.1.1 \
        gunicorn==20.0.4 \
        itsdangerous==1.1.0 \
        jinja2==2.10.3 \
        markupsafe==1.1.1 \
        oci==2.6.0 \
        pyyaml==5.2 \
        werkzeug==0.16.0 \
# Install oci ansible module
 && cd /tmp ; \
    git clone https://github.com/oracle/oci-ansible-modules.git ; \
    cd oci-ansible-modules ; \
    python3 ./install.py \
# Set-up env
 && echo ''                                                                          >> /etc/bashrc ; \
    echo "alias lh='ls -lash' "                                                      >> /etc/bashrc ; \
    echo "alias lt='ls -last' "                                                      >> /etc/bashrc ; \
    echo "alias env='/usr/bin/env | sort' "                                          >> /etc/bashrc ; \
    echo "alias ips='ip -f inet address' "                                           >> /etc/bashrc ; \
    echo "alias ssh='/usr/bin/ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -oConnectTimeout=10' " >> /etc/bashrc ; \
    echo "alias scp='/usr/bin/scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -oConnectTimeout=10' " >> /etc/bashrc ; \
    echo "alias sshopc='ssh -i /okit/config/ssh/id_rsa_oci_test' "                   >> /etc/bashrc ; \
    echo "alias scpopc='scp -i /okit/config/ssh/id_rsa_oci_test' "                   >> /etc/bashrc ; \
    echo ''                                                                          >> /etc/bashrc ; \
    echo 'export PATH=/opt/python/bin:${PATH} '                                      >> /etc/bashrc ; \
    echo "alias ta='terraform apply da.plan' "                                                     >> /etc/bashrc ; \
    echo "alias td='terraform destroy -var-file=/okit/config/connection.tfvars -auto-approve' "    >> /etc/bashrc ; \
    echo "alias tp='terraform plan -var-file=/okit/config/connection.tfvars -out=da.plan' "        >> /etc/bashrc ; \
    echo "alias ti='terraform init' "                                                              >> /etc/bashrc ; \
    echo "alias tg='terraform get --update' "                                                      >> /etc/bashrc ; \
    echo "alias apa='ansible-playbook main.yml --extra-vars \"@/okit/config/connection.yml\" ' "   >> /etc/bashrc ; \
    echo "alias wtd='terraform destroy -var-file=/okit/config/wizards.tfvars -auto-approve' "      >> /etc/bashrc ; \
    echo "alias wtp='terraform plan -var-file=/okit/config/wizards.tfvars -out=da.plan' "          >> /etc/bashrc ; \
    echo "alias otunzip='unzip -o okit-terraform.zip -d okit-terraform' "                          >> /etc/bashrc ; \
    echo "alias oaunzip='unzip -o okit-ansible.zip -d okit-ansible' "                              >> /etc/bashrc ; \
    cd ~  \
# Create Workspace
 && mkdir -p /workspace; \
    mkdir -p /okit/{ansible,config,converter,terraform,visualiser,okitweb,workspace,python,unittests,preview}; \
    env | sort
# Copy nginx conf information
COPY okit_nginx.conf /etc/nginx/conf.d/okit.conf
COPY nginx.conf /etc/nginx/nginx.conf
