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
  rootRefUrl;

if(env === 'production') {
  rootRefUrl = "https://nuttyornice.firebaseio.com/";
}
else {
  rootRefUrl = "https://nuttyornice.firebaseio.com/";
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


  app.get('/join', function(req, res) {
    var uid = req.query.uid;
    var code = req.query.code;

    rootRef.child('organizations').child('andela').child('invites').child(code).once('value', function(inviteSnap) {
      var invite = inviteSnap.val();
      var membershipRef = rootRef.child('index/membership');
      if(invite) {
        rootRef.child('users').child(uid).once('value', function(userSnap) {
          // set user's organization
          // assign user to a cohort
          var user = userSnap.val();
          membershipRef.child(user.uid).child('org').set('andela');
          userSnap.ref().child('cohort_ref').set(invite.cohort_ref);
          var cohortRef = new Firebase(invite.cohort_ref);
          cohortRef.once('value', function(cohortSnap) {
            var cohort = cohortSnap.val();
            if(cohort.start_level_ref) {
              var startLevelRef = new Firebase(cohort.start_level_ref);
              startLevelRef.child('players').child(uid).child('percent').set(0, function(err) {
                if(err) {
                  console.log('couldnt add player to cohort level', err);
                  res.sendStatus(500);
                }
                else {
                  res.redirect('/home');
                }
              });
            }
            else {
              res.redirect('/home');
            }
          });
        });
      }
      else {
        console.log('invite not found', code);
        res.sendStatus(403);
      }
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

  //Generate cohort invite url
  app.get('/admin/generate_invite', function(req, res) {
    var cohortRef = new Firebase(req.query.cohort_ref);
    var codeExists = req.query.code_exists;
    var timestamp = t().unix();
    var hashids = new Hashids('this is my salt beyotch');
    var newCode = hashids.encode(timestamp);
    var invitesRef = rootRef.child('organizations').child('andela').child('invites');

    if(codeExists === 'false') {
      cohortRef.child('invite_code').set(newCode, function() {
        //TODO refactor this duplicate code
        invitesRef.child(newCode).child('cohort_ref').set(cohortRef.toString(), function() {
          cohortRef.child('invite_code').set(newCode, function() {
            res.sendStatus(200);
          });
        });
      });
    }
    else {
      cohortRef.child('invite_code').once('value', function(inviteSnap) {
        var inviteCode = inviteSnap.val();

        //delete invite code, generate new one, then update cohort
        invitesRef.child(inviteCode).remove(function() {
          invitesRef.child(newCode).child('cohort_ref').set(cohortRef.toString(), function() {
            cohortRef.child('invite_code').set(newCode, function() {
              res.sendStatus(200);
            });
          });
        });
      });
    }
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
