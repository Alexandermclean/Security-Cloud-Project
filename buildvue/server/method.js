HttpGetData: function (path, reqData, apiVersion, isRequestNSSA, reqAddrType) {
    isRequestNSSA = isRequestNSSA || false
    let url = checkNeesApiVersion(path, apiVersion)
    let hostIP = ''
    let hostPort = ''
    let requestWay = 'http'
    var requestActionType = null // 请求对象 赋予http或https
    var options = {
      hostname: this.getHostIpAddress(),
      port: setting.API.port,
      path: url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }
    // 生成环境nginx添加的真实ip
    if (reqData.headers['x-real-ip']) {
      options.headers['x-real-ip'] = reqData.headers['x-real-ip']
    }
    if (reqData.headers['x-forwarded-for']) {
      options.headers['x-forwarded-for'] = reqData.headers['x-forwarded-for']
    }
    var me = this
    // 判断是否为请求态势感知，给请求options赋值
    return new Promise(function(resolve, reject) {
      try {
        if (isRequestNSSA) {
          var requsetApi = {}
            redisData.get('nssaApi', function (err, redisRes) {
              if ( err || (isJsonString(redisRes) && (redisRes === '{}' || !JSON.parse(redisRes))) ) {
                redisData.del('nssaApi')
                console.log('get nssaApi error or redisRes empty:', err)
                reject('set post request options error')
              } else {
                requsetApi = switchRequsetApi(reqData, reqAddrType, redisRes)
                requestWay = requsetApi.hostWay
                options.path = !requsetApi.basepath || requsetApi.basepath === '/'
                  ? options.path
                  : requsetApi.basepath + options.path
                options.hostname = requsetApi.hostIP
                options.port = requsetApi.hostPort
                options.auth = JSON.parse(redisRes).username + ':' + JSON.parse(redisRes).password
                options.headers['Authorization'] = 'Basic ' + Buffer.from(options.auth, 'utf8').toString('base64')
                resolve(options)
              }     
            })      
        } else {
          options.hostname = me.getHostIpAddress()
          options.port = setting.API.port
          var token = getTokenFromReq(reqData)
          if (token) {
            options.headers['X-Auth-token'] = token
          }
          resolve(options)
        }
      } catch (e) {
        redisData.del('nssaApi')
        console.log(path + ' :set post request options error', e)
        reject('set post request options error')
      }
    }).then(reqOptions => {
        // 判断https 或 http
        if (requestWay === 'https') {
          reqOptions['rejectUnauthorized'] = false
          requestActionType = https
        } else {
          requestActionType = http
        }
        return new Promise(function(resolve, reject) {
          var req = requestActionType.get(reqOptions, function(res) {
            var responseData = [];
            var size = 0;
            res.on('data', function (charCodeStr) {
              responseData.push(charCodeStr);
              size += charCodeStr.length
            });
            res.on('end', function (res) {
              var buf = Buffer.concat(responseData, size)
              var sString = buf.toString()
              if (isJsonString(sString)) {
                resolve(JSON.parse(sString))
              } else {
                resolve(sString)
              }
            });
          });
          req.on('error', function(error) {
            console.log(error)
            reject(error)
          })
        })
    })
  },
  /**
   * 调用core层接口,post方法
   */
  HttpPostData: function (path, reqData, postData, apiVersion, isRequestNSSA, reqAddrType) {
    isRequestNSSA = isRequestNSSA || false
    let url = checkNeesApiVersion(path, apiVersion)
    let hostIP = ''
    let hostPort = ''
    var requestWay = 'http'
    var requestActionType = null // 请求对象 赋予http或https
    postData = postData || {}    
    if (!isRequestNSSA && postData.page && postData.size) {
      url = url + '?' + 'page=' + postData.page + '&size=' + postData.size
      if (postData.sort && postData.direction) {
        url = url + '&sort=' + postData.sort + '&direction=' + postData.direction
      }
    }
    var postData = JSON.stringify(postData)   
    var options = {
      hostname: this.getHostIpAddress(),
      port: setting.API.port,
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }
    // 生产环境nginx添加的真实ip
    if (reqData.headers['x-real-ip']) {
      options.headers['x-real-ip'] = reqData.headers['x-real-ip']
    }
    if (reqData.headers['x-forwarded-for']) {
      options.headers['x-forwarded-for'] = reqData.headers['x-forwarded-for']
    }
    var me = this
    // 判断是否为请求态势感知，给请求options赋值
    return new Promise(function(resolve, reject) {
      try {
        if (isRequestNSSA) {
          var requsetApi = {}
            redisData.get('nssaApi', function (err, redisRes) {
              if ( err || (isJsonString(redisRes) && (redisRes === '{}' || !JSON.parse(redisRes))) ) {
                redisData.del('nssaApi')
                console.log('get nssaApi error or redisRes empty:', err)
                reject('get nssaApi error or redisRes empty')
              } else {
                requsetApi = switchRequsetApi(reqData, reqAddrType, redisRes)
                requestWay = requsetApi.hostWay
                options.path = !requsetApi.basepath || requsetApi.basepath === '/'
                  ? options.path
                  : requsetApi.basepath + options.path
                options.hostname = requsetApi.hostIP
                options.port = requsetApi.hostPort
                options.auth = JSON.parse(redisRes).username + ':' + JSON.parse(redisRes).password
                options.headers['Authorization'] = 'Basic ' + Buffer.from(options.auth, 'utf8').toString('base64')
                resolve(options)
              }     
            })      
        } else {
          options.hostname = me.getHostIpAddress()
          options.port = setting.API.port
          var token = getTokenFromReq(reqData)
          if (token) {
            options.headers['X-Auth-token'] = token
          }
          resolve(options)
        }
      } catch (e) {
        redisData.del('nssaApi')
        console.log(path + 'set post request options error:', e)
        reject('set post request options error')
      }
    }).then(reqOptions => {
        // 判断https 或 http
        if (requestWay === 'https') {
          reqOptions['rejectUnauthorized'] = false
          requestActionType = https
        } else {
          requestActionType = http
        }
        return new Promise(function(resolve, reject) {
          var req = requestActionType.request(reqOptions, function(res) {
            var responseData = [];
            var size = 0;
            res.on('data', function (charCodeStr) {
              responseData.push(charCodeStr);
              size += charCodeStr.length
            });
            res.on('end', function (res) {
              var buf = Buffer.concat(responseData, size)
              var sString = buf.toString()
              if (isJsonString(sString)) {
                resolve(JSON.parse(sString))
              } else {
                resolve(sString)
              }
            });
          });
          req.write(postData)
          req.end()
          req.on('error', function(error) {
            reject(error)
          })
        })
    })
  },
  /**
   * 调用core层接口,put方法
   */
  HttpPutData: function (path, reqData, postData, apiVersion, isRequestNSSA) {
    isRequestNSSA = isRequestNSSA || false
    let url = checkNeesApiVersion(path, apiVersion)
    let hostIP = ''
    let hostPort = ''
    try {
      hostIP = isRequestNSSA ? reqData.session.nssaApi.HOST_IP : this.getHostIpAddress()
      hostPort = isRequestNSSA ? reqData.session.nssaApi.HOST_PORT : setting.API.port
    } catch (e) {
      hostIP = this.getHostIpAddress()
      hostPort = setting.API.port
    }
    postData = postData || {}    
    if (!isRequestNSSA && postData.page && postData.size) {
      url = url + '?' + 'page=' + postData.page + '&size=' + postData.size
      if (postData.sort && postData.direction) {
        url = url + '&sort=' + postData.sort + '&direction=' + postData.direction
      }
    }
    var postData = JSON.stringify(postData)
    var options = {
      hostname: hostIP,
      port: hostPort,
      path: url,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    };
    if (reqData.headers['x-real-ip']) {
      options.headers['x-real-ip'] = reqData.headers['x-real-ip']
    }
    if (reqData.headers['x-forwarded-for']) {
      options.headers['x-forwarded-for'] = reqData.headers['x-forwarded-for']
    }
    if (isRequestNSSA) {
      try {
        options.auth = reqData.session.nssaApi.admin + ':' + reqData.session.nssaApi.password
      } catch (e) {
        options.auth = 'admin:admin'
      }
      options.headers['Authorization'] = 'Basic ' + Buffer.from(options.auth, 'utf8').toString('base64')
      return new Promise(function(resolve, reject) {
        var req = https.request(options, function(res) {
          var responseData = [];
          var size = 0;
          res.on('data', function (charCodeStr) {
            responseData.push(charCodeStr);
            size += charCodeStr.length
          });
          res.on('end', function (res) {
            var buf = Buffer.concat(responseData, size)
            var sString = buf.toString()
            if (isJsonString(sString)) {
              resolve(JSON.parse(sString))
            } else {
              resolve(sString)
            }
          });
        });
        req.write(postData)
        req.end()
        req.on('error', function(error) {
          console.log(error)
          reject(error)
        })
      })
    } else {
      var token = getTokenFromReq(reqData)
      if (token) {
        options.headers['X-Auth-token'] = token
      }
      return new Promise(function(resolve, reject) {
        var req = http.request(options, function(res) {
          var responseData = [];
          var size = 0;
          res.on('data', function (charCodeStr) {
            responseData.push(charCodeStr);
            size += charCodeStr.length
          });
          res.on('end', function (res) {
            var buf = Buffer.concat(responseData, size)
            var sString = buf.toString()
            if (isJsonString(sString)) {
              resolve(JSON.parse(sString))
            } else {
              resolve(sString)
            }
          });
        });
        req.write(postData)
        req.end()
        req.on('error', function(error) {
          console.log(error)
          reject(error)
        })
      })
    }
  },
  /**
   * 调用core层接口,delete方法
   */
  HttpDeleteData: function (path, reqData, postData, apiVersion, isRequestNSSA) {
    isRequestNSSA = isRequestNSSA || false
    let url = checkNeesApiVersion(path, apiVersion)
    let hostIP = ''
    let hostPort = ''
    try {
      hostIP = isRequestNSSA ? reqData.session.nssaApi.HOST_IP : this.getHostIpAddress()
      hostPort = isRequestNSSA ? reqData.session.nssaApi.HOST_PORT : setting.API.port
    } catch (e) {
      hostIP = this.getHostIpAddress()
      hostPort = setting.API.port
    }
    postData = postData || {}    
    if (!isRequestNSSA && postData.page && postData.size) {
      url = url + '?' + 'page=' + postData.page + '&size=' + postData.size
      if (postData.sort && postData.direction) {
        url = url + '&sort=' + postData.sort + '&direction=' + postData.direction
      }
    }
    var postData = JSON.stringify(postData)
    var options = {
      hostname: hostIP,
      port: hostPort,
      path: url,
      method: 'DELETE',
      headers: {
        'X-Auth-token': reqData.session.cas.attributes.token,
        'Content-Type': 'application/json;charset=UTF-8'
      }
    };
    if (reqData.headers['x-real-ip']) {
      options.headers['x-real-ip'] = reqData.headers['x-real-ip']
    }
    if (reqData.headers['x-forwarded-for']) {
      options.headers['x-forwarded-for'] = reqData.headers['x-forwarded-for']
    }
    if (isRequestNSSA) {
      try {
        options.auth = reqData.session.nssaApi.admin + ':' + reqData.session.nssaApi.password
      } catch (e) {
        options.auth = 'admin:admin'
      }
      options.headers['Authorization'] = 'Basic ' + Buffer.from(options.auth, 'utf8').toString('base64')
      return new Promise(function(resolve, reject) {
        var req = http.request(options, function(res) {
          var responseData = [];
          var size = 0;
          res.on('data', function (charCodeStr) {
            responseData.push(charCodeStr);
            size += charCodeStr.length
          });
          res.on('end', function (res) {
            var buf = Buffer.concat(responseData, size)
            var sString = buf.toString()
            if (isJsonString(sString)) {
              resolve(JSON.parse(sString))
            } else {
              resolve(sString)
            }
          });
        });
        req.write(postData)
        req.end()
        req.on('error', function(error) {
          console.log(error)
          reject(error)
        })
      })
    } else {
      var token = getTokenFromReq(reqData)
      if (token) {
        options.headers['X-Auth-token'] = token
      }
      return new Promise(function(resolve, reject) {
        var req = http.request(options, function(res) {
          var responseData = [];
          var size = 0;
          res.on('data', function (charCodeStr) {
            responseData.push(charCodeStr);
            size += charCodeStr.length
          });
          res.on('end', function (res) {
            var buf = Buffer.concat(responseData, size)
            var sString = buf.toString()
            if (isJsonString(sString)) {
              resolve(JSON.parse(sString))
            } else {
              resolve(sString)
            }
          });
        });
        req.write(postData)
        req.end()
        req.on('error', function(error) {
          console.log(error)
          reject(error)
        })
      })
    }
  },
  /**
   *  云运维上传文件(文件在 file字段里接收)
   * @params queryList 1.后台要求参数在url中，queryList传空对象。 2. 后台要求参数在body内，queryList传req.query
   * @discreaption: 
   *  queryList传req.query，是为了将参数传至portal：
   *    （1.）长度过大的参数 通过upload组件formData传到portal层。 然后在url.query的'webKey'里加入参数的key值
   *         （例：file/upload?webKey='idList,discreaption'）参数名以‘,’分割。
   *    （2.）长度不大的参数 通过请求url query里面传到portal层，例（file/upload?name='name1'&type='type1'），
   *         （方法中queryArr 会遍历，并添加至http请求body体）。
   */
  HttpCoUpLoadFile: function (path, reqData, queryList, apiVersion) {
    let url = checkNeesApiVersion(path, apiVersion)
    let failUpData = {
      'mes': '上传失败',
      'code': 1018,
      'state': 'FAIL'
    }
    var options = {
      hostname: this.getHostIpAddress(),
      port: setting.API.port,
      path: url,
      method: 'POST',
      headers: {
      }
    }
    var token = getTokenFromReq(reqData)
    if (token) {
      options.headers['X-Auth-token'] = token
    }
    if (reqData.headers['x-real-ip']) {
      options.headers['x-real-ip'] = reqData.headers['x-real-ip']
    }
    if (reqData.headers['x-forwarded-for']) {
      options.headers['x-forwarded-for'] = reqData.headers['x-forwarded-for']
    }
    var mime = function (req) {
      var str = req.headers['content-type'] || ''
      return str.split(';')[0]
    }
    return new Promise(function(resolve, reject) {
      if (mime(reqData) === 'multipart/form-data') {
        const formfile = new multiparty.Form({})
        const formsubmit = new formData()
        
        let requestBody = {}
        let requestFiles = {}
        let done = false;

        formfile.keepExtensions = true

        formfile.on('field', function(name, val){
          ondata(name, val, requestBody);
        });
    
        formfile.on('file', function(name, val){
          val.name = val.originalFilename;
          val.type = val.headers['content-type'] || null;
          ondata(name, val, requestFiles);
        });
    
        formfile.on('error', function(err){
          if (done) return
          done = true
          resolve(failUpData)
        });
    
        formfile.on('close', function() {
          if (done) return;
          done = true;

          const ostmp = (os.tmpdir && os.tmpdir()) || os.tmpDir()
          requestBody = qs.parse(requestBody, { allowDots: true })  // upload组件请求体formData值
          requestFiles = qs.parse(requestFiles, { allowDots: true })
 
          let defaultName = requestFiles.file.originalFilename || requestFiles.file.name  || 'download.txt'  
          let opTmpFile = pathNode.join(ostmp, defaultName)
          let path = requestFiles.file.path

          fs.rename(path, opTmpFile, function (err) {
            if (err) {
              resolve(failUpData)
            }
            // upload组件（formData）请求体中参数，在req.url中通过webKey记录参数的key值方便取出 放入formsubmit请求体中
            if (queryList.webKey && typeof queryList.webKey === 'string') {
              webKeyArr = queryList.webKey.split(',')
              webKeyArr.forEach(function (item) {
                formsubmit.append(item, requestBody[item])  
              }) 
            }
            // 根据url参数 遍历放入formsubmit请求体中（排除webKey）
            if (queryList) {
              if (queryList.webKey) {
                delete queryList.webKey
              }  
              let queryArr = Object.keys(queryList)
              for (let i = 0; i <= queryArr.length - 1; i++) {
                formsubmit.append(queryArr[i], queryList[queryArr[i]])
              }
            }
            formsubmit.append('file', fs.createReadStream(opTmpFile))

            formsubmit.submit(options, function (err, resh) {
              var responseData = [];
              var size = 0;
              resh.on('data', function (charCodeStr) {
                responseData.push(charCodeStr);
                size += charCodeStr.length
              });
              resh.on('end', function (resEnd) {
                var buf = Buffer.concat(responseData, size)
                var sString = buf.toString()
                var resData = null
                if (isJsonString(sString)) {
                  resData = JSON.parse(sString)
                } else {
                  resData = sString
                }
                resolve(resData)
              });
            })
          }) 
        })
    
        formfile.parse(reqData);
      }
    })
  },
   /**
   *  安全云上传文件 (文件在 file字段里接受)
   * actionType， url中可有参数：uploadimage，uploadfile，uploadvideo
   * module， url中必带参数：表示模块 例：ips，fw， notice等
   * tag， url中必待参数： 1.upLoadFile： 返回上传成功结果； 2.noticeFile：返回文件路径
   *  
   */
  HttpUpLoadFile: function (path, reqData, paramsData, apiVersion) {
    apiVersion = apiVersion || setting.API.version;
    paramsData = paramsData || {}
    var failUpData = {
      'mes': '上传失败',
      'code': 1018,
      'state': 'FAIL'
    }
    var url = '/' + apiVersion + path
    var options = {
      hostname: this.getHostIpAddress(),
      port: setting.API.port,
      path: url,
      method: 'POST',
      headers: {
      }
    };
    var token = getTokenFromReq(reqData)
    if (token) {
      options.headers['X-Auth-token'] = token
    }
    if (reqData.headers['x-real-ip']) {
      options.headers['x-real-ip'] = reqData.headers['x-real-ip']
    }
    if (reqData.headers['x-forwarded-for']) {
      options.headers['x-forwarded-for'] = reqData.headers['x-forwarded-for']
    }
    var actionType = paramsData.query.action
    var module = paramsData.query.module
    var tag = paramsData.query.tag
    var mime = function (req) {
      var str = req.headers['content-type'] || ''
      return str.split(';')[0]
    }
    return new Promise(function(resolve, reject) {
      if (mime(paramsData) === 'multipart/form-data' || actionType === 'uploadimage' || actionType === 'uploadfile' || actionType === 'uploadvideo') {
        const formfile = new multiparty.Form({})
        const formsubmit = new formData()
        
        let requestBody = {}
        let requestFiles = {}
        let done = false;

        formfile.keepExtensions = true

        formfile.on('field', function(name, val){
          ondata(name, val, requestBody);
        });
    
        formfile.on('file', function(name, val){
          val.name = val.originalFilename;
          val.type = val.headers['content-type'] || null;
          ondata(name, val, requestFiles);
        });
    
        formfile.on('error', function(err){
          if (done) return
          done = true
          resolve(failUpData)
        });

        formfile.on('close', function() {
          if (done) return;
          done = true;

          requestBody = qs.parse(requestBody, { allowDots: true })
          requestFiles = qs.parse(requestFiles, { allowDots: true })

          const ostmp = (os.tmpdir && os.tmpdir()) || os.tmpDir()
          let defaultName = requestFiles.file.originalFilename || requestFiles.file.name  || 'download.txt'  
          let opTmpFile = pathNode.join(ostmp, defaultName)
          let path = requestFiles.file.path

          fs.rename(path, opTmpFile, function (err) {
            if (err) {
              resolve(failUpData)
            }

            formsubmit.append('module', module)
            formsubmit.append('file', fs.createReadStream(opTmpFile))

            formsubmit.submit(options, function (err, resh) {
              var responseData = [];
              var size = 0;
              resh.on('data', function (charCodeStr) {
                responseData.push(charCodeStr);
                size += charCodeStr.length
              });
              resh.on('end', function (resEnd) {
                var buf = Buffer.concat(responseData, size)
                var sString = buf.toString()
                var resData = null
                if (isJsonString(sString)) {
                  resData = JSON.parse(sString)
                } else {
                  resData = sString
                }
                if (tag === 'upLoadFile') {
                  resolve(resData)
                } else if (resData.id && tag === 'noticeFile') {
                  var upImgData = {
                    'url': 'api/file/download?id=' + resData.id,
                    'id': resData.id,
                    'state': 'SUCCESS'
                  }
                  resolve(upImgData)
                } else {
                  failUpData.mes = resData
                  resolve(failUpData)
                } 
              });
            })
          })    
        })
    
        formfile.parse(reqData)
      }
    })
  },
  /**
   * 调用core层接口,读取文件，按文件格式返回给前台
   */
  HttpGetFile: function (path, reqData, apiVersion) {
    let url = checkNeesApiVersion(path, apiVersion)
    // apiVersion = apiVersion || setting.API.version;
    var options = {
      hostname: this.getHostIpAddress(),
      port: setting.API.port,
      path: url,
      method: 'GET',
      encoding: null,
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    };
    var token = getTokenFromReq(reqData)
    if (token) {
      options.headers['X-Auth-token'] = token
    }
    if (reqData.headers['x-real-ip']) {
      options.headers['x-real-ip'] = reqData.headers['x-real-ip']
    }
    if (reqData.headers['x-forwarded-for']) {
      options.headers['x-forwarded-for'] = reqData.headers['x-forwarded-for']
    }
    // 断点续传 下载
    if (reqData.headers['range'] || reqData.headers['Range']) {
      options.headers['Range'] = reqData.headers['range'] || reqData.headers['Range']
    }
    return new Promise(function(resolve, reject) {
      var reqh = http.get(options, function(resh) {
        var resHeader = resh.headers
        var fileType = resh.headers['content-type']
        var fileName = ''
        if (typeof(resh.headers['content-disposition']) == 'string') {
          resh.headers['content-disposition'].split(';').forEach(item => {
            if (item.indexOf('filename') > -1) {
              fileName = item.split('=')[1].substr(1, item.split('=')[1].length - 2)
            }
          })
        }
        var fileBody = ''
        resh.setEncoding('binary')
        resh.on('data', function (charCodeStr) {
          fileBody += charCodeStr
        });
        resh.on('end', function (res) {
          var data = {}
          if (isJsonString(fileBody) && JSON.parse(fileBody).code) {
            data.code = JSON.parse(fileBody).code
            data.msg = 'download error'
            data.data = fileBody
          } else {
            fileBody = Buffer.from(fileBody, 'binary')
            data = {
              fileType: fileType, // todo：无用，可以删除
              fileBody: fileBody,
              fileName: fileName, // todo：无用，可以删除
              resHeader: resHeader
            }
          }
          resolve(data)
        });
      });
    })
  },
  /**
   * 调用core层接口,读取文件，用于传参下载文件
   */
  HttpPostFile: function (path, reqData, postData, apiVersion) {
    apiVersion = apiVersion || setting.API.version;
    postData = postData || {}
    var postData = JSON.stringify(postData)
    var options = {
      hostname: this.getHostIpAddress(),
      port: setting.API.port,
      path: '/' + apiVersion + path,
      method: 'POST',
      encoding: null,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    };
    var token = getTokenFromReq(reqData)
    if (token) {
      options.headers['X-Auth-token'] = token
    }
    if (reqData.headers['x-real-ip']) {
      options.headers['x-real-ip'] = reqData.headers['x-real-ip']
    }
    if (reqData.headers['x-forwarded-for']) {
      options.headers['x-forwarded-for'] = reqData.headers['x-forwarded-for']
    }
    return new Promise(function(resolve, reject) {
      var reqh = http.request(options, function(resh) {
        var resHeader = resh.headers
        var fileType = resh.headers['content-type']
        var fileName = ''
        if (typeof(resh.headers['content-disposition']) == 'string') {
          resh.headers['content-disposition'].split(';').forEach(item => {
            if (item.indexOf('filename') > -1) {
              fileName = item.split('=')[1].substr(1, item.split('=')[1].length - 2)
            }
          })
        }
        var fileBody = ''
        resh.setEncoding('binary')
        resh.on('data', function (charCodeStr) {
          fileBody += charCodeStr
        });
        resh.on('end', function (res) {
          var data = {}
          if (isJsonString(fileBody) && JSON.parse(fileBody).code) {
            data.code = JSON.parse(fileBody).code
            data.msg = 'download error'
            data.data = fileBody
          } else {
            fileBody = Buffer.from(fileBody, 'binary')
            data = {
              fileType: fileType,
              fileBody: fileBody,
              fileName: fileName,
              resHeader: resHeader
            }
          }
          resolve(data)
        });
      });
      reqh.write(postData)
      reqh.end()
      reqh.on('error', function(error) {
        console.log(error)
        reject(error)
      })
    })
  },
  /**
   * 调用core层接口,调用 contentType 为 formData 接口 
   */
  formPostJson: function (path, reqData, postData, apiVersion) {
    apiVersion = apiVersion || setting.API.version;
    postData = postData || {}
    var options = {
      hostname: this.getHostIpAddress(),
      port: setting.API.port,
      path: '/' + apiVersion + path,
      method: 'POST',
      encoding: null,
      headers: {
      }
    }
    var token = getTokenFromReq(reqData)
    if (token) {
      options.headers['X-Auth-token'] = token
    }
    if (reqData.headers['x-real-ip']) {
      options.headers['x-real-ip'] = reqData.headers['x-real-ip']
    }
    if (reqData.headers['x-forwarded-for']) {
      options.headers['x-forwarded-for'] = reqData.headers['x-forwarded-for']
    }
    var formsubmit = new formData()
    Object.keys(postData).forEach(function (item) {
      if (item !== 'reqMethods') {
        formsubmit.append(item, postData[item])
      }
    })
    return new Promise(function(resolve, reject) {
      formsubmit.submit(options, function (err, resh) {
        var responseData = [];
        var size = 0;
        resh.on('data', function (charCodeStr) {
          responseData.push(charCodeStr);
          size += charCodeStr.length
        });
        resh.on('end', function (resEnd) {
          var buf = Buffer.concat(responseData, size)
          var sString = buf.toString()
          var resData = null
          if (isJsonString(sString)) {
            resData = JSON.parse(sString)
          } else {
            resData = sString
          }
          resolve(resData)
        })
      })
    })
  },
  /**
   * 返回前端JSON格式数据
   */
  ResponseJson (res, data, isRequestNSSA = false, isDownload = false) {
    var isFail = false
    var msg
    var error
    if (isRequestNSSA) {
      if (typeof data === 'object') {
        if ('success' in data) {
          isFail = !data.success
        } else if ('code' in data) {
          isFail = data.code === 'fail' ? true : false
        }
      }
      if (data.data && Array.prototype.isPrototypeOf(data.data.rows)) {
        data.list = data.data.rows
        data.total = data.data.total
      }
      if (isFail) {
        let errMsg = typeof data.msg === 'object' ? data.msg.msg : data.msg
        msg = {
          errorMessage: errMsg,
          code: data.code,
          msg: data.msg
        }
      } else {
        msg = data
      }
    } else {
      var isFail = typeof data === 'object' && data.code  ? true : false
      if (typeof data === 'object' && data.error == 'Unauthorized') {
        isFail = true
        data['code'] = 401
      }   
      if (isFail) {
        error = getErrorCodeMsg(data.code)
        msg = {
          errorMessage: error,
          code: data.code,
          msg: data.msg || data.message
        }
      } else {
        msg = data
      }
    }
    this.setResponseContent(res, msg, isFail, isDownload)
  },
  setResponseContent (res, resData, isFail, isDownload) {
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Pragma", "no-cache")
    let userName = getUsernameFromReq(res.req)
    if (userName) {
      res.setHeader("Request-User", Buffer.from(userName).toString('base64'))
    }
    if (isDownload && !isFail) { // 成功并且是下载文件流
      res.writeHead(200, resData.resHeader)
      res.end(resData.fileBody, 'binary')
    } else {
      res.setHeader("Content-Type", "application/json;charset=utf-8")
      res.status(isFail ? 202:200).end(JSON.stringify(resData))
    }
  },
