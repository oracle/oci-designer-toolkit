# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.

from oci.core.models import VirtualCircuitBandwidthShape

# extend VirtualCircuitBandwidthShape to add provider id
class ExtendedVirtualCircuitBandwidthShape(VirtualCircuitBandwidthShape):

    _fastconnect_provider_id = None

    @property
    def fastconnect_provider_id(self):
        return self._fastconnect_provider_id

    def __init__(self, fastconnect_provider_id, export: VirtualCircuitBandwidthShape):
        attrs = [item for item in dir(VirtualCircuitBandwidthShape) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(export, attr)
        super().__init__(**init_args)
        self._fastconnect_provider_id = fastconnect_provider_id
        self.swagger_types.update({"fastconnect_provider_id": "str"})
