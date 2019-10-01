const https = require('https')
const express = require('express')
const fs = require('fs')
const crypto = require('crypto');
const url = require('url');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const request = require('request');
const jwt_decode = require('jwt-decode');
const config = require('config');
var rP = require('request-promise');

var privateKey = fs.readFileSync(__dirname + '/key2/server.key', 'utf8');
var certificate = fs.readFileSync(__dirname + '/key2/server.crt', 'utf8');
var b1 = fs.readFileSync(__dirname + '/key2/TrustedRoot.crt', 'utf8'); // root
var b2 = fs.readFileSync(__dirname + '/key2/DigiCertCA.crt', 'utf8'); // intermediate
var httpsServerOptions = {
	key: privateKey,
	cert: certificate,
  	ca: [b2, b1]
};

const FAS_USER = config.get('Fas.clientId');
const FAS_PASS = config.get('Fas.clientSecret');
const FAS_REDIRECT_URI = config.get('Fas.redirectUri');
const FAS_ACCESSTOKEN_URI = config.get('Fas.accessTokenUri');
const FAS_USERINFO_URI = config.get('Fas.userinfoUri');

function PromisePost (code) {
  var optionsPost = { method: 'POST', url: FAS_ACCESSTOKEN_URI, json: true, form: { grant_type: 'authorization_code', code: code, redirect_uri: FAS_REDIRECT_URI, },
    auth: { user: FAS_USER, pass: FAS_PASS },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
  return new rP(optionsPost)
      .then( body => body['access_token'] )
};
function PromiseGet (token) {
  var optionsGet = { method: 'GET', url: FAS_USERINFO_URI, headers: { 'Authorization': 'Bearer' + ' ' + token }, json:true };
  return rP(optionsGet)
    .then( res => jwt_decode(res)['egovNRN'] )
  };

const app = express();
app.use(express.json());
app.get('/auth', function(req, res) {
  var parsedQs            = querystring.parse(url.parse(req.url).query);
  var authorization_code  = parsedQs['code']; // authorization_code
  var state               = parsedQs['state']; // API clients should use this initial request State value to match callbacks to requests and reject any callbacks that do not matched

  // async function which will wait for the HTTP request to be finished
  async function makeSynchronousRequest(request) {
  	try {
  		let http_promise1 = PromisePost(authorization_code);
  		let token = await http_promise1;
  		let http_promise2 = PromiseGet(token);
  		let NRN = await http_promise2;
      console.log('NRN: ' + NRN);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.status(200).end(NRN + "\n");
  	}
  	catch(error) {
  		console.log(error);
  	}
  }
  makeSynchronousRequest();

});

https.createServer(httpsServerOptions, app).listen(4433, '172.18.0.111', function() {
    //console.log(options.cert);
    console.log("server listening...");
  }
);
