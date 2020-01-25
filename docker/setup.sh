#!/bin/sh

mkdir -m 777 -p logs rule_files es/es-data
cp ../sysmon_search_plugin/winlogbeat.yml stixioc-import-server
docker-compose build stixioc-import-server
