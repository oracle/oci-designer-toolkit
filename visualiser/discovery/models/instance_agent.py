# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.

from oci.compute_instance_agent.models import InstanceAgentPluginSummary

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
