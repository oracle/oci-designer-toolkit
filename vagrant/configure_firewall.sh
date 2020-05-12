#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.


# Config SELinux
setsebool -P httpd_can_network_connect 1
# Reload
systemctl daemon-reload

# Set Firewall Rules
firewall-offline-cmd  --add-port=80/tcp
firewall-offline-cmd  --add-port=8080/tcp
firewall-offline-cmd  --add-port=8888/tcp
firewall-offline-cmd  --add-port=5000/tcp
systemctl restart firewalld
