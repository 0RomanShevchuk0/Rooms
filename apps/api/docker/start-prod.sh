#!/bin/sh
set -eu

./node_modules/.bin/prisma migrate deploy --config apps/api/prisma.config.ts
exec node apps/api/dist/src/main
