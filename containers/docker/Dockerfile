
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
        git \
#        python36-pyyaml \
#        python36-oci-sdk \
#        rh-nginx114 \
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
 && mkdir -p /okit/{config,git,log,visualiser,okitweb,workspace,templates,skeletons} \
 && mkdir -p /okit/okitweb/static/okit/templates \
 && ln -s /okit/templates/user /okit/okitweb/static/okit/templates/user \
 && ln -s /okit/git /okit/okitweb/static/okit/templates/git \
 && ln -s /okit/git /okit/okitweb/static/okit/git
# Copy source code
COPY okitweb /okit/okitweb
COPY visualiser /okit/visualiser
COPY skeletons /okit/skeletons
COPY containers/oci/* /root/.oci/
COPY containers/ssh/* /root/.ssh/
RUN chmod 600 /root/.ssh/*

# Add entrypoint to automatically start webserver
ENTRYPOINT ["gunicorn"]
CMD ["--workers=4", "--limit-request-line", "0", "--timeout", "120", "--bind=0.0.0.0:80", "okitweb.wsgi:app"]
