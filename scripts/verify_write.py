import time
from gl import make_client, read
from genlayer_py.types import TransactionStatus

ADDR = "0xCdefeC7a47AC26A10083E626e22d5e9d49eBf471"
client, account = make_client()

print("Opening a forecast...")
tx1 = client.write_contract(
    address=ADDR,
    function_name="open_forecast",
    args=[
        "Ethereum's next mainnet upgrade ships before the end of 2026",
        "Resolve YES if a coordinated Ethereum mainnet hard fork activates on-chain during the 2026 "
        "calendar year, per the official Ethereum Foundation announcement. Resolve NO if no mainnet "
        "fork activates in 2026. INVALID if the evidence is unrelated or unverifiable.",
        0,
    ],
)
print("open tx:", tx1)
client.wait_for_transaction_receipt(transaction_hash=tx1, status=TransactionStatus.ACCEPTED, interval=6000, retries=120)
stats = read(client, account, ADDR, "get_stats")
print("stats after open:", stats)
forecasts = read(client, account, ADDR, "get_forecasts", [0])
fid = forecasts[-1]["id"]
print("forecast id:", fid)

print("Resolving with evidence (AI write under consensus)...")
tx2 = client.write_contract(
    address=ADDR,
    function_name="resolve_forecast",
    args=[
        fid,
        "The Ethereum Foundation announced and activated a coordinated mainnet hard fork in 2026, "
        "confirmed by the official blog and multiple block explorers showing the fork block.",
    ],
)
print("resolve tx:", tx2)
client.wait_for_transaction_receipt(transaction_hash=tx2, status=TransactionStatus.ACCEPTED, interval=8000, retries=120)
time.sleep(3)
print("stats after resolve:", read(client, account, ADDR, "get_stats"))
print("resolved forecast ->", read(client, account, ADDR, "get_forecast", [fid]))
