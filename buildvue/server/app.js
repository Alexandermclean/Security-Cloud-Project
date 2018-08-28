var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var webpackConfig = require('../build/webpack-server.js');
var webpack = require('webpack');
var setting = require('./setting.js')
var DIST_DIR = path.join(__dirname, '../', 'dist')
var compiler = webpack(webpackConfig);
var app = express();

// 注册users接口
// var users = require('./routes/users');
// app.use('/users', users);

if (setting.webpack.isWebpackDev){
	app.use(webpackDevMiddleware(compiler,{
		publicPath: webpackConfig.output.publicPath,
    noInfo: true
	}));
	app.use(webpackHotMiddleware(compiler));
}

app.get(["/", "/index.html"], (req, res, next) =>{
  const filename = path.join(DIST_DIR, 'index.html');
  compiler.outputFileSystem.readFile(filename, (err, result) =>{
    if(err){
        return(next(err))
    }
    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.get(["/", "/index.html"], (req, res, next) =>{
  const filename = path.join(DIST_DIR, 'index.html');
  compiler.outputFileSystem.readFile(filename, (err, result) =>{
    if(err){
        return(next(err))
    }
    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

// // 访问静态资源
// app.use(express.static(path.resolve(__dirname, '../dist')));

// // 访问单页
// app.get('*', function (req, res) {
//   var html = fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf-8');
//   res.send(html);
// });

// 监听
app.listen(9292, function () {
  console.log('success listen...9090');
});

