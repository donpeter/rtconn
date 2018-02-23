FROM centos:centos7

LABEL maintainer="Don Peter C. Atunalu <patunalu@yahoo.com>" \
    description="This is a NodeJs image that is based on the official centos-7 image"

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node \
  && usermod -a -G wheel node \
  && yum install wget tar -y

ENV NODE_VERSION=8.9.4 \
    YARN_VERSION=1.3.2
#Install NodeJs
RUN wget http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz \
    && tar --strip-components 1 -xzvf node-v* -C /usr/local


#Install yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version $YARN_VERSION

#Clean up
RUN rm /node-v$NODE_VERSION-linux-x64.tar.gz && \
    ln -s ~/.yarn/bin/yarn /usr/local/bin/yarn && \
    echo "NodeJS version"  && node --version && \
    echo "npm version" && npm --version && \
    echo "yarn version"  && yarn --version
CMD ["node"]





