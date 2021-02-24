# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.

from oci.application_migration.models import SourceApplicationSummary

# extend the SourceApplicationSummary to add a unique application id
class ExtendedSourceApplicationSummary(SourceApplicationSummary):

    _application_id = None

    @property
    def id(self):
        return self._application_id

    def __init__(self, id, application: SourceApplicationSummary):
        attrs = [item for item in dir(SourceApplicationSummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(application, attr)
        super().__init__(**init_args)
        self._application_id = id
        self.swagger_types.update({"id": "str"})
