#!/bin/sh

mkdir logs && chmod 777 logs
mkdir rule_files && chmod 777 rule_files
#cp -r ../stixioc-import-server stixioc-import-server/
docker-compose build stixioc-import-server
