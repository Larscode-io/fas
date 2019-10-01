# FAS Authorization example

test authenticate Belgian e-id with OpenId and Oauth2 in JAVASCRIPT

0. create config/default.json with your secrets and put your certificates in key2

1. run with `node ./server.js`

2. with your browser go to:

https://idp.iamfas.int.belgium.be/fas/oauth2/authorize?response_type=code&state={state}&scope={scope}&redirect_uri={redirect_uri}&nonce=1244546&client_id={client_id}&acr_values=urn:be:fedict:iam:fas:citizen:Level300

3. server.js is waiting at {redirect_uri} for something like https://ourserver/auth and will show your NRN after authenticating with your e-id
