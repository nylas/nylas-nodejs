# Nylas Connect

This tiny [Express](https://expressjs.com/) app is a simple example of how to
use Nylas NodeJS SDK. You can
connect both Exchange accounts and Gmail accounts in this example.

# Getting Started

## Initial Setup
You will need to have a Nylas [developer account](https://dashboard.nylas.com). 
On the dashboard, select the application that you want to connect to this sample 
app. Copy the application id and secret to the config code on lines 19 and 20 of
`app.js`.

Next, you have to add the redirect URI for this sample app to your applications
callbacks. To navigate to the application callback page, go to the all applications
page and then select`edit` for your selected application. The application settings
page has two tabs, one for `Application Settings` and one for `Application Callbacks`.
Click the `Application Callbacks` tab and add the sample apps redirect URI:
```
http://localhost:3000/oauth/callback
```  


Then install dependencies with:
```
npm install
```

# Running the app

Run the express app.

```
npm start
```

Visit http://localhost:3000 in your browser.
