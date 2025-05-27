# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.

from oci.identity.models import TagSummary

# extend Tag to add parent tag namespace id
class ExtendedTagSummary(TagSummary):

    _tag_namespace_id = None

    @property
    def tag_namespace_id(self):
        return self._tag_namespace_id

    def __init__(self, compartment_id, tag_namespace_id, tag: TagSummary):
        attrs = [item for item in dir(TagSummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(tag, attr)
        super().__init__(**init_args)
        self._tag_namespace_id = tag_namespace_id
        self.swagger_types.update({"tag_namespace_id": "str"})