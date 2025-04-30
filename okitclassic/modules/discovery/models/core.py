# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.

from oci.core.models import SecurityRule, NetworkSecurityGroupVnic

# extend SecurityRule to add parent id
class ExtendedSecurityRule(SecurityRule):

    _network_security_group_id = None

    @property
    def network_security_group_id(self):
        return self._network_security_group_id

    def __init__(self, network_security_group_id, security_rule: SecurityRule):
        attrs = [item for item in dir(SecurityRule) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(security_rule, attr)
        super().__init__(**init_args)
        self._network_security_group_id = network_security_group_id
        self.swagger_types.update({"network_security_group_id": "str"})

# extend NetworkSecurityGroupVnic to add parent id
class ExtendedNetworkSecurityGroupVnic(NetworkSecurityGroupVnic):

    _network_security_group_id = None

    @property
    def network_security_group_id(self):
        return self._network_security_group_id

    def __init__(self, network_security_group_id, security_rule: NetworkSecurityGroupVnic):
        attrs = [item for item in dir(NetworkSecurityGroupVnic) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(security_rule, attr)
        super().__init__(**init_args)
        self._network_security_group_id = network_security_group_id
        self.swagger_types.update({"network_security_group_id": "str"})

