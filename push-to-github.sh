#!/bin/bash

# Manual GitHub push script
# This script manually pushes the current state to GitHub

echo "🚀 Preparing to push Bau-Structura to GitHub..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Configure git user
git config user.name "Lea Zimmer"
git config user.email "leazimmer@users.noreply.replit.com"

# Add all files
echo "Adding all project files..."
git add .

# Commit with current timestamp
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
echo "Creating commit: Bau-Structura App - $timestamp"
git commit -m "Bau-Structura App - Complete implementation $timestamp

- Tiefbau Projektmanagement System
- Mobile-first design with responsive UI
- Hochwasserschutz module with checklists
- Role-based authentication (Replit Auth)
- PostgreSQL database with Drizzle ORM
- Full CRUD operations for projects, customers, companies
- Document management and photo uploads
- GPS integration for project locations
- Dashboard with project statistics
- German language interface"

# Add remote repository
echo "Setting up GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Lea43010/baustructura_final.git

# Push to GitHub
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main --force

echo "✅ Successfully pushed to GitHub!"
echo "Repository: https://github.com/Lea43010/baustructura_final"