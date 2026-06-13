"""Read/write/deploy helpers for Oddsmith on Bradbury using the .env key.

Signs with GENLAYER_PRIVATE_KEY from the repo-root (or workspace-root) .env,
never the genlayer CLI's stored accounts. Works around a genlayer_py version
where gen_call returns a dict result (with a `data` hex field) instead of a
bare hex string.
"""
import os
from genlayer_py import create_client, create_account
from genlayer_py.chains import testnet_bradbury
from genlayer_py.abi import calldata
from genlayer_py.abi.transactions import serialize
from genlayer_py.contracts.utils import make_calldata_object
import eth_utils

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def load_pk():
    for env_path in (os.path.join(ROOT, ".env"), os.path.join(os.path.dirname(ROOT), ".env")):
        if os.path.exists(env_path):
            for line in open(env_path, encoding="utf-8").read().splitlines():
                if line.strip().startswith("GENLAYER_PRIVATE_KEY"):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("GENLAYER_PRIVATE_KEY not found in .env")


def make_client():
    account = create_account(account_private_key=load_pk())
    return create_client(chain=testnet_bradbury, account=account), account


def read(client, account, address, function_name, args=None):
    data = [
        calldata.encode(make_calldata_object(method=function_name, args=args or [], kwargs=None)),
        b"\x00",
    ]
    request_params = {
        "type": "read",
        "to": address,
        "from": account.address,
        "data": serialize(data),
        "transaction_hash_variant": "latest-nonfinal",
    }
    res = client.provider.make_request(method="gen_call", params=[request_params])["result"]
    hex_data = res.get("data", "") if isinstance(res, dict) else res
    return calldata.decode(eth_utils.hexadecimal.decode_hex("0x" + hex_data))
