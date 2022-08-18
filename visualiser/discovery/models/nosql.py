from oci.nosql.models import IndexSummary

# extend Index to add compartment id and table id
class ExtendedNoSQLIndexSummary(IndexSummary):

    _compartment_id = None
    _table_id = None

    @property
    def compartment_id(self):
        return self._compartment_id

    @property
    def table_id(self):
        return self._table_id

    def __init__(self, compartment_id, table_id, index: IndexSummary):
        attrs = [item for item in dir(IndexSummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(index, attr)
        super().__init__(**init_args)
        self._compartment_id = compartment_id
        self._table_id = table_id
        self.swagger_types.update({"compartment_id": "str"})
        self.swagger_types.update({"table_id": "str"})
