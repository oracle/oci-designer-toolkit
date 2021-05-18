# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.

from oci.database.models import DbNodeSummary

# extend DbNodeSummary to add compartment id
class ExtendedDbNodeSummary(DbNodeSummary):

    _vm_cluster_id = None

    @property
    def vm_cluster_id(self):
        return self._vm_cluster_id

    def __init__(self, vm_cluster_id, export: DbNodeSummary):
        attrs = [item for item in dir(DbNodeSummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(export, attr)
        super().__init__(**init_args)
        self._vm_cluster_id = vm_cluster_id
        self.swagger_types.update({"vm_cluster_id": "str"})
