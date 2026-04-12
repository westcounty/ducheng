#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ───────────────────────────────────────
SERVER="root@47.110.32.207"
SSH_KEY="$HOME/.ssh/photozen_nju_top_ed25519"
SSH_OPTS="-i $SSH_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

REMOTE_API_DIR="/var/www/ducheng-api"
REMOTE_FRONTEND_DIR="/var/www/ducheng"
LOCAL_API_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_FRONTEND_DIR="$(cd "$(dirname "$0")/../../app" && pwd)"

# ─── Parse flags ─────────────────────────────────────────
DEPLOY_FRONTEND=false
DEPLOY_BACKEND=false
RUN_SEED=false

if [ $# -eq 0 ]; then
  DEPLOY_FRONTEND=true
  DEPLOY_BACKEND=true
fi

for arg in "$@"; do
  case $arg in
    --frontend) DEPLOY_FRONTEND=true ;;
    --backend)  DEPLOY_BACKEND=true ;;
    --seed)     RUN_SEED=true ;;
    --all)      DEPLOY_FRONTEND=true; DEPLOY_BACKEND=true ;;
    *)          echo "Unknown flag: $arg"; echo "Usage: deploy.sh [--frontend] [--backend] [--seed] [--all]"; exit 1 ;;
  esac
done

echo "═══════════════════════════════════════"
echo "  读城 Deployment"
echo "  Frontend: $DEPLOY_FRONTEND"
echo "  Backend:  $DEPLOY_BACKEND"
echo "  Seed:     $RUN_SEED"
echo "═══════════════════════════════════════"

# ─── Frontend ────────────────────────────────────────────
if [ "$DEPLOY_FRONTEND" = true ]; then
  echo ""
  echo "▶ Building frontend..."
  cd "$LOCAL_FRONTEND_DIR"
  npm run build

  echo "▶ Uploading frontend to $SERVER:$REMOTE_FRONTEND_DIR/"
  scp $SSH_OPTS -r dist/* "$SERVER:$REMOTE_FRONTEND_DIR/"
  echo "✓ Frontend deployed"
fi

# ─── Backend ─────────────────────────────────────────────
if [ "$DEPLOY_BACKEND" = true ]; then
  echo ""
  echo "▶ Syncing backend to $SERVER:$REMOTE_API_DIR/"

  # Ensure remote directory exists
  ssh $SSH_OPTS "$SERVER" "mkdir -p $REMOTE_API_DIR/uploads $REMOTE_API_DIR/logs"

  # Rsync backend code (exclude dev/local files)
  rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='uploads/*' \
    --exclude='logs/*' \
    --exclude='.git' \
    -e "ssh $SSH_OPTS" \
    "$LOCAL_API_DIR/" "$SERVER:$REMOTE_API_DIR/"

  echo "▶ Installing dependencies on server..."
  ssh $SSH_OPTS "$SERVER" "cd $REMOTE_API_DIR && npm install --production"

  echo "▶ Restarting ducheng-api via PM2..."
  ssh $SSH_OPTS "$SERVER" "cd $REMOTE_API_DIR && pm2 startOrRestart ecosystem.config.cjs --env production"

  echo "▶ Saving PM2 process list..."
  ssh $SSH_OPTS "$SERVER" "pm2 save"

  echo "✓ Backend deployed"
fi

# ─── Seed ────────────────────────────────────────────────
if [ "$RUN_SEED" = true ]; then
  echo ""
  echo "▶ Running seed script on server..."
  ssh $SSH_OPTS "$SERVER" "cd $REMOTE_API_DIR && node src/db/seed.js"
  echo "✓ Seed complete"
fi

# ─── Health Check ────────────────────────────────────────
echo ""
echo "▶ Running health check..."
sleep 2

HEALTH=$(ssh $SSH_OPTS "$SERVER" "curl -s http://127.0.0.1:3100/api/health" 2>/dev/null || echo "FAILED")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo "✓ Health check passed: $HEALTH"
else
  echo "✗ Health check failed: $HEALTH"
  echo "  Check logs: ssh $SSH_OPTS $SERVER 'pm2 logs ducheng-api --lines 20'"
  exit 1
fi

echo ""
echo "═══════════════════════════════════════"
echo "  Deployment complete!"
echo "  API:      https://ducheng-api.nju.top/api/health"
echo "  Frontend: https://ducheng.nju.top"
echo "═══════════════════════════════════════"
