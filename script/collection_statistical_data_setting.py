#!/usr/bin/env python
# -*- coding: utf-8 -*-

#http service port
ELASTICSEARCH_SERVER = "elasticsearch"
INDEX_NAME_ORG = "winlogbeat"
INDEX_NAME = "sysmon-search-statistics"
MAX_GET_SIZE = 10000
WINLOGBEAT_YML = "/root/script/winlogbeat.yml"
#WINLOGBEAT_YML = "../sysmon_search_plugin/winlogbeat.yml"

#IP address to exclude from statistics
EXCLUDED_IPADDRESS = [
]

#process to exclude from statistics
EXCLUDED_PROCESS = [
]
