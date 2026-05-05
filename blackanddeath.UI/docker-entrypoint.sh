#!/bin/sh
set -e

mkdir -p /usr/share/nginx/html/assets

cat > /usr/share/nginx/html/assets/config.json <<EOF
{
  "apiUrl": "${API_URL:-https://api.blackened-death.com}",
  "usercontentUrl": "${USERCONTENT_URL:-https://api.blackened-death.com/usercontent}",
  "notificationsUrl": "${NOTIFICATIONS_URL:-https://api.blackened-death.com/notifications}",
  "issuer": "${ISSUER_URL:-https://auth.blackened-death.com}"
}
EOF

exec nginx -g "daemon off;"
