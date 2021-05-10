# Hopscotch

## Frontend
@max please add some detailed instructions for setting up env and launching + steps for deployment etc.

### Authentication web demo
This is primarily used for manual end-to-end testing of the authentication flow. Make sure that this demo runs smoothly after any changes to the auth API. This will not be deployed.
## Create a .env file in `frontend/web-2-fac-auth-demo`
```
REACT_APP_DEMO_FIREBASE_API_KEY=...
REACT_APP_API_BASE_URL=http://localhost:5000 or https://hopscotch-backend.herokuapp.com depending on if you're testing locally or with deployed server
```

### Running the web app
```
yarn install
yarn start
```
## Backend

Within the backend directory 

### Create a .env file in `backend`
```
FIREBASE_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_REGISTERED_NUMBER=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
BASE_URL=http://localhost:5000 (or your production server domain)
GOOGLE_CREDENTIALS_TYPE=...
GOOGLE_CREDENTIALS_PROJECT_ID=...
GOOGLE_CREDENTIALS_PRIVATE_KEY_ID=...
GOOGLE_CREDENTIALS_PRIVATE_KEY=...
GOOGLE_CREDENTIALS_CLIENT_EMAIL=...
GOOGLE_CREDENTIALS_CLIENT_ID=...
GOOGLE_CREDENTIALS_AUTH_URI=...
GOOGLE_CREDENTIALS_TOKEN_URI=...
GOOGLE_CREDENTIALS_AUTH_PROVIDER_X509_CERT_URL=...
GOOGLE_CREDENTIALS_CLIENT_X509_CERT_URL=...
```
The values for the environment variables prefixed with GOOGLE_CREDENTIALS can be downloaded from firebase console.

### Running the server locally
```
brew install redis # Make sure redis is installed
yarn install
redis-server & # Start redis server in the background
yarn start
```

### Running the server via docker compose
From the backend directory:
```
docker-compose up --build
```

### **Deploying container to Heroku**
See [this heroku article](https://devcenter.heroku.com/articles/local-development-with-docker-compose) about developing locally with docker compose
and then deplying to heroku.

Authenticate to Heroku
```
heroku login
heroku container:login
```

Once you have tested locally via `docker-compose up`, push and release changes to heroku by doing:
```
heroku container:push web -a hopscotch-backend
heroku container:release web -a hopscotch-backend
```

### Linting
Using eslint-airbnb
```
yarn lint
```

Insert your own API keys or contact @michaelw54 for values used in production.
