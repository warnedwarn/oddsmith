import json
import os
from gl import make_client
from genlayer_py.types import TransactionStatus

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CONTRACT = os.path.join(ROOT, "contracts", "contract.py")


def main():
    client, account = make_client()
    print("Signing account:", account.address)
    print("Balance:", client.get_balance(account.address) / 10**18, "GEN")

    code = open(CONTRACT, "r", encoding="utf-8").read()
    print("Deploying Oddsmith...")
    tx_hash = client.deploy_contract(code=code, args=[])
    print("Deploy tx hash:", tx_hash)

    client.wait_for_transaction_receipt(
        transaction_hash=tx_hash,
        status=TransactionStatus.ACCEPTED,
        interval=5000,
        retries=120,
    )
    tx = client.get_transaction(transaction_hash=tx_hash)
    addr = tx.get("recipient") if isinstance(tx, dict) else None
    exec_name = tx.get("tx_execution_result_name") if isinstance(tx, dict) else None
    status_name = tx.get("status_name") if isinstance(tx, dict) else None
    print("Status:", status_name, "Exec:", exec_name)
    print("Contract address:", addr)

    out = {
        "network": "testnet-bradbury",
        "contract_address": addr,
        "deploy_tx": tx_hash if isinstance(tx_hash, str) else tx_hash.hex(),
        "signer": account.address,
        "explorer": "https://explorer-bradbury.genlayer.com/address/" + str(addr),
    }
    with open(os.path.join(ROOT, "deployment.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print("Wrote deployment.json")


if __name__ == "__main__":
    main()
