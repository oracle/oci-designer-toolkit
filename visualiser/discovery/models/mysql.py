from oci.mysql.models import Backup
from oci.mysql.models import BackupSummary


# extend Backup to add compartment id
class ExtendedMySQLBackup(Backup):

    _compartment_id = None

    @property
    def compartment_id(self):
        return self._compartment_id

    def __init__(self, compartment_id, export: Backup):
        attrs = [item for item in dir(BackupSummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(export, attr)
        super().__init__(**init_args)
        self._compartment_id = compartment_id
        self.swagger_types.update({"compartment_id": "str"})

# extend Backup to add compartment id
class ExtendedMySQLBackupSummary(BackupSummary):

    _compartment_id = None

    @property
    def compartment_id(self):
        return self._compartment_id

    def __init__(self, compartment_id, export: BackupSummary):
        attrs = [item for item in dir(BackupSummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(export, attr)
        super().__init__(**init_args)
        self._compartment_id = compartment_id
        self.swagger_types.update({"compartment_id": "str"})
