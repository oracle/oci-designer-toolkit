
# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

FROM oraclelinux:8
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
# Configure ssh
 && echo 'Host *' > /etc/ssh/ssh_config \
 && echo '  StrictHostKeyChecking no' >> /etc/ssh/ssh_config \
 && echo '  UserKnownHostsFile=/dev/null' >> /etc/ssh/ssh_config \
# Upgrade pip
 && python3 -m pip install --upgrade pip \
# Install required python modules
 && python3 -m pip install --no-cache-dir \
        -r requirements.txt \
# Create Workspace
 && mkdir -p /okit/{config,git,instance/git,instance/local,instance/templates/user,local,log,ssl,visualiser,okitweb,workspace,skeletons} \
#  && mkdir -p /okit/okitweb/static/okit/templates \
 && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /okit/ssl/okit.key -out /okit/ssl/okit.crt -subj "/C=GB/ST=Berkshire/L=Reading/O=Oracle/OU=OKIT/CN=www.oci_okit.com" 
#  && ln -s /okit/templates /okit/okitweb/static/okit/templates/user \
#  && ln -s /okit/git /okit/okitweb/static/okit/templates/git \
#  && ln -s /okit/git /okit/okitweb/static/okit/git
# Copy source code
COPY config /okit/config
COPY okitweb /okit/okitweb
COPY instance /okit/instance
COPY visualiser /okit/visualiser
COPY skeletons /okit/skeletons
COPY containers/oci/* /root/.oci/
COPY containers/ssh/* /root/.ssh/
RUN chmod 600 /root/.ssh/* \
 && ln -s /okit/okitweb/static/okit/templates/reference_architecture /okit/instance/templates/reference_architecture 

# Add entrypoint to automatically start webserver
ENTRYPOINT ["gunicorn", "okitweb.wsgi:app"]
CMD ["--config", "/okit/config/gunicorn_http.py"]
