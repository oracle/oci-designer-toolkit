# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.

from oci.core.models import DrgRouteDistributionStatement, DrgRouteRule, VirtualCircuitBandwidthShape

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


# extend DrgRouteDistributionStatement to add parent and compartment id
class ExtendedDrgRouteDistributionStatement(DrgRouteDistributionStatement):

    _compartment_id = None
    _drg_route_distribution_id = None

    @property
    def compartment_id(self):
        return self._compartment_id

    @property
    def drg_route_distribution_id(self):
        return self._drg_route_distribution_id

    def __init__(self, compartment_id, drg_route_distribution_id, export: DrgRouteDistributionStatement):
        attrs = [item for item in dir(DrgRouteDistributionStatement) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(export, attr)
        super().__init__(**init_args)
        self._compartment_id = compartment_id
        self._drg_route_distribution_id = drg_route_distribution_id
        self.swagger_types.update({"compartment_id": "str"})
        self.swagger_types.update({"drg_route_distribution_id": "str"})

# extend DrgRouteRule to add parent and compartment id
class ExtendedDrgRouteRule(DrgRouteRule):

    _compartment_id = None
    _drg_route_table_id = None

    @property
    def compartment_id(self):
        return self._compartment_id

    @property
    def drg_route_table_id(self):
        return self._drg_route_table_id

    def __init__(self, compartment_id, drg_route_table_id, export: DrgRouteRule):
        attrs = [item for item in dir(DrgRouteRule) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(export, attr)
        super().__init__(**init_args)
        self._compartment_id = compartment_id
        self._drg_route_table_id = drg_route_table_id
        self.swagger_types.update({"compartment_id": "str"})
        self.swagger_types.update({"drg_route_table_id": "str"})