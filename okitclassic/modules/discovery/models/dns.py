from  oci.dns.models import RRSet

# extend Index to add compartment id and table id
class ExtendedRRSet(RRSet):

    _compartment_id = None
    _zone_id = None

    @property
    def compartment_id(self):
        return self._compartment_id

    @property
    def zone_id(self):
        return self._zone_id

    def __init__(self, compartment_id, zone_id, index: RRSet):
        attrs = [item for item in dir(RRSet) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(index, attr)
        super().__init__(**init_args)
        self._compartment_id = compartment_id
        self._zone_id = zone_id
        self.swagger_types.update({"compartment_id": "str"})
        self.swagger_types.update({"zone_id": "str"})
