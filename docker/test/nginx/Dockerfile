# Set nginx base image
FROM nginx:1.13-alpine

# Image Author / Maintainer
LABEL maintainer="Don Peter C. Atunalu <peter@donpeter.me>" \
      application="RTConn"
# Copy custom configuration file from the current directory
COPY nginx.conf /etc/nginx/nginx.conf
COPY ./localhost.crt /etc/nginx/localhost.crf
COPY ./localhost.key /etc/nginx/localhost.key