/*jshint node:true*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var watson = require('watson-developer-cloud');
var credentials = require('./credentials');
var express = require('express');
var multer = require('multer');
var fs = require('fs');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// the watson visual recognition service
var visualRecognitionService = watson.visual_recognition({
  username : credentials.username,
  password : credentials.password,
  version : 'v1'
});

// file upload handler
app.post('/upload', [multer({dest: './photos'}), function(req, res) {
  var photo = req.files.photo;
  var params = {
    image_file: fs.createReadStream(photo.path)
  }
  visualRecognitionService.recognize(params, function(err, result){
    fs.unlinkSync(photo.path);
    if (err)
      return res.send(500).send(err);
    result.images[0].image_name = photo.originalname;
    res.send(result);
  });
}]);

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
