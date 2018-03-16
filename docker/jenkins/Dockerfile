#    pip install ansible boto boto3
FROM jenkins/jenkins:lts
LABEL maintainer="Don Peter C. Atunalu <me@donpeter.me>"

USER root

#Used to set docker group ID
#Set to 497 by default, which is the group ID used by AWS linux ECS Instance
ARG DOCKER_GID=497


#Used to control Docker and docker-compose versions instaled
#NOTE: As of February 2016, AWS Linux ECS only support Docker 1.9.1
ARG DOCKER_ENGINE=1.10.2
ARG DOCKER_COMPOSE=1.19.0

#Suppress apt installation warnings
ENV DEBIAN_FRONTEND=noninteractive

#Install base packages
RUN apt-get update \
    && apt-get install -y \
       apt-transport-https \
       ca-certificates \
       curl \
       gnupg2 \
       software-properties-common \
       apt-transport-https \
       gcc \
       make \
   && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - >/dev/null \
    && apt-key fingerprint 0EBFCD88 | grep "9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88"

#Create Docker Group with GID
# Set default value of 497 if DOCKER_GID set to blank string by docker compose
RUN groupadd -g ${DOCKER_GID:-497} docker

RUN add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    && apt-get update \
    && apt-get install -y \
       docker-ce \
       jq \
    && rm -rf /var/lib/apt/lists/* \
    && curl -L https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE:-1.19.0}/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose \
    && usermod -a -G docker jenkins \
    && usermod -a -G users jenkins \
    && systemctl enable docker

ENV SIGIL_URL https://github.com/gliderlabs/sigil/releases/download/v0.4.0/sigil_0.4.0_Linux_x86_64.tgz

RUN set -ex \
    && wget -q $SIGIL_URL -O sigil.tgz \
    && tar -zxv -C /usr/local/bin -f sigil.tgz \
    && rm sigil.tgz

USER jenkins
#Add Jenkins plugin
#COPY plugins.txt /usr/share/jenkins/plugins.txt
#RUN /usr/local/bin/plugins.sh /usr/share/jenkins/plugins.txt
