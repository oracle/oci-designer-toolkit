ARG os_version=latest
ARG os=oraclelinux
FROM ${os}:${os_version}
ARG PREVIEW
LABEL version="1.0"
LABEL description="OKIT OCI Web Designer Server."
SHELL ["/bin/bash", "-c"]
ENV http_proxy ${http_proxy}
ENV https_proxy ${https_proxy}
# Set Python Variables
ENV PYTHONIOENCODING=utf8
ENV PYTHONPATH=":/okit/visualiser:/okit/okitweb:/okit"
# Specify Ansible Config variables
ENV ANSIBLE_CONFIG_DIR=/okit/ansible/config
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
        asciinema \
        #curl-devel \
        curl \
        #expat-devel \
        expa \
        gcc \
        #gettext-devel \
        gettext \
        git \
        java \
        jq \
        kpartx \
        libffi-devel \
        libssl-dev \
        lvm2 \
        make \
        nfs-utils \
        nginx \
        #openssl-devel \
        openssl \
        #python-devel \
        python \
        python36 \
        #python36-devel \
        #python36u-devel \
        rpm-build \
        sudo \
        tar \
        terraform \
        traceroute \
        tree \
        wget \
        #zlib-devel \
        zlib \
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
        ansible \
        asciinema \
        configparser \
        flask \
        flask-cors \
        flask_restful \
        gunicorn \
        ipaddress \
        ipcalc \
        jinja2 \
        oci \
        pexpect \
        pyyaml \
        requests \
        simplejson \
        six \
        wtforms \
        xlrd \
# Set-up env
 && echo ''                                                                          >> /etc/bashrc ; \
    echo "alias lh='ls -lash' "                                                      >> /etc/bashrc ; \
    echo "alias lt='ls -last' "                                                      >> /etc/bashrc ; \
    echo "alias env='/usr/bin/env | sort' "                                          >> /etc/bashrc ; \
    echo "alias ssh='/usr/bin/ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -oConnectTimeout=10' " >> /etc/bashrc ; \
    echo "alias sshopc='ssh -i /okit/config/ssh/id_rsa_oci_test' "                   >> /etc/bashrc ; \
    echo ''                                                                          >> /etc/bashrc ; \
    echo 'export PATH=/opt/python/bin:${PATH} '                                      >> /etc/bashrc ; \
    cd ~  \
# Create Workspace
 && mkdir -p /workspace; \
    mkdir -p /okit/{ansible,config,terraform,visualiser,okitweb,workspace,python,unittests,preview}; \
    env | sort

# Add preview cli
#ADD "oci-cli-full-install-2.6.1+preview.1.2863.zip" /okit/preview
# Install OCI cli
#RUN if [[ -n "${PREVIEW}" ]] ; then cd /okit/preview ; \
#    unzip oci-cli-full-install-2.6.1+preview.1.2863.zip -d oci-cli ; \
#    cd oci-cli ; \
#    sed -i '0,/< \$_TTY/s///' /okit/preview/oci-cli/install.sh ; \
#    sed -i '/< \$_TTY/s///' /okit/preview/oci-cli/install.sh ; \
#    chmod 777 /okit/preview/oci-cli/install.sh ; \
#    /okit/preview/oci-cli/install.sh --accept-all-defaults ; \
#    echo 'export PATH=/root/lib/oracle-cli/bin:${PATH} '                             >> /etc/bashrc ; \
#    cd /tmp  \
#    /root/lib/oracle-cli/bin/pip3 install \
#        ansible \
#        asciinema \
#        configparser \
#        flask \
#        flask-cors \
#        flask_restful \
#        gunicorn \
#        ipaddress \
#        ipcalc \
#        jinja2 \
#        oci \
#        pexpect \
#        pyyaml \
#        requests \
#        simplejson \
#        six \
#        wtforms \
#        xlrd ; \
#    fi

#ENV PATH=${PREVIEW:+/root/lib/oracle-cli/bin:}${PATH}

