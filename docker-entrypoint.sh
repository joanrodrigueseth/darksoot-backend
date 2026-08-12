#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

echo "Running Prisma migrations..."
attempt=1
until npx prisma migrate deploy; do
  if [ "$attempt" -ge 30 ]; then
    echo "Migration failed after $attempt attempts"
    exit 1
  fi
  echo "Migration failed — retrying in 2s (attempt $attempt)..."
  attempt=$((attempt + 1))
  sleep 2
done

echo "Seeding database (idempotent)..."
npx tsx prisma/seed.ts || true

echo "Starting Darksoot API on :${PORT:-3000}..."
exec npx tsx src/index.ts
