#This image is built on runtime and is used for test
FROM patunalu/node-alpine
LABEL maintainer="Don Peter C. Atunalu <peter@donpeter.me>" \
      application="RTConn"
#Set enviroment to production
ENV NODE_ENV=production

#Copy build.sh  to /usr/local/bin and make it executable
#COPY docker/release/build.sh /usr/local/bin/build.sh
#RUN chmod +x /usr/local/bin/build.sh


#Copy the src to application and make it the workig director
WORKDIR /app
COPY src/package.json src/.yarnrc src/yarn.lock /app/
# Copy npm packages for offline installatiion
COPY  src/npm-packages-offline-cache /app/npm-packages-offline-cache
#Install dependecies and remove cache modules
RUN yarn install --offline  --frozen-lockfile && \
    rm -rf npm-packages-offline-cache
COPY src /app
#ENTRYPOINT ["build.sh"]

CMD ["npm", "start"]
