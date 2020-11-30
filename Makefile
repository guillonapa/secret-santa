# heroku deployment
heroku-login:
	heroku login
	heroku container:login

heroku-deploy:
	heroku container:push web --app $(HEROKU_APP_NAME)
	heroku container:release web --app $(HEROKU_APP_NAME)

heroku-logs:
	heroku logs --tail --app $(HEROKU_APP_NAME)

# local build (in two different terminals)
local-backend: 
	cd backend; \
	pwd; \
	npm install; \
	npm run dev

local-frontend:
	cd client; \
	npm install; \
	npm start

# run app in local container
docker-container:
	docker build -t santa-app .
	docker run -it -p  3080:3080 santa-app