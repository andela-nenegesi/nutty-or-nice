global._ = require('lodash');
global.t = require('moment');

var FirebaseTokenGenerator = require("firebase-token-generator"),
  cookieParser = require('cookie-parser'),
  env = process.env.NODE_ENV || 'development',
  config = require('./config/config')[env],
  express = require('express'),
  Firebase = require("firebase"),
  Hashids = require("hashids"),
  needle = require('needle'),
  app = express(),
  bodyParser = require('body-parser'),
  Mailgun = require('mailgun').Mailgun,
  mg = new Mailgun(config.mailgun.api_key),
  rootRefUrl;

if(env === 'production') {
  rootRefUrl = "https://nuttyornice-prod.firebaseio.com/";
}
else {
  rootRefUrl = "https://nuttyornice-dev.firebaseio.com/";
}

function run(appdir) {

  var rootRef = new Firebase(rootRefUrl);

  // Authenticate the server to Firebase
  var tokenGenerator = new FirebaseTokenGenerator(config.firebase.secretKey);
  var token = tokenGenerator.createToken({uid: config.firebase.serverUID, isAdmin: true, name: 'skilltree-node-server'});
  rootRef.authWithCustomToken(token, function(error, authData) {
    if (error) {
      console.log('FAILED TO AUTHENTICATE SERVER', error);
    }
  });

  app.use(cookieParser());

  app.dir = process.cwd();

  // things to do on each request
  app.use(function (req, res, next) {
    if(env === 'production') {
      // tell the client what firebase to use
      res.cookie('rootRef', rootRefUrl);
    }
    else {
      res.cookie('rootRef', rootRefUrl);
      console.log(t().format('HH:MM'), req.method, req.url, req.socket.bytesRead);
    }
    //Tell the application the current site location
    res.cookie('siteRef','sites/lagos');

    next();
  });

  // static files
  app.use(express.static(app.dir + '/public'));

  // Standard error handling
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  // to support JSON-encoded bodies
  app.use(bodyParser.json());
  // to support URL-encoded bodies
  app.use(bodyParser.urlencoded({
    extended: true
  }));


  app.get('/invite', function(req, res) {
    console.log('invite API');
    var recipient = req.query.email;
    var sender = req.query.name;
    var uid = req.query.uid;

    //create the relationship and add the sender to it
    rootRef.child('users').child(uid).once('value', function(userSnap) {
      var senderObj = userSnap.val();
      var relationshipRef = rootRef.child('relationships').push();
      relationshipRef.child('members').child(uid).set(senderObj);
      rootRef.child('users').child(uid).child('relationship_ref').set(relationshipRef.toString());

      //send the email to the invitee
      var relationshipId = relationshipRef.key();
      var inviteUrl = 'http://' + req.get('host') + '/invites/' +  relationshipId;
      var emailBody = 'Hey! You have been invited to keep relationship scores with ' + sender + ' on Nutty Or Nice. Click ' + inviteUrl + ' to join!';

      mg.sendText(config.mailgun.email, recipient,
        'Relationship Request',
        emailBody,
        function(err) {
          if (err) {
            console.log('Oh noes: ' + err);
            res.sendStatus(500);
          }
          else {
            console.log('Success');
            res.redirect('/home');
          } 
      });
    });
  });

  app.get('/admin', function(req, res) {
    var fb_key = process.env.FB_SECRET_KEY || "MNjA9WMCqXkYj9cSotLK0w3Ma5mmjDFo4tAtDxvG";
    var uid = req.query.uid;
    var token = req.query.token;
    console.log('Checking admin', uid, token);
    rootRef.child('users').child(uid).once('value', function(userSnap) {
      var user = userSnap.val();
      if(user && user.access_token === token) {
        rootRef.child('admins').child(uid).once('value', function(snap){
          if(snap.val()){
            var tokenGenerator = new FirebaseTokenGenerator(fb_key);
            var token = tokenGenerator.createToken({uid: uid, isAdmin: true});
            console.log("PASSED AUTHORIZATION AS ADMIN", token);
            res.json(token);
          }
          else {
            console.log("FAILED AUTHORIZATION AS ADMIN");
            res.sendStatus(403);
          }
        });
      }
      else {
        console.log("HACKING ATTEMPT DETECTED");
        res.sendStatus(403);
      }
    });
  });

  app.get('/*',function(req, res){
    res.sendFile("index.html",{root:'./public'});
  });
  // Fire up server
  var server = app.listen(process.env.PORT || 5555, function() {
    console.log('Listening on port %d', server.address().port);
  });
}

run(process.cwd());
