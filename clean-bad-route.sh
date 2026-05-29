#!/bin/bash
set -e

echo "=================================================="
echo "⚡ SHERO Technologies - Route Alignment Fixer ⚡"
echo "=================================================="

# 1. Remove filesystem duplicate
echo "👉 Step 1: Cleaning up erroneous backslashed folder..."
if [ -d 'src/app/\(public\)' ]; then
  rm -rf 'src/app/\(public\)'
  echo "   ✓ Successfully deleted 'src/app/\(public\)' from disk."
else
  echo "   ✓ Erroneous 'src/app/\(public\)' directory not found or already removed."
fi

# 2. Stage git changes to ensure git index is correct
echo "👉 Step 2: Staging deletions in Git index..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  # Remove from git index if tracked
  git rm -r --cached --ignore-unmatch 'src/app/\(public\)' >/dev/null 2>&1 || true
  git add -A src/app/
  echo "   ✓ Staged routing directory adjustments in Git."
else
  echo "   ⚠ Not inside a Git repository. Skipping git staging."
fi

# 3. Purge Next.js build caches to force TS type generation refresh
echo "👉 Step 3: Purging Next.js build and cache folders..."
cleaned_cache=false
if [ -d ".next" ]; then
  rm -rf .next
  cleaned_cache=true
fi
if [ -d "out" ]; then
  rm -rf out
  cleaned_cache=true
fi
if $cleaned_cache; then
  echo "   ✓ Purged local Next.js cache (.next/out)."
else
  echo "   ✓ No cache folders found (already clean)."
fi

echo "=================================================="
echo "🎉 Route alignment completed successfully!"
echo "👉 You can now run your dev server or build:"
echo "   yarn build  OR  yarn dev"
echo "=================================================="
