#!/usr/bin/env bash
set -euo pipefail

BACKEND_PORT="${BACKEND_PORT:-8081}"
FRONTEND_PORT="${FRONTEND_PORT:-8080}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:${BACKEND_PORT}}"
export BACKEND_PORT FRONTEND_PORT BACKEND_URL

java ${JAVA_OPTS:-} -Dserver.port="${BACKEND_PORT}" -jar /app/myhotel.jar &
backend_pid=$!

node /app/frontend/server.mjs &
frontend_pid=$!

shutdown() {
  kill "${backend_pid}" "${frontend_pid}" 2>/dev/null || true
}

trap shutdown INT TERM

wait -n "${backend_pid}" "${frontend_pid}"
exit_code=$?
shutdown
exit "${exit_code}"
