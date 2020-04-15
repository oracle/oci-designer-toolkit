#!/usr/bin/env bash

########################################################################################

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

########################################################################################

################################################################################
#
# Simple wrapper script to call the python.
#
################################################################################

DIRNAME=`dirname $0`
SCRIPTNAME=`basename $0`

export PYTHON="python3"
export FLASK_APP="${DIRNAME}/run-rest.py"
export FLASK_DEBUG=1

PYTHON_SCRIPT_DIR="$DIRNAME/../python"

export PATH=$PYTHON_SCRIPT_DIR:$PATH
$PYTHON -m flask run --host=0.0.0.0 --port=6443 --no-debugger
