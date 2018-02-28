# Nylas Connect

This tiny [Express](https://expressjs.com/) app is a simple example of how to
use Nylas NodeJS SDK. You can
connect both Exchange accounts and Gmail accounts in this example.

# Getting Started

## Initial Setup
You will need to have a Nylas [developer account](https://dashboard.nylas.com). 
On the dashboard, select the application that you want to connect to this sample 
app. Copy the application id and secret to the config code on lines 22 and 23 of
`app.js` and then on line 48 of `app.js` enter your own `sessionSecret`.

Next, you have to add the redirect URI for this sample app to your applications
callbacks. To navigate to the application callback page, go to the all applications
page and then select`edit` for your selected application. The application settings
page has two tabs, one for `Application Settings` and one for `Application Callbacks`.
Click the `Application Callbacks` tab and add the sample apps redirect URI:

```
http://localhost:3000/oauth/callback
```  
<br>
<div style="text-align:center; box-shadow: 0 7px 4px #777;"><img src ="https://user-images.githubusercontent.com/19398470/36762396-251371e6-1bd8-11e8-8a55-a981ac06062a.gif"/></div>

<br>

Install dependencies with:
```
npm install
```

# Running the app

Run the express app.

```
npm start
```

Visit http://localhost:3000 in your browser.
