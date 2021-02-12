# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.

from oci.autoscaling.models import AutoScalingPolicySummary

# extend AutoScalingPolicySummary to add parent id
class ExtendedAutoScalingPolicySummary(AutoScalingPolicySummary):

    _auto_scaling_configuration_id = None

    @property
    def auto_scaling_configuration_id(self):
        return self._auto_scaling_configuration_id

    def __init__(self, auto_scaling_configuration_id, auto_scaling_policy: AutoScalingPolicySummary):
        attrs = [item for item in dir(AutoScalingPolicySummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(auto_scaling_policy, attr)
        super().__init__(**init_args)
        self._auto_scaling_configuration_id = auto_scaling_configuration_id
        self.swagger_types.update({"auto_scaling_configuration_id": "str"})
