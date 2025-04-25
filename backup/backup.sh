#!/bin/bash

echo "[ DATABASE BACKUP ][ Backup MongoDB... ]"
mongodump --out /data/dump/mongo-dump
echo "[ DATABASE BACKUP ][ Backup complete in ./backup/ ]"

