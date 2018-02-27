
# RTConn
A Real Time Peer-to-peer, video conference calling, broadcasting and media processing web application. This Project is about sharing your everyday. Watch your favorite shows with your friends, without being in the same room (or even the same city!). Collaborate with your coworkers when you’re all on the road. Shop together for a birthday present for Mom, then sing her “happy birthday” with family far away. The possibilities are endless.


## Getting Started 
### Requirement

RTConn requires the following technologies to run.

- [Node.js](https://nodejs.org/) v8+
- [MongoDB](https://www.mongodb.com/) v3.4+
- [Redis](https://redis.io/) v4.0.8+
- [Docker](https://www.docker.com/) v17+

> NOTE: You don't have to install any of the stated requirement on your system (excluding **Docker**). Because all dependencies has been containerlized using docker.


### Docker
**RTConn** is very easy to install and deploy using  [Docker](https://www.docker.com/). This project includes a docker-compose.yml file that setup your enviroment with all all required technology, and get you up and running quickly.

By default, Docker-Compose will expose port 3000 on the host machine, mounted to port 3000 on the container

Ensure you have [Docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/) installed on your system. Visit the official docker page for installation procedure.

After installation, running the following command will  output somethig similar 
```sh
$ docker -v
Docker version 17.12.0-ce, build c97c6d6
$ docker-compose -v
docker-compose version 1.19.0, build 9e633ef
```
**Start up RTConn using docker-compose**
```sh
$ cd docker/dev/
$ docke-compose up
```
This will create the **RTConn** image and pull in the necessary dependencies. 

Verify the deployment by navigating to your server address in your preferred browser.

```sh
127.0.0.1:3000 
or
localhost:3000
```
## Development

Want to contribute? Great!

RTConn uses [Gulp](https://gulpjs.com/)  for fast developing.
So that when you make a change in your file and you will instantanously see updates!

#### Test
To run automated test run these commands. This will also trigger the lintting.
```sh
$ cd src/
$ npm test
```
##### Test Coverage
```sh
$ cd src/
$ npm run test:coverage
```

#### Lint
RTConn uses [ESLint](https://eslint.org/) The pluggable linting  utility  for JavaScript and JSX.
```sh
$ cd src/
$ npm run lint
or 
$ npm run lint:watch
```
> NOTE: Linting is setup as a pre-commit hook and pretest script.
##### Fix Lint 
```sh
$ cd src/
$ npm run lint:fix
```
##### Watch Lint 
```sh
$ cd src/
$ npm run lint:watch
```




#### Kubernetes + Google Cloud

Coming soon!!!


### Todos

 - Write more tests
 -  Integrate with [Kubernetes](https://kubernetes.io/)
 - Add [Jenkins](https://jenkins.io/) CI/CD pipeline
 - Deploy with [Chef](https://www.chef.io/chef/)
 - Provision infastructure using [Terraform](https://www.terraform.io/)
 - Develope RTConn


----------


**RTConn is developed and maintained by [Don Peter C. Atunalu](https://www.linkedin.com/in/don-peter-atunalu-68864494/) a student of [The European University of Lefke](http://www.eul.edu.tr/en/)  BSc. Computer Engineering, as his final year project**
