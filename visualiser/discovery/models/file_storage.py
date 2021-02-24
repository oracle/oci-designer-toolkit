# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.

from oci.file_storage.models import ExportSummary

# extend ExportSummary to add compartment id
class ExtendedExportSummary(ExportSummary):

    _compartment_id = None

    @property
    def compartment_id(self):
        return self._compartment_id

    def __init__(self, compartment_id, export: ExportSummary):
        attrs = [item for item in dir(ExportSummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(export, attr)
        super().__init__(**init_args)
        self._compartment_id = compartment_id
        self.swagger_types.update({"compartment_id": "str"})
