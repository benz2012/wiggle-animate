#!/bin/bash
set -e

npm --no-git-tag-version version patch

git add package*.json
