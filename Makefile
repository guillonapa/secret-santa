# heroku deployment
heroku-login:
	heroku login
	heroku container:login

heroku-deploy:
	heroku container:push web --app $(HEROKU_APP_NAME)
	heroku container:release web --app $(HEROKU_APP_NAME)

heroku-logs:
	heroku logs --tail --app $(HEROKU_APP_NAME)

# exports env variables and installs dependencies
init:
	@echo "Exporting environmental variables..."
	@. .env
	@echo "Installing backend dependencies..."
	@cd backend; \
	npm install
	@echo "Installing frontend (client) dependencies..."
	@cd client; \
	npm install

# remove installed dependencies
clean:
	@echo "Cleaning project..."
	@rm -rf node_modules; \
	rm -rf backend/node_modules; \
	rm -rf client/node_modules


# locally start the backend
local-backend: 
	@echo "Starting backend service..."
	@cd backend; \
	npm run dev

# locally start the frontend
local-frontend:
	@echo "Starting frontend service (client)..."
	@cd client; \
	npm start

# run app in local container
docker-container:
	@echo "Creating Docker image..."
	@docker build -t santa-app .
	@echo "Starting Docker container..."
	@docker run -it -p  3080:3080 santa-app