#!make

# exports the needed environment variables
include envfile

# prefix for info messages
ECHO_PREFIX := >>>

# heroku deployment
heroku-login:
	heroku login
	heroku container:login

heroku-deploy:
	heroku container:push web --app $(HEROKU_APP_NAME)
	heroku container:release web --app $(HEROKU_APP_NAME)

heroku-logs:
	heroku logs --tail --app $(HEROKU_APP_NAME)

# installs dependencies
init:
	@echo "$(ECHO_PREFIX) Installing backend dependencies..."
	cd backend; \
	npm install
	@echo "$(ECHO_PREFIX) Installing frontend (client) dependencies..."
	cd client; \
	npm install

# removes installed dependencies
clean:
	@echo "$(ECHO_PREFIX) Cleaning project..."
	rm -rf node_modules; \
	rm -rf backend/node_modules; \
	rm -rf client/node_modules

# starts the postgresql service
db-start:
	@echo "$(ECHO_PREFIX) Starting database service..."
	pg_ctl -D /usr/local/var/postgres start

# stops the postgresql service
db-stop:
	@echo "$(ECHO_PREFIX) Stopping database service..."
	pg_ctl -D /usr/local/var/postgres stop

# creates the db with the defined tables
db-create:
	@echo "$(ECHO_PREFIX) Creating new database 'santa-app'..."
	psql postgres < backend/db/schema.sql

# starts the backend locally
local-backend: 
	@echo "$(ECHO_PREFIX) Starting backend service..."
	cd backend; \
	npm run dev

# starts the frontend locally
local-frontend:
	@echo "$(ECHO_PREFIX) Starting frontend service (client)..."
	cd client; \
	npm start

# checks if the image exists or not
IMAGE_EXITSTS := "false"
IMAGE_ID := $(shell docker images -q santa-app)
ifneq ($(IMAGE_ID), )
IMAGE_EXITSTS := "true"
endif
CONTAINER_RUNNING := "false"
CONTAINER_ID_RUNNING := $(shell docker ps -q -f name=santa-app)
ifneq ($(CONTAINER_ID_RUNNING), )
CONTAINER_RUNNING := "true"
endif
CONTAINER_EXITSTS := "false"
CONTAINER_ID_STOPPED := $(shell docker ps -qa -f name=santa-app)
ifneq ($(CONTAINER_ID_STOPPED), )
CONTAINER_EXITSTS := "true"
endif

# run app in local container
docker-start:
ifeq ($(IMAGE_EXITSTS), "false")
	@echo "$(ECHO_PREFIX) Creating Docker image..."
	docker build -t santa-app .
endif
	@echo "$(ECHO_PREFIX) Starting Docker container..."
	docker run -it -p 3080:3080 --name santa-app santa-app

# stops the app's container
docker-stop:
ifeq ($(CONTAINER_RUNNING), "true")
	@echo "$(ECHO_PREFIX) Stopping Docker container..."
	docker container stop santa-app
endif
ifeq ($(CONTAINER_EXITSTS), "true")
	@echo "$(ECHO_PREFIX) Removing Docker container..."
	docker container rm santa-app
endif

# removes the docker image
docker-clean: docker-stop
	@echo "$(ECHO_PREFIX) Removing Docker image..."
ifeq ($(IMAGE_EXITSTS), "true")
	docker rmi -f santa-app
endif
