## Getting Started

Before you start, make sure your `node` version is at least 16.14.0

## Installation

1. Run `npm install` for installing packages

2. Run `npm run dev` development server:
   or
   `yarn dev`

## .env

google_client_id=GOOGLE_CLIENT_ID
google_client_secret=GOOGLE_CLIENT_SECRET

firebase_public_api_key=FIREBASE_PUBLIC_API_KEY
firebase_auth_domain=FIREBASE_AUTH_DOMAIN
firebase_project_id=FIREBASE_PROJECT_ID

secret_current =  COOKIE_SECRET_CURRENT for google authenticated
secret_previous = COOKIE_SECRET_PREVIOUS for google authenticated

S3

key =  S3_UPLOAD_KEY    for Amazon S3
secret =  S3_UPLOAD_SECRET for Amazon S3
bucket =  S3_UPLOAD_BUCKET for Amazon S3
region = S3_UPLOAD_REGION for Amazon S3

AWS

aws_region = AWS_REGION
aws_access_key = AWS_ACCESS_KEY
aws_secret_key = AWS_SECRET_KEY


senbird_app_id = REACT_APP_SENDBIRD_APP_ID  id for senbird 

stripe_secret_key = STRIPE_SECRET_KEY  key for stripe

stripe_publishable_key = NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY publishable key for stripe

price_id_pro = PRICE_ID_PRO   id subscriptions from stripe

google_analytics="NEXT_PUBLIC_GOOGLE_ANALYTICS" id for google analytic




Open [http://localhost:3000](http://localhost:3000). If you want a different port you can specify it in the `package.json` file in the "dev" script

To test a production build run `npm run build` this will create a `build` folder. Run `npm run start` to start the production version of the app

You can use pm2 package for starting and monitoring the app. Run this command from the build folder on the server `pm2 start npm --watch --ignore-watch="node_modules" --restart-delay=10000 --name "stym-connect" -- start`
