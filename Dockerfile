
# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

FROM oraclelinux:8
ARG BRANCH=master
LABEL "provider"="Oracle" \
      "issues"="https://github.com/oracle/oci-designer-toolkit/issues" \
      "version"="0.55.0" \
      "description"="OKIT Web Server Container." \
      "copyright"="Copyright (c) 2020, 2022, Oracle and/or its affiliates."
# SHELL ["/bin/bash", "-c"]
ENV PYTHONIOENCODING=utf8 \
    PYTHONPATH=":/okit/visualiser:/okit/okitweb:/okit" \
    FLASK_APP=okitweb \
    FLASK_DEBUG=1 \
    LANG=en_GB.UTF-8 \
    LANGUAGE=en_GB:en \
    LC_ALL=en_GB.UTF-8 \
    PATH=/root/bin:${PATH}
# Expose Ports
EXPOSE 80
EXPOSE 443
# Copy source code
# COPY containers/oci/* /root/.oci/
# COPY containers/docker/run-server.sh /root/bin/
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
        python3-pip \
 && rm -rf /var/cache/yum \
 && alternatives --set python3 /usr/bin/python3.8 \
# Configure ssh
 && echo 'Host *' > /etc/ssh/ssh_config \
 && echo '  StrictHostKeyChecking no' >> /etc/ssh/ssh_config \
 && echo '  UserKnownHostsFile=/dev/null' >> /etc/ssh/ssh_config \
# Upgrade pip
 && python3 -m pip install --upgrade pip \
# Create Workspace
 && mkdir -p /github \
 && echo "Branch: $BRANCH" \
 && git clone --branch $BRANCH --single-branch \
            --config core.autocrlf=input \ 
            https://github.com/oracle/oci-designer-toolkit.git /github/oci-designer-toolkit \
 && mkdir -p /okit/{git,local,log,instance/git,instance/local,instance/templates/user,workspace,ssl} \
 && mkdir -p /root/bin \
 && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /okit/ssl/okit.key -out /okit/ssl/okit.crt -subj "/C=GB/ST=Berkshire/L=Reading/O=Oracle/OU=OKIT/CN=www.oci_okit.com" \
 && ln -sv /github/oci-designer-toolkit/config /okit/config \
 && ln -sv /github/oci-designer-toolkit/okitweb /okit/okitweb \
 && ln -sv /github/oci-designer-toolkit/visualiser /okit/visualiser \
 && ln -sv /github/oci-designer-toolkit/containers/docker/run-server.sh /root/bin/run-server.sh \
 && ln -sv /github/oci-designer-toolkit/okitweb/static/okit/templates/reference_architecture /okit/instance/templates/reference_architecture \
 && chmod a+x /root/bin/run-server.sh \
# Install required python modules
 && python3 -m pip install --no-cache-dir -r /github/oci-designer-toolkit/requirements.txt
# Add entrypoint to automatically start webserver
CMD ["run-server.sh"]
