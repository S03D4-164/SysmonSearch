FROM python

ADD ./stixioc-import-server /root/stixioc-import-server

# apt-get update && apt-get install cron 

RUN pip install tornado openioc-to-stix git+https://github.com/oasis-open/cti-stix-slider.git pyyaml elasticsearch

WORKDIR /root/stixioc-import-server/
RUN mkdir logs
