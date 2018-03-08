#This image is built on runtime and is used for test
FROM patunalu/node-alpine

#Set enviroment to production
ENV NODE_ENV=production

#Copy build.sh  to /usr/local/bin and make it executable
COPY docker/release/build.sh /usr/local/bin/build.sh
RUN chmod +x /usr/local/bin/build.sh



#Copy the src to application and make it the workig director
WORKDIR /application
COPY src /application

#RUN yarn install --offline  --frozen-lockfile
USER node
ENTRYPOINT ["build.sh"]
CMD ["npm", "start"]
