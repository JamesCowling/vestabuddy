# python3 -m pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ convex

from convex import ConvexClient
from pprint import pprint

client = ConvexClient("https://silent-mosquito-517.convex.cloud")
client.action("actions/post", "this message will be gone in 60 seconds", 60)
