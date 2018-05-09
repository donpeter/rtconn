#Project variables
PROJECT_NAME ?= RTConn
ORG_NAME ?= patunalu
REPO_NAME ?= rtconn

#File location variables
DEV_COMPOSE_FILE := docker/test/docker-compose.yml
TEST_COMPOSE_FILE := docker/test/docker-compose.yml
REL_COMPOSE_FILE := docker/release/docker-compose.yml
REL_DOCKER_FILE := docker/release/Dockerfile
SPEC_DOCKER_FILE := spec/Dockerfile
NGINX_DOCKER_FILE := docker/release/nginx/Dockerfile
#Project Names
REL_PROJECT := $(PROJECT_NAME)$(BUILD_ID)
TEST_PROJECT := $(REL_PROJECT)test
DEV_PROJECT := $(REL_PROJECT)dev
APP_SERVICE_NAME := app
#Inspect docker compose exit status
INSPECT := $$(docker-compose -p $$1 -f $$2 ps -q $$3 | xargs -I ARGS docker inspect -f "{{ .State.ExitCode }}" ARGS)
#Docker registry used in tagging images - default to docker.io
DOCKER_REGISTRY ?= docker.io
DOCKER_REGISTRY_AUTH ?=
#Tag expression - can be used to evaluate sell expression a runtime
BUILD_TAG_EXPRESSION ?= date -u +%Y%m%d%H%M%S
#Shell Exprssion
BUILD_EXPRESSION := $(shell $(BUILD_TAG_EXPRESSION))
#Build tag - default to BUILD_EXPRESSION
BUILD_TAG ?= $(BUILD_EXPRESSION)
CHECK := @bash -c '\
	if [[ $(INSPECT) -ne 0 ]]; \
	then exit $(INSPECT); fi' VALUE
.PHONY: dev test release build clean push tag buildtag login logout publish

dev:
	${INFO} "Pulling latest images..."
	@ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) pull
	${INFO} "Building images..."
	@ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) build
	${INFO} "Starting up NodeJs..."
	@ docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) up node
test:
	${INFO} "Pulling latest images..."
	@ docker-compose -p $(TEST_PROJECT) -f $(TEST_COMPOSE_FILE) pull
	${INFO} "Building images..."
	@ docker-compose -p $(TEST_PROJECT) -f $(TEST_COMPOSE_FILE) build test
	${INFO} "Running  test..."
	@ docker-compose -p $(TEST_PROJECT) -f $(TEST_COMPOSE_FILE) up test
	@ docker cp $$(docker-compose -p $(TEST_PROJECT) -f $(TEST_COMPOSE_FILE) ps -q test):/app/npm-packages-offline-cache/ src/
	@ docker cp $$(docker-compose -p $(TEST_PROJECT) -f $(TEST_COMPOSE_FILE) ps -q test):/reports/. src/reports
	${CHECK} $(TEST_PROJECT) $(TEST_COMPOSE_FILE) test
	${SUCCESS} "Test complete"
release:
	${INFO} "Pulling latest images..."
	@ docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) pull test nginx
	${INFO} "Building images..."
	@ docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) build
	${INFO} "Running  Agent..."
	@ docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) up agent
	${CHECK} $(REL_PROJECT) $(REL_COMPOSE_FILE) agent
	${INFO} "Running acceptance test..."
	@ docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) up test
	@ docker cp $$(docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) ps -q test):/reports/. spec/reports
	${CHECK} $(REL_PROJECT) $(REL_COMPOSE_FILE) test
	${SUCCESS} "Acceptance test complete"
build:
	${INFO} "Building  $(ORG_NAME)/$(REPO_NAME)-spec..."
	@ docker build -f $(SPEC_DOCKER_FILE) -t $(ORG_NAME)/$(REPO_NAME)-spec spec/
	${INFO} "Building  $(ORG_NAME)/$(REPO_NAME)-nginx..."
	@ docker build -f $(NGINX_DOCKER_FILE) -t $(ORG_NAME)/$(REPO_NAME)-nginx docker/release/nginx
	${SUCCESS} "Build complete"
push:
	${INFO} "Pushing  $(ORG_NAME)/$(REPO_NAME)-spec..."
	@ docker push $(ORG_NAME)/$(REPO_NAME)-spec
	${INFO} "Pushing  $(ORG_NAME)/$(REPO_NAME)-nginx..."
	@ docker push $(ORG_NAME)/$(REPO_NAME)-nginx
	${SUCCESS} "Pushed all image"
clean:
	${INFO} "Cleaning development enviroment..."
	@docker-compose -p $(TEST_PROJECT) -f $(TEST_COMPOSE_FILE) down -v --rmi local
	@docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) down -v --rmi local
#	@docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) down -v --rmi local
	@docker images -q -f dangling=true -f label=application=$(PROJECT_NAME) | xargs -I ARGS docker rmi -f ARGS
	${SUCCESS} "Enviroment cleaned"
tag:
	@ ${INFO} "Tagging release image"
	@ $(foreach tags, $(TAG_ARGS), docker tag $(IMAGE_ID) $(DOCKER_REGISTRY)/$(ORG_NAME)/$(REPO_NAME):$(tags);)
	@ ${SUCCESS} "Tag complete"
buildtag:
	@ ${INFO} "Tagging release image"
	@ $(foreach tags, $(BUILDTAG_ARGS), docker tag $(IMAGE_ID) $(DOCKER_REGISTRY)/$(ORG_NAME)/$(REPO_NAME):$(tags).$(BUILD_TAG);)
	@ ${SUCCESS} "Tag complete"
login:
	${INFO} "Loging In..."
	@ docker login -u $$DOCKER_USER -p $$DOCKER_PASSWORD  $(DOCKER_REGISTRY_AUTH)
	${SUCCESS} "Logged in succefully to $$DOCKER_REGISTRY"
logout:
	${INFO} "Loging Out..."
	@ docker logout
	${SUCCESS} "Logged out succefully from $$DOCKER_REGISTRY"
publish:
	${INFO} "Publishing release image $(IMAGE_ID) to $(DOCKER_REGISTRY)/$(ORG_NAME)/$(REPO_NAME)..."
	@ $(foreach tags, $(shell echo $(REPO_EXPR)), docker push $(tags);)
	${SUCCESS} 	"Publish complete"

#Helper
YELLOW :="\e[1;93m"
CHK :=\xE2\x9c\x94
GREEN :="\e[1;92m"
RED :="\e[1;31m"
NC :="\e[0m"
#Shell function
INFO := @bash -c '\
	printf $(YELLOW); \
	echo -e "=====> $$1"; \
	printf $(NC)' VALUE
SUCCESS := @bash -c '\
	printf $(GREEN); \
	echo -e "=====> $$1 $(CHK)"; \
	printf $(NC)' VALUE
ERROR := bash -c '\
	printf $(RED); \
	echo -e "=====> $$1"; \
	printf $(NC);' VALUE

#Get container id
APP_CONTAINER_ID := $$(docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) ps -q $(APP_SERVICE_NAME))
#Get Image id of app image
IMAGE_ID :=	$$(docker inspect -f '{{ .Image }}' $(APP_CONTAINER_ID))
#Repo filter
ifeq ($(DOCKER_REGISTRY), docker.io)
  REPO_FILTER := $(ORG_NAME)/$(REPO_NAME)[^[:space:]|\$$]*
else
  REPO_FILTER := $(DOCKER_REGISTRY)/$(ORG_NAME)/$(REPO_NAME)[^[:space:]|\$$]*
endif
#Get Repo tags
REPO_EXPR := $$(docker inspect -f '{{range .RepoTags}}{{.}} {{end}}' $(IMAGE_ID) | grep -oh "$(REPO_FILTER)" | xargs)

#Extract tag arguments
ifeq (tag,$(firstword $(MAKECMDGOALS)))
  TAG_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  ifeq ($(TAG_ARGS),)
    $(error you must specify a tag)
  endif
  $(eval $(TAG_ARGS):;@:)
endif

#Extract buildtags arguments
ifeq (buildtag,$(firstword $(MAKECMDGOALS)))
  BUILDTAG_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  ifeq ($(BUILDTAG_ARGS),)
    $(error you must specify a tag)
  endif
 $(eval $(BUILDTAG_ARGS):;@:)
endif
