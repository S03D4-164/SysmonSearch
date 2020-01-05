#!/bin/sh

mkdir logs rule_files
#cp -r ../stixioc-import-server stixioc-import-server/
docker-compose build stixioc-import-server
