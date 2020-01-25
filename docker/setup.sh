#!/bin/sh

mkdir -v -m 777 -p logs rule_files es/es-data
cp -v ../sysmon_search_plugin/winlogbeat.yml stixioc-import-server
docker-compose build stixioc-import-server
