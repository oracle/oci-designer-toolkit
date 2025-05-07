#!/bin/bash

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

echo "*******************************************************************"
echo "**                                                               **"
echo "**  Updating OKIT From GitHub                                    **"
echo "**                                                               **"
echo "*******************************************************************"

cd /github/oci-designer-toolkit
git pull 2>/dev/null

echo "*******************************************************************"
echo "**                                                               **"
echo "**  Run WebServer                                                **"
echo "**                                                               **"
echo "*******************************************************************"

export PYTHONIOENCODING=utf8
export OKIT_DIR=/okit
export OKIT_GITHUB_DIR=/okit_github
export OKIT_LOGFILE=${OKIT_DIR}/log/okit.log
export PYTHONPATH=:${OKIT_DIR}/modules:${OKIT_DIR}/okitserver:${OKIT_DIR}
export PATH=/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin

python3 --version

/usr/local/bin/gunicorn okitserver.wsgi:app --config /okit/config/gunicorn_http.py
