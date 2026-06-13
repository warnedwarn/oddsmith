from gl import make_client, read

ADDR = "0xCdefeC7a47AC26A10083E626e22d5e9d49eBf471"
client, account = make_client()

print("get_stats ->", read(client, account, ADDR, "get_stats"))
print("get_forecasts(0) ->", read(client, account, ADDR, "get_forecasts", [0]))
