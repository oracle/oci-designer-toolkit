# Copyright © 2021, Oracle and/or its affiliates. All rights reserved.

from oci.object_storage.models import BucketSummary, PreauthenticatedRequestSummary

# extend BucketSummary to add compartment id
class ExtendedBucketSummary(BucketSummary):

    _compartment_id = None

    @property
    def compartment_id(self):
        return self._compartment_id

    def __init__(self, compartment_id, bucket: BucketSummary):
        attrs = [item for item in dir(BucketSummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(bucket, attr)
        super().__init__(**init_args)
        self._compartment_id = compartment_id
        self.swagger_types.update({"compartment_id": "str"})

# extend PreauthenticatedRequest to add compartment id  and bucket id

class ExtendedPreauthenticatedRequestSummary(PreauthenticatedRequestSummary):

    _compartment_id = None
    _bucket_name = None

    @property
    def compartment_id(self):
        return self._compartment_id

    @property
    def bucket_name(self):
        return self._bucket_name 

    def __init__(self, compartment_id, bucket_name, preauth: PreauthenticatedRequestSummary):
        attrs = [item for item in dir(PreauthenticatedRequestSummary) if not item.startswith('_') and item[0].islower()]
        init_args = {}
        for attr in attrs:
            init_args[attr] = getattr(preauth, attr)
        super().__init__(**init_args)
        self._compartment_id = compartment_id
        self._bucket_name = bucket_name
        self.swagger_types.update({"compartment_id": "str"})
        self.swagger_types.update({"bucket_name": "str"})

