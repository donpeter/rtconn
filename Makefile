.PHONY: test release build clean

test:
	docker-compose -f docker/test/docker-compose.yml build
	docker-compose -f docker/test/docker-compose.yml up test

release:
	docker-compose -f docker/release/docker-compose.yml build
	docker-compose -f docker/release/docker-compose.yml up test
build:
	docker build -f docker/test/Dockerfile -t patunalu/rtconn .
clean:
	docker-compose -f docker/test/docker-compose.yml down
	docker-compose -f docker/release/docker-compose.yml down
