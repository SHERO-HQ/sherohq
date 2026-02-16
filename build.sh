#!/usr/bin/env bash
set -e  # Exit on error

echo "Enabling Corepack..."
corepack enable

echo "Installing dependencies..."
cd server
yarn install

echo "Building application..."
yarn build

echo "Build completed successfully!"