# Hopscotch

## Frontend
@max please add some detailed instructions for setting up env and launching + steps for deployment etc.

### Authentication web demo
This is primarily used for manual end-to-end testing of the authentication flow. Make sure that this demo runs smoothly after any changes to the auth API. This will not be deployed.
## Create a .env file in `frontend/web-2-fac-auth-demo`
```
REACT_APP_DEMO_FIREBASE_API_KEY=...
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
PORT=5000
FIREBASE_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_REGISTERED_NUMBER=...
```

### Running the server
```
brew install redis # Make sure redis is installed
yarn install
redis-server & # Start redis server in the background
yarn start
```

Insert your own API keys or contact @michaelw54 for values used in production.
