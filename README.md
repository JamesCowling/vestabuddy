# Vestabuddy

Libraries for posting a temporary message to a Vestaboard and then resetting it
to the previous layout. This is helpful for services that want to post an
announcement to a Vestaboard via a web hook.

Vestabuddy is built on [Convex](https://docs.convex.dev). You can set it up via:

```bash
npm i
npx convex init
```

and then either run in dev via:

```bash
npm run dev
```

or push to via:

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
npx convex run auth:addServiceKey '{"name": "my-service"}'
```

This will return a secret key that you can use to authenticate with Vestabuddy.

> **Note:** Reminder that in all of these cli commands you can use `--prod` to run
> them in production instead of on your dev deployment.

## Posting from a web hook

You can post to the `/post` http endpoint with a service key to post a message.
e.g., if you have a service key `91480b96-71af-413b-102d-aa011e245149` and your
Convex deployment name `lonely-cow-123` you can post a message via CURL with:

```bash
curl -X POST https://lonely-cow-123.convex.site/post \
     -H "Content-Type: application/json" \
     -d '{
           "message": "moo",
           "duration": 60,
           "serviceKey": "91480b96-71af-413b-102d-aa011e245149"
         }'
```

Note the `.site` domain suffix. Convex http actions are hosted at `convex.site`
instead of `convex.cloud` for security reasons.

## Posting from the CLI

The CLI can directly call internal actions so you can skip the service key:

```bash
npx convex run --prod board:postAuthed '{"message": "boo", "duration": 60}'
```
