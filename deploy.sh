#!/bin/bash

# Deploy to GitHub Pages - gh-pages branch

echo "🚀 Deploying to GitHub Pages..."

# Build
echo "📦 Building..."
npm run build

# Switch to gh-pages
echo "🌿 Switching to gh-pages branch..."
git checkout gh-pages

# Merge main into gh-pages
echo "🔀 Merging main into gh-pages..."
git merge main --no-edit

# Push to gh-pages
echo "📤 Pushing to gh-pages..."
git push origin gh-pages

# Switch back to main
echo "🎯 Switching back to main..."
git checkout main

echo "✅ Deploy complete!"
echo "🌐 Site should be available at: https://kullanirim-tech.github.io/home-investing/"
