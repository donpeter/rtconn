#This image is built on runtime and is used for test
FROM patunalu/node-centos7

#Copy build.sh  to /usr/local/bin and make it executable
COPY docker/dev/build.sh /usr/local/bin/build.sh
RUN chmod +x /usr/local/bin/build.sh

ENV NODE_MODULE_CACHE="./npm-packages-offline-cache"

#Copy the src to application and make it the workig director
COPY src /application
WORKDIR /application

ENTRYPOINT ["build.sh"]
CMD ["yarn", "test"]
