const express = require("express");
const path = require("path");
const { stringify } = require('querystring');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const request = require('request');
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
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[STATE_KEY] : null;

  if (state === null || state !== storedState) {
    res.redirect(`${FRONTEND_URI}/#${stringify({error: "state_mismatch"})}`);
  } else {
    res.clearCookie(STATE_KEY);
    const authOptions = {
      url: SPOTIFY_TOKEN_URL,
      form: {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
      },
      json: true
    };
    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const accessToken = body.access_token;
        const refreshToken = body.refresh_token;
        res.redirect(
          `${FRONTEND_URI}/#${stringify({ accessToken, refreshToken})}`,
        );
      } else {
        res.redirect(`${FRONTEND_URI}/#${stringify({ error: 'invalid_token' })}`);
      }
    });
  }
});

app.get("/refresh_token", (req, res) => {
  const refreshToken = req.query.refresh_token;
  const authOptions = {
    url: SPOTIFY_TOKEN_URL,
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
    },
    json: true
  };
  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const accessToken = body.access_token;
      res.send({ "access_token": accessToken });
    }
    // TODO: else
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, '..client/build', 'index.html'));
});

app.listen(8888, () => {
  console.log(`Listening on 8888`);
});
