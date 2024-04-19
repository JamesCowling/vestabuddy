# Vestabuddy

Libraries for posting a temporary message to a Vestaboard and then resetting it
to the previous layout. This is helpful for services that want to post an
announcement to a Vestaboard via a web hook.

Vestabuddy is built on [Convex](https://docs.convex.dev). You can set it up via:

```bash
npm i
npx convex init
```

and push to production via

```bash
npx convex deploy
```

This repo also contains a very basic web UI that can be used to post messages.
You don't need a hosting service to run it if you don't need the web UI and just
want to interface with the webhooks, which run natively on Convex.

## Configuration

The app requires the `VESTA_RW_KEY` environment variable to be set in the Convex
dashboard. This key is available under the Read/Write API tab in the API section
of https://web.vestaboard.com/.

## Service keys

You can use a service key to authenticate with Vestabuddy from a third party
service that doesn't have a web auth context. Use the internal mutation
`addServiceKey` on the Convex dashboard or via the CLI to create a service key:

```bash
npx convex run auth:addServiceKey '{"name": "my-cool-service"}'
```

This will return a secret key that you can use to authenticate with Vestabuddy.

## Posting from a web hook

TODO

## Posting from the CLI

A service account key is required when issuing vestabuddy commands from the CLI:

```bash
npx convex run --prod board:post \
    '{"message": "Yall know what time it is", "duration": 60, "serviceKey": "<service key>"}'
```
