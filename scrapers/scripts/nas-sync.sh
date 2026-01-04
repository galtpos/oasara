#!/bin/bash
#
# Oasara NAS Sync Script
# Syncs scraped media from Cloudflare R2 to local NAS
#
# Usage:
#   ./nas-sync.sh              # Run sync
#   ./nas-sync.sh --install    # Install as cron job
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRAPERS_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$SCRAPERS_DIR/logs"
LOG_FILE="$LOG_DIR/nas-sync.log"

# Load environment
if [ -f "$SCRAPERS_DIR/.env" ]; then
    export $(grep -v '^#' "$SCRAPERS_DIR/.env" | xargs)
fi

# Defaults
R2_BUCKET="${R2_BUCKET_NAME:-oasara-scraped-media}"
NAS_PATH="${NAS_MOUNT_PATH:-/Volumes/NAS/oasara/scraped-media}"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"
}

check_dependencies() {
    if ! command -v rclone &> /dev/null; then
        log "ERROR: rclone not installed"
        echo "Install with: brew install rclone"
        echo "Then configure R2 remote: rclone config"
        exit 1
    fi
}

check_nas_mounted() {
    if [ ! -d "$NAS_PATH" ]; then
        log "WARNING: NAS not mounted at $NAS_PATH"
        echo "Please mount your NAS before running sync"
        exit 1
    fi
}

run_sync() {
    log "Starting NAS sync..."
    log "Source: r2:$R2_BUCKET"
    log "Destination: $NAS_PATH"
    
    # Create destination if it doesn't exist
    mkdir -p "$NAS_PATH"
    
    # Run rclone sync
    rclone sync "r2:$R2_BUCKET" "$NAS_PATH" \
        --transfers 10 \
        --checkers 20 \
        --progress \
        --log-file "$LOG_FILE" \
        --log-level INFO \
        --stats 30s \
        2>&1 | tee -a "$LOG_FILE"
    
    RESULT=$?
    
    if [ $RESULT -eq 0 ]; then
        log "NAS sync completed successfully"
        
        # Get stats
        TOTAL_FILES=$(find "$NAS_PATH" -type f | wc -l | tr -d ' ')
        TOTAL_SIZE=$(du -sh "$NAS_PATH" 2>/dev/null | cut -f1)
        log "Total files: $TOTAL_FILES, Total size: $TOTAL_SIZE"
    else
        log "ERROR: NAS sync failed with code $RESULT"
    fi
    
    return $RESULT
}

install_cron() {
    log "Installing cron job..."
    
    # Add cron job for 3 AM daily
    CRON_CMD="0 3 * * * $SCRIPT_DIR/nas-sync.sh >> $LOG_FILE 2>&1"
    
    # Check if already installed
    if crontab -l 2>/dev/null | grep -q "nas-sync.sh"; then
        echo "Cron job already installed"
        crontab -l | grep "nas-sync.sh"
    else
        (crontab -l 2>/dev/null || true; echo "$CRON_CMD") | crontab -
        echo "Cron job installed: runs daily at 3 AM"
    fi
}

setup_rclone() {
    echo "Setting up rclone for Cloudflare R2..."
    echo ""
    echo "Run: rclone config"
    echo ""
    echo "Then create a new remote with:"
    echo "  Name: r2"
    echo "  Type: s3"
    echo "  Provider: Cloudflare"
    echo "  Access Key ID: <from R2>"
    echo "  Secret Access Key: <from R2>"
    echo "  Endpoint: https://<account-id>.r2.cloudflarestorage.com"
    echo ""
}

# Main
case "${1:-}" in
    --install)
        install_cron
        ;;
    --setup)
        setup_rclone
        ;;
    --help)
        echo "Usage: $0 [--install|--setup|--help]"
        echo ""
        echo "Options:"
        echo "  --install  Install as cron job (daily at 3 AM)"
        echo "  --setup    Show rclone setup instructions"
        echo "  --help     Show this help"
        ;;
    *)
        check_dependencies
        check_nas_mounted
        run_sync
        ;;
esac

