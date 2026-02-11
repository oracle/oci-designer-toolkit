# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
import os
import secrets

# Use environment variable; fallback to a cryptographically secure random string
SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_hex(32))
