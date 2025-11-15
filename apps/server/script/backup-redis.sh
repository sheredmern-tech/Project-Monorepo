#!/bin/bash
# ===== backup-redis.sh - Redis Backup Script =====

BACKUP_DIR="./backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)
REDIS_CONTAINER="firma-redis"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Starting Redis Backup...${NC}"

# Create backup directory
mkdir -p $BACKUP_DIR

# Check if Redis container is running
if ! docker ps | grep -q $REDIS_CONTAINER; then
    echo -e "${RED}❌ Redis container is not running!${NC}"
    exit 1
fi

# Trigger background save
echo -e "${YELLOW}   Triggering BGSAVE...${NC}"
docker exec $REDIS_CONTAINER redis-cli BGSAVE

# Wait for save to complete
echo -e "${YELLOW}   Waiting for Redis to complete save...${NC}"
sleep 5

# Check if save completed
SAVE_STATUS=$(docker exec $REDIS_CONTAINER redis-cli LASTSAVE)
echo -e "${GREEN}   Last save timestamp: $SAVE_STATUS${NC}"

# Copy RDB file
echo -e "${YELLOW}   Copying RDB file...${NC}"
docker cp $REDIS_CONTAINER:/data/dump.rdb $BACKUP_DIR/dump_$DATE.rdb

# Copy AOF file (if exists)
echo -e "${YELLOW}   Copying AOF file...${NC}"
docker cp $REDIS_CONTAINER:/data/appendonly.aof $BACKUP_DIR/appendonly_$DATE.aof 2>/dev/null || echo "   (AOF file not found, skipping)"

# Compress backups
echo -e "${YELLOW}   Compressing backups...${NC}"
tar -czf $BACKUP_DIR/redis_backup_$DATE.tar.gz -C $BACKUP_DIR dump_$DATE.rdb appendonly_$DATE.aof 2>/dev/null

# Remove uncompressed files
rm -f $BACKUP_DIR/dump_$DATE.rdb
rm -f $BACKUP_DIR/appendonly_$DATE.aof

# Get backup size
BACKUP_SIZE=$(du -h $BACKUP_DIR/redis_backup_$DATE.tar.gz | cut -f1)

# Keep only last 7 days of backups
echo -e "${YELLOW}   Cleaning old backups (keeping last 7 days)...${NC}"
find $BACKUP_DIR -name "redis_backup_*.tar.gz" -mtime +7 -delete

# Count remaining backups
BACKUP_COUNT=$(ls -1 $BACKUP_DIR/redis_backup_*.tar.gz 2>/dev/null | wc -l)

echo -e "${GREEN}✅ Redis backup completed!${NC}"
echo -e "${GREEN}   File: redis_backup_$DATE.tar.gz${NC}"
echo -e "${GREEN}   Size: $BACKUP_SIZE${NC}"
echo -e "${GREEN}   Total backups: $BACKUP_COUNT${NC}"