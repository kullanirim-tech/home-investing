#!/bin/bash

# Deploy to GitHub Pages - gh-pages branch

echo "🚀 Deploying to GitHub Pages..."

# Stash local changes first
echo "🔒 Stashing local changes..."
git stash push -m "Auto-stash before deploy"

# Build
echo "📦 Building..."
npm run build

# Switch to gh-pages
echo "🌿 Switching to gh-pages branch..."
git checkout gh-pages 2>/dev/null || git checkout -b gh-pages origin/gh-pages

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin gh-pages --no-edit

# Merge main into gh-pages (strategy: theirs to avoid conflicts)
echo "🔀 Merging main into gh-pages..."
git merge main -X theirs --no-edit

# Clean old dist files
echo "🧹 Cleaning old dist files..."
rm -rf dist

# Copy new dist files (from stash pop location)
echo "📋 Copying new dist files..."
cp -r dist .

# Commit changes
echo "💾 Committing changes..."
git add -A
git commit -m "Deploy $(date '+%Y-%m-%d %H:%M:%S')" --no-edit || true

# Push to gh-pages
echo "📤 Pushing to gh-pages..."
git push origin gh-pages

# Switch back to main
echo "🎯 Switching back to main..."
git checkout main

# Restore stashed changes
echo "🔓 Restoring local changes..."
git stash pop

echo "✅ Deploy complete!"
echo "🌐 Site should be available at: https://kullanirim-tech.github.io/home-investing/"
