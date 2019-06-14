global.APP_ENV = 'development'
const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const fs = require('fs')
// const webpackHotMiddleware = require('webpack-hot-middleware');
// const config = require('../config/index');
const setting = require('./setting')
const utils = require('./utility')
const morgan = require('morgan')
// const pug = require('pug')

// middleware
const HelpMidWare = require('./middleware/help')
const TokenCheck = require('./middleware/tokenCheck')
const HeaderPreset = require('./middleware/headerPreset')
const CloudosCas = require('./middleware/cas')
const MorganLog = require('./middleware/log')

const devUrlPrefix = utils.getDevUrlPrefix()

// CAS
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MemoryStore = require('session-memory-store')(session);

var routers = require("./api/index");
var connectRouters = require("./api/connect/index");

const app = express();
// Serve the files on port 8080 which align to config/index.js
const LISTEN_PORT = setting.dev.listenPort;
const DIST_DIR = path.join(__dirname, '../','dist');
const webpackConfig = require('../build/webpack.server.conf.js')
const compiler = webpack(webpackConfig)

// app.set('view engine', 'pug')

// 关闭SSL验证
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
// morgan 日志记录
app.use(MorganLog)

// 当dev开启url前缀时,通过重定向加前缀
if (setting.dev.isPrefixed) {
  app.all('*', function (req, res, next) {
    if (devUrlPrefix.length == 0) {
      next()
    } else {
      if (/^\/seccloud/.test(req.url)) {
        next()
      } else {
        let newUrl = req.url.replace(/^\//,`/seccloud/`)
        res.redirect(newUrl)
      }
    }
  })
}

// 预设header
app.use(HeaderPreset)

app.use(`${devUrlPrefix}/static`, express.static('static'));
app.use(`${devUrlPrefix}/help/img`, express.static(path.join(DIST_DIR, '../help/view')));
app.use(`${devUrlPrefix}/help`, express.static(path.join(DIST_DIR, '../help/public')));
if (setting.dev.isPrefixed) {
  app.use(`${devUrlPrefix}`, express.static(path.join(DIST_DIR)));
}
app.use(cookieParser());
app.use(session({
  name: setting.session.name,
  secret: setting.session.secret,
  store: new MemoryStore(),
  resave: true,
  saveUninitialized: true
}));
// CAS
app.use(CloudosCas)

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
if (setting.isWebpackPageEnable) {
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true
  }));
  app.use(require('webpack-hot-middleware')(compiler));
}


// NOTICE: If you want to enable single sign logout, you must use casClient middleware before bodyParser.
app.use(bodyParser.json({limit: '256mb'}));
app.use(bodyParser.urlencoded({limit: '256mb', extended: true }));
// token 校验
app.use(TokenCheck)

// app.get(['/api/logout', '/logout'], function(req, res, next) {
//   var result = casClient.logout()(req, res, next)
// })

app.use(HelpMidWare)
// API Router
app.use(`${devUrlPrefix}/` + setting.API.prefix, routers)

app.get([`${devUrlPrefix}/`,`${devUrlPrefix}/index.html`], function(req, res, next) {
  const filename = path.join(DIST_DIR, 'index.html')
  compiler.outputFileSystem.readFile(filename, function(err, result) {
    if (err) {
      return (next(err))
    }
    try {
      res.writeHead(200, {
        'Content-type': 'text/html;charset=utf-8'
      })
      asySetSystemInfo().then(r => {
        res.end(updateSystemInfo(data, r))
      })
      // res.end(updateSystemName(data))
      } catch (e) {
        console.log(e)
      }
    })
  async function asySetSystemInfo() {
    let systemName = await require('./json/menu/index').getSystemTitle()
    let systemIcon = await require('./json/menu/index').getSystemIcon()
    let systemLogo = await require('./json/menu/index').getSystemLogo()
    let systemLogoWidth = await require('./json/menu/index').getSystemLogoWidth()
    return {
      'systemName': systemName,
      'systemIcon': systemIcon,
      'systemLogo': systemLogo,
      'systemLogoWidth': systemLogoWidth
    }
  }
  // 更新systemName
  function updateSystemInfo (html, obj) {
    if (html && obj) {
      // const systemName = require('./json/menu/index').getSystemTitle()
      html = html.replace(/{%SystemName%}/g, obj.systemName)
      html = html.replace(/{%iconData%}/g, obj.systemIcon)
      html = html.replace(/{%logoData%}/g, obj.systemLogo)
      html = html.replace(/{%logoWidth%}/g, obj.systemLogoWidth)
    }
    return html
  }
})

app.use('/' + setting.API.prefix, routers)
app.use(connectRouters)

app.get('/api/logout', function(req, res, next) {
  if (setting.isCasLogin) {
    var result = casClient.logout()(req, res, next)
  } else {
    
  }
})

app.get(['/','/index.html'], function(req, res, next) {
  const filename = path.join(DIST_DIR, 'index.html');
  if (setting.isDev) {
    // 开发环境
    if (setting.isWebpackPageEnable) {
      compiler.outputFileSystem.readFile(filename, function(err, result) {
        if (err) {
          return (next(err))
        }
        res.set('Content-type', 'text/html');
        res.send(result);
        res.end();
      });
    }
  } else {
    // 生产环境
    return filename
  }
});
app.listen(LISTEN_PORT, function () {
  console.log('Seccloud App is listening on port ' + LISTEN_PORT + '!\n');
})
