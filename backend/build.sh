#!/usr/bin/env bash
# Build script Render.com — execute depuis le dossier backend/
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate --no-input
