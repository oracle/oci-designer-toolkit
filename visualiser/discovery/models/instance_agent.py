# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.

from oci.compute_instance_agent.models import InstanceAgentPluginSummary
from  oci.compute_instance_agent.models import AvailablePluginSummary


# extend Tag to add parent tag namespace id
class ExtendedInstanceAgentPluginSummary(InstanceAgentPluginSummary):

    _compartment_id = None
    _instanceagent_id = None

    @property
    def compartment_id(self):
        return self._compartment_id

    @property
    def instanceagent_id(self):
        return self._instanceagent_id

    def __init__(self, compartment_id, instanceagent_id, index: InstanceAgentPluginSummary):
        attrs = [item for item in dir(InstanceAgentPluginSummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(index, attr)
        super().__init__(**init_args)
        self._compartment_id = compartment_id
        self._instanceagent_id = instanceagent_id
        self.swagger_types.update({"compartment_id": "str"})
        self.swagger_types.update({"instanceagent_id": "str"})


# extend Tag to add parent tag namespace id
class ExtendedAvailablePluginSummary(AvailablePluginSummary):

    _os_name = None
    _os_version = None

    @property
    def os_name(self):
        return self._os_name

    @property
    def os_version(self):
        return self._os_version

    def __init__(self, os_name, os_version, index: AvailablePluginSummary):
        attrs = [item for item in dir(AvailablePluginSummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(index, attr)
        super().__init__(**init_args)
        self._os_name = os_name
        self._os_version = os_version
        self.swagger_types.update({"os_name": "str"})
        self.swagger_types.update({"os_version": "str"})
