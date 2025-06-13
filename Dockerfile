
# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

FROM oraclelinux:8
ARG BRANCH=master
LABEL "provider"="Oracle" \
      "issues"="https://github.com/oracle/oci-designer-toolkit/issues" \
      "version"="0.69.1" \
      "description"="OKIT Web Server Container." \
      "copyright"="Copyright (c) 2020, 2024, Oracle and/or its affiliates."
# SHELL ["/bin/bash", "-c"]
ENV PYTHONIOENCODING=utf8 \
    PYTHONPATH=":/okit/modules:/okit/okitserver:/okit" \
    FLASK_APP=okitserver \
    FLASK_DEBUG=1 \
    LANG=en_GB.UTF-8 \
    LANGUAGE=en_GB:en \
    LC_ALL=en_GB.UTF-8 \
    PATH=/root/bin:${PATH} \
    OKIT_DIR=/okit \
    OKIT_GITHUB_DIR=/okit_github
# Expose Ports
EXPOSE 80
EXPOSE 443
# Install new yum repos
RUN yum install -y \
    oraclelinux-developer-release-el8 \
# Update base image
 && yum update -y \
# Install additional packages
 && yum install -y \
        git \
        openssl \
        python38 \
        python38-pip \
 && rm -rf /var/cache/yum \
 && alternatives --set python3 /usr/bin/python3.8 \
# Configure ssh
 && echo 'Host *' > /etc/ssh/ssh_config \
 && echo '  StrictHostKeyChecking no' >> /etc/ssh/ssh_config \
 && echo '  UserKnownHostsFile=/dev/null' >> /etc/ssh/ssh_config \
# Upgrade pip
 && python3 -m pip install --upgrade pip \
# Create Workspace
 && mkdir -p ${OKIT_GITHUB_DIR} \
 && echo "Branch: $BRANCH" \
 && git clone --branch $BRANCH --single-branch \
            --config core.autocrlf=input \ 
            https://github.com/oracle/oci-designer-toolkit.git ${OKIT_GITHUB_DIR}/oci-designer-toolkit \
 && mkdir -p ${OKIT_DIR}/{git,local,log,instance/git,instance/local,instance/templates/user,workspace,ssl} \
 && mkdir -p /root/bin \
 && ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/config ${OKIT_DIR}/config \
 && ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/okitserver ${OKIT_DIR}/okitserver \
 && ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/modules ${OKIT_DIR}/modules \
 && ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/containers/docker/run-server.sh /root/bin/run-server.sh \
 && ln -sv ${OKIT_GITHUB_DIR}/oci-designer-toolkit/okitclassic/okitserver/static/okit/templates/reference_architecture ${OKIT_DIR}/instance/templates/reference_architecture \
 && chmod a+x /root/bin/run-server.sh \
# Install required python modules
 && python3 -m pip install --no-cache-dir -r ${OKIT_GITHUB_DIR}/oci-designer-toolkit/requirements.txt
# Add entrypoint to automatically start webserver
CMD ["run-server.sh"]
