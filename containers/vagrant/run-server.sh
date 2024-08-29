#!/bin/bash

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

source /etc/bashrc

echo "*******************************************************************"
echo "**                                                               **"
echo "**  Updating OKIT From GitHub                                    **"
echo "**                                                               **"
echo "*******************************************************************"

cd ${OKIT_GITHUB_DIR}/oci-designer-toolkit
git pull 2>/dev/null

echo "*******************************************************************"
echo "**                                                               **"
echo "**  Run WebServer                                                **"
echo "**                                                               **"
echo "*******************************************************************"

export PATH=/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin
export PYTHONPATH=:/okit/visualiser:/okit/okitweb:/okit

# Activate Virtual Environment
source ${OKIT_DIR}/.venv/bin/activate
# Update oci python module
python3 -m pip install -U oci
# Run Server
${OKIT_DIR}/.venv/bin/gunicorn okitweb.wsgi:app --config ${OKIT_DIR}/config/gunicorn_http.py
