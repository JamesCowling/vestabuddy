# python3 -m pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ convex

import sys

from convex import ConvexClient
from pprint import pprint

if len(sys.argv) != 3:
    print("<cmd> <message> <seconds>")
    sys.exit(0)
message = sys.argv[1]
delay = int(sys.argv[2])

client = ConvexClient("https://silent-mosquito-517.convex.cloud")
client.action("actions/post", message, delay)
