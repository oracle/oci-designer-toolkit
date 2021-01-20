
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

FROM oraclelinux:7-slim
LABEL "provider"="Oracle" \
      "issues"="https://github.com/oracle/oci-designer-toolkit/issues" \
      "version"="0.16.0" \
      "description"="OKIT Web Server Container." \
      "copyright"="Copyright (c) 2020, Oracle and/or its affiliates."
SHELL ["/bin/bash", "-c"]
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
COPY containers/oci/* /root/.oci/
COPY containers/docker/run-server.sh /root/bin/
# Install new yum repos
RUN yum install -y \
    oracle-softwarecollection-release-el7 \
    oraclelinux-developer-release-el7 \
# Disable oci config repo
 && yum-config-manager --disable ol7_ociyum_config \
# Update base image
 && yum update -y \
# Install additional packages
 && yum install -y \
        git \
        python36 \
        python3-pip \
 && rm -rf /var/cache/yum \
# Upgrade pip
 && python3 -m pip install --upgrade pip \
# Install required python modules
 && pip3 install --no-cache-dir \
        flask==1.1.1 \
        gitpython==3.1.11 \
        git-url-parse==1.2.2 \
        gunicorn==20.0.4 \
        oci==2.22.0 \
        openpyxl==3.0.5 \
        pandas==1.1.2 \
        python-magic==0.4.18 \
        pyyaml==5.3.1 \
        requests==2.24.0 \
        xlsxwriter==1.3.6 \
# Create Workspace
 && mkdir -p /github \
 && git clone https://github.com/oracle/oci-designer-toolkit.git /github/oci-designer-toolkit \
 && mkdir -p /okit/{log,workspace} \
 && ln -sv /github/oci-designer-toolkit/okitweb /okit/okitweb \
 && ln -sv /github/oci-designer-toolkit/visualiser /okit/visualiser \
 && mkdir -p /okit/okitweb/static/okit/templates \
 && ln -sv /okit/templates /okit/okitweb/static/okit/templates/user \
 && chmod a+x /root/bin/run-server.sh
# Add entrypoint to automatically start webserver
CMD ["run-server.sh"]
