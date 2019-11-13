#!/usr/bin/python3
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__ekitversion__ = "@VERSION@"
__ekitrelease__ = "@RELEASE@"
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "wsgi"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

#from __init__ import create_app
#from okitweb.__init__ import create_app
from okitweb import create_app

app = create_app()

# Main function to kick off processing
if __name__ == "__main__":
    app.run()
