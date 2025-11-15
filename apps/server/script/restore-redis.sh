#!/bin/bash
# ===== restore-redis.sh - Redis Restore Script =====

BACKUP_FILE=$1
REDIS_CONTAINER="firma-redis"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Usage: ./restore-redis.sh <backup_file.tar.gz>${NC}"
  echo ""
  echo "Available backups:"
  ls -lh ./backups/redis/redis_backup_*.tar.gz 2>/dev/null || echo "No backups found"
  exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

echo -e "${YELLOW}🔄 Starting Redis Restore...${NC}"
echo -e "${YELLOW}   Backup: $BACKUP_FILE${NC}"

# Ask for confirmation
read -p "Are you sure you want to restore Redis from this backup? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo -e "${RED}❌ Restore cancelled${NC}"
  exit 0
fi

# Stop Redis container
echo -e "${YELLOW}   Stopping Redis container...${NC}"
docker stop $REDIS_CONTAINER

# Extract backup to temp directory
TEMP_DIR="/tmp/redis_restore_$$"
mkdir -p $TEMP_DIR

echo -e "${YELLOW}   Extracting backup...${NC}"
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# Check what files we have
if [ -f "$TEMP_DIR/dump_"*.rdb ]; then
  RDB_FILE=$(ls $TEMP_DIR/dump_*.rdb)
  echo -e "${GREEN}   Found RDB file: $(basename $RDB_FILE)${NC}"
fi

if [ -f "$TEMP_DIR/appendonly_"*.aof ]; then
  AOF_FILE=$(ls $TEMP_DIR/appendonly_*.aof)
  echo -e "${GREEN}   Found AOF file: $(basename $AOF_FILE)${NC}"
fi

# Copy files to Redis data directory
if [ ! -z "$RDB_FILE" ]; then
  echo -e "${YELLOW}   Copying RDB file to Redis...${NC}"
  docker cp "$RDB_FILE" $REDIS_CONTAINER:/data/dump.rdb
fi

if [ ! -z "$AOF_FILE" ]; then
  echo -e "${YELLOW}   Copying AOF file to Redis...${NC}"
  docker cp "$AOF_FILE" $REDIS_CONTAINER:/data/appendonly.aof
fi

# Start Redis container
echo -e "${YELLOW}   Starting Redis container...${NC}"
docker start $REDIS_CONTAINER

# Wait for Redis to be ready
echo -e "${YELLOW}   Waiting for Redis to be ready...${NC}"
sleep 5

# Verify connection
if docker exec $REDIS_CONTAINER redis-cli PING | grep -q "PONG"; then
  echo -e "${GREEN}✅ Redis restored successfully!${NC}"
  
  # Get key count
  KEYS=$(docker exec $REDIS_CONTAINER redis-cli DBSIZE)
  echo -e "${GREEN}   Keys in database: $KEYS${NC}"
else
  echo -e "${RED}❌ Redis restore failed - container not responding${NC}"
  exit 1
fi

# Cleanup temp directory
rm -rf $TEMP_DIR

echo -e "${GREEN}✅ Restore completed!${NC}"