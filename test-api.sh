#!/bin/bash

# Script de test de l'API - Structure Submit Endpoint
# Usage: ./test-api.sh [TOKEN]

echo "=========================================="
echo "🧪 Test de l'API - Soumission Structure"
echo "=========================================="
echo ""

# Configuration
API_URL="http://localhost:8000/api"
ENDPOINT="${API_URL}/structures/submit/"

# Token JWT (à récupérer après login)
if [ -z "$1" ]; then
    echo "⚠️  Usage: ./test-api.sh [YOUR_JWT_TOKEN]"
    echo ""
    echo "📋 Pour obtenir un token:"
    echo "1. Connectez-vous sur le frontend"
    echo "2. Ouvrez la console (F12)"
    echo "3. Tapez: localStorage.getItem('access_token')"
    echo "4. Copiez le token et relancez: ./test-api.sh <token>"
    echo ""
    echo "Ou testez le login directement:"
    echo ""
    echo "curl -X POST ${API_URL}/utilisateurs/login/ \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"email\":\"gestionnaire@test.com\",\"password\":\"Gestionnaire123!\"}'"
    echo ""
    exit 1
fi

TOKEN="$1"

echo "🔐 Token fourni: ${TOKEN:0:20}..."
echo "🎯 Endpoint: $ENDPOINT"
echo ""

# Test de soumission
echo "📤 Envoi de la requête..."
echo ""

curl -X POST "$ENDPOINT" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "nom=Hôpital Test" \
  -F "type=HOPITAL" \
  -F "adresse=123 Rue de Test, Yaoundé" \
  -F "telephone=0123456789" \
  -F "latitude=3.8480" \
  -F "longitude=11.5021" \
  -v

echo ""
echo ""
echo "=========================================="
echo "✅ Test terminé"
echo "=========================================="
