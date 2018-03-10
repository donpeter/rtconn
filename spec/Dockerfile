FROM patunalu/node-alpine

WORKDIR /app
COPY . /app

RUN yarn global add mocha && \
    yarn install --prefer-offline && \
    rm -rf npm-packages-offline-cache

ENTRYPOINT ["mocha"]
CMD ["--colors"]
