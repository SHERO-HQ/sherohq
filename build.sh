#!/usr/bin/env bash
set -euo pipefail

# Ensure package manager from package.json is available in CI.
corepack enable

# Install dependencies for the root workspace and the server workspace.
yarn install

# Build the Next.js application.
yarn build
