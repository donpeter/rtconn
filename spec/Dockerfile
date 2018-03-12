FROM patunalu/node-alpine
LABEL maintainer="Don Peter C. Atunalu <peter@donpeter.me>" \
      application="RTConn"
WORKDIR /app
COPY . /app

RUN yarn global add mocha && \
    yarn install --prefer-offline && \
    rm -rf npm-packages-offline-cache

ENTRYPOINT ["mocha"]
CMD ["--colors"]
