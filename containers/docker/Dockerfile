
# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

FROM oraclelinux:7-slim
LABEL "provider"="Oracle" \
      "issues"="https://github.com/oracle/oci-designer-toolkit/issues" \
      "version"="0.22.1" \
      "description"="OKIT Web Server Container." \
      "copyright"="Copyright (c) 2020, 2021, Oracle and/or its affiliates."
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
        openssl \
        python36 \
        python3-pip \
#        python36-pyyaml \
#        python36-oci-sdk \
#        rh-nginx114 \
 && rm -rf /var/cache/yum \
# Upgrade pip
 && python3 -m pip install --upgrade pip \
# Install required python modules
 && pip3 install --no-cache-dir \
        authlib==0.15.3 \
        flask==1.1.2 \
        gitpython==3.1.14 \
        git-url-parse==1.2.2 \
        gunicorn==20.0.4 \
        oci \
        openpyxl==3.0.7 \
        pandas==1.1.2 \
        python-magic==0.4.22 \
        pyyaml==5.4.1 \
        requests==2.25.1 \
        xlsxwriter==1.3.7 \
# Create Workspace
 && mkdir -p /okit/{config,git,log,ssl,visualiser,okitweb,workspace,templates,skeletons} \
 && mkdir -p /okit/okitweb/static/okit/templates \
 && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /okit/ssl/okit.key -out /okit/ssl/okit.crt -subj "/C=GB/ST=Berkshire/L=Reading/O=Oracle/OU=OKIT/CN=www.oci_okit.com" \
 && ln -s /okit/templates /okit/okitweb/static/okit/templates/user \
 && ln -s /okit/git /okit/okitweb/static/okit/templates/git \
 && ln -s /okit/git /okit/okitweb/static/okit/git
# Copy source code
COPY config /okit/config
COPY okitweb /okit/okitweb
COPY instance /okit/instance
COPY visualiser /okit/visualiser
COPY skeletons /okit/skeletons
COPY containers/oci/* /root/.oci/
COPY containers/ssh/* /root/.ssh/
RUN chmod 600 /root/.ssh/*

# Add entrypoint to automatically start webserver
ENTRYPOINT ["gunicorn", "okitweb.wsgi:app"]
CMD ["--config", "/okit/config/gunicorn_http.py"]
