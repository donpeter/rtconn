#Base Image
FROM patunalu/ansible

#Copy the playbook to /anisble/site.yml which will be runs by default
WORKDIR /ansible
COPY probe.yml /ansible/site.yml

#Run PlayBook
ENTRYPOINT ["ansible-playbook"]
CMD ["site.yml"]
