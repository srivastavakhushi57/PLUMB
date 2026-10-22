import pytest
from backend.app.auth import filter_confidential_rules, filter_confidential_facts

class DummyRule:
    def __init__(self, id, is_confidential):
        self.id = id
        self.is_confidential = is_confidential

class DummyUser:
    def __init__(self, is_external):
        self.is_external = is_external

def test_internal_creator_sees_all_rules():
    rules = [
        DummyRule("r1", is_confidential=False),
        DummyRule("r2", is_confidential=True),
    ]
    internal_user = DummyUser(is_external=False)
    visible = filter_confidential_rules(rules, internal_user)
    assert len(visible) == 2

def test_external_agency_creator_confidential_rules_filtered():
    rules = [
        DummyRule("r1", is_confidential=False),
        DummyRule("r2", is_confidential=True),
        DummyRule("r3", is_confidential=False),
    ]
    external_user = DummyUser(is_external=True)
    visible = filter_confidential_rules(rules, external_user)
    assert len(visible) == 2
    assert all(not r.is_confidential for r in visible)
