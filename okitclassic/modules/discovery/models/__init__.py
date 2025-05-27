# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.
# __init__.py
from .autoscaling import ExtendedAutoScalingPolicySummary
from .core import ExtendedSecurityRule, ExtendedNetworkSecurityGroupVnic
from .dns import ExtendedRRSet
from .file_storage import ExtendedExportSummary
from .identity import ExtendedTagSummary
from .instance_agent import ExtendedAvailablePluginSummary
from .instance_agent import ExtendedInstanceAgentPluginSummary
from .object_storage import ExtendedPreauthenticatedRequestSummary
from .mysql import ExtendedMySQLBackup, ExtendedMySQLBackupSummary
from .nosql import ExtendedNoSQLIndexSummary
from .database import ExtendedDbNodeSummary
from .virtual_network import ExtendedDrgRouteDistributionStatement, ExtendedDrgRouteRule, ExtendedVirtualCircuitBandwidthShape

__all__ = [
  "ExtendedAvailablePluginSummary",
  "ExtendedAutoScalingPolicySummary",
  "ExtendedDbNodeSummary",
  "ExtendedDrgRouteDistributionStatement",
  "ExtendedDrgRouteRule",
  "ExtendedExportSummary",
  "ExtendedInstanceAgentPluginSummary",
  "ExtendedMySQLBackup",
  "ExtendedMySQLBackupSummary",
  "ExtendedNetworkSecurityGroupVnic",
  "ExtendedNoSQLIndexSummary",
  "ExtendedPreauthenticatedRequestSummary",
  "ExtendedRRSet",
  "ExtendedSecurityRule",
  "ExtendedTagSummary",
  "ExtendedVirtualCircuitBandwidthShape",
]
