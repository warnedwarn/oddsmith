from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded


def test_open_and_resolve_flow():
    factory = get_contract_factory("Oddsmith")
    contract = factory.deploy(args=[])

    stats = contract.get_stats(args=[]).call()
    assert stats["forecasts"] == 0
    assert stats["resolved"] == 0

    # Open a forecast (deterministic write, no AI)
    open_receipt = contract.open_forecast(args=[
        "SpaceX completes an orbital Starship flight with a soft splashdown in 2026",
        "Resolve YES if a primary news source reports a Starship reaching orbit and performing a "
        "controlled water landing during the 2026 calendar year. Resolve NO if the year ends with "
        "no such flight. INVALID if evidence is unrelated or unverifiable.",
        0,
    ]).transact()
    assert tx_execution_succeeded(open_receipt)

    stats = contract.get_stats(args=[]).call()
    assert stats["forecasts"] == 1

    forecasts = contract.get_forecasts(args=[0]).call()
    assert len(forecasts) == 1
    fid = forecasts[0]["id"]
    assert forecasts[0]["status"] == "OPEN"

    # Resolve it with evidence (primary AI write under consensus)
    resolve_receipt = contract.resolve_forecast(args=[
        fid,
        "Multiple major outlets reported on a 2026 Starship flight that reached orbit and executed a "
        "controlled soft splashdown in the Indian Ocean, confirmed by onboard telemetry and recovery imagery.",
    ]).transact()
    assert tx_execution_succeeded(resolve_receipt)

    resolved = contract.get_forecast(args=[fid]).call()
    assert resolved["status"] == "RESOLVED"
    assert resolved["ruling"] in ("YES", "NO", "INVALID")
    assert 0 <= resolved["confidence"] <= 100
    if resolved["ruling"] == "INVALID":
        assert resolved["confidence"] <= 40


def test_guard_rejects_empty_claim():
    factory = get_contract_factory("Oddsmith")
    contract = factory.deploy(args=[])
    receipt = contract.open_forecast(args=["", "some criteria", 0]).transact()
    assert not tx_execution_succeeded(receipt)
