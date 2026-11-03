#!/bin/sh
# Create (first run) or log in the local CI publisher on Verdaccio and print its auth token.
#   export CORE_REGISTRY_TOKEN=$(pnpm -s registry:token)
# Local-dev credentials only; real registries issue tokens through your CI secret store.
set -eu
REGISTRY="${CORE_REGISTRY_URL:-http://localhost:4873}"
USER="${REGISTRY_USER:-platform-ci}"
PASS="${REGISTRY_PASSWORD:-local-dev-only-password}"
URL="$REGISTRY/-/user/org.couchdb.user:$USER"
BODY="{\"name\":\"$USER\",\"password\":\"$PASS\"}"

extract() { sed -n -E 's/.*"token": *"([^"]+)".*/\1/p' | head -1; }

# Existing user: authenticate with basic auth. New user: register.
TOKEN=$(curl -sS -u "$USER:$PASS" -X PUT "$URL" -H 'content-type: application/json' -d "$BODY" | tr -d '\n' | extract)
if [ -z "$TOKEN" ]; then
  TOKEN=$(curl -sS -X PUT "$URL" -H 'content-type: application/json' -d "$BODY" | tr -d '\n' | extract)
fi
[ -n "$TOKEN" ] || { echo "could not obtain a token from $REGISTRY" >&2; exit 1; }
echo "$TOKEN"
