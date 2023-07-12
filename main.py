# pip3 install convex python-dotenv

import os, sys
from convex import ConvexClient
from dotenv import load_dotenv

if len(sys.argv) != 3:
    print(sys.argv[0], "<message> <seconds>")
    sys.exit(0)
message = sys.argv[1]
delay = int(sys.argv[2])

load_dotenv(".env")
CONVEX_URL = os.getenv("VITE_CONVEX_URL")
client = ConvexClient(CONVEX_URL)

client.action("board:post", {"message": message, "duration": delay})
