
/**
 * Module dependencies.
 */

var express = require('express');

var routes = require('./routes');
var upload = require('./routes/upload.js');
var user = require('./routes/user.js');

var http = require('http');
var path = require('path');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('home', __dirname);
app.set('image_404', '404.jpg');
app.set('image_ext', '.jpg');  //默认后缀
app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.bodyParser({
    uploadDir: path.join(__dirname, 'public', 'upload'),
    keepExtensions:true,
    limit:'5mb'
}));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use(function(req, res, next){
    var defaultImagePath = path.join(req.app.get('home'), 'public', 'assert', req.app.get('image_404'));
    res.sendfile(defaultImagePath);
});

app.use(function(err, req, res, next){
    if(err) console.err(err);
    var defaultImagePath = path.join(req.app.get('home'), 'public', 'assert', req.app.get('image_404'));
    res.sendfile(defaultImagePath);
});

app.get('/', user.index);

app.post('/upload', upload.filter_formate, upload.uploadAction); //上传
app.get('/image', routes.filter_init, routes.filter_exists, routes.filter_outputorigin_file, routes.filter_resize, routes.index);  //显示

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
