const express = require("express");
const path = require("path");
const { stringify } = require('querystring');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')))
  .use(cors())
  .use(cookieParser());


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:8888/callback";
const FRONTEND_URI = process.env.FRONTEND_URI || "http://localhost:3000";

const STATE_KEY = 'spotify_auth_state';

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";


const generateRandomString = (length) => {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  res.cookie(STATE_KEY, state);

  const scope = "user-top-read";
  res.redirect(SPOTIFY_AUTH_URL + "?" +
    stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state
    }));
});

app.get("/callback", (req, res) => {
  res.json({message: "beep bop"});
})

app.get("/refresh_token", (req, res) => {
  res.json({message: "beep bop"});
})

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, '..client/build', 'index.html'));
})

app.listen(8888, () => {
  console.log(`Listening on 8888`);
});
