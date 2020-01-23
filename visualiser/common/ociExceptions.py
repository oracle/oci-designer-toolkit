#!/usr/bin/python

# Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
# The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "ociExceptions"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


class ValidationException(Exception):
    def __init__(self, message):
        self.message = message

    def __str__(self):
        return repr('Validation Failed : ' + str(self.message))



