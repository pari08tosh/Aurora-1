# Base image
FROM ubuntu:16.04

RUN apt-get update -y
RUN apt-get upgrade -y

# Installing launguages
RUN apt-get install nodejs -y && apt-get install nodejs-legacy -y && apt-get install npm -y
RUN apt-get update -y && apt-get install openjdk-8-jdk -y
RUN apt-get install perl php ruby -y
RUN apt-get install build-essential && apt-get install python3 -y && apt-get install python3-pip -y
RUN ln -s /usr/bin/mcs /usr/bin/gmcs

# Install dependency pymysql
RUN pip3 install pymysql

# Setup user judge
RUN chmod 700 /tmp
RUN useradd -m -u 8723 -s /bin/bash judge
WORKDIR /home/judge
COPY judge.py .
RUN mkdir env io_cache
RUN chmod 755 env
RUN chmod 700 io_cache
RUN chown judge env
RUN chgrp judge env
RUN chmod 600 judge.py

CMD ["sh", "-c", "python3 judge.py -judge -cache"]