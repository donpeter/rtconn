#Project variables
PROJECT_NAME ?= rtconn
ORG_NAME ?= patunalu
REPO_NAME ?= rtconn

#File location variables
DEV_COMPOSE_FILE := docker/test/docker-compose.yml
TEST_COMPOSE_FILE := docker/test/docker-compose.yml
REL_COMPOSE_FILE := docker/release/docker-compose.yml
#Project Names
REL_PROJECT := $(PROJECT_NAME)$(BUILD_ID)
TEST_PROJECT := $(REL_PROJECT)test
DEV_PROJECT := $(REL_PROJECT)dev
.PHONY: dev test release build clean

dev:
	docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) build
	docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) up node
test:
	docker-compose -p $(TEST_PROJECT) -f $(TEST_COMPOSE_FILE) build
	docker-compose -p $(TEST_PROJECT) -f $(TEST_COMPOSE_FILE) up test

release:
	docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) build
	docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) up test
build:
	docker build -f docker/release/Dockerfile -t $(ORG_NAME)/$(REPO_NAME) .
	docker build -f spec/Dockerfile -t $(ORG_NAME)/$(REPO_NAME)-spec spec/
	docker build -f docker/release/nginx/Dockerfile -t $(ORG_NAME)/$(REPO_NAME)-nginx docker/release/nginx
clean:
	docker-compose -p $(TEST_PROJECT) -f $(TEST_COMPOSE_FILE) down -v --rmi local
	docker-compose -p $(REL_PROJECT) -f $(REL_COMPOSE_FILE) down -v --rmi local
	docker-compose -p $(DEV_PROJECT) -f $(DEV_COMPOSE_FILE) down -v --rmi local
