sass_program


![](./assets/ge.jpg)
----------------------------------
by 2018/4/8 11:00
----------------------------------
emmmmm 今年2月1号开始的安全SASS云项目在上个月（3月31号）也结束第一次的发布会检查，总体上来说还是挺不错的吧，2个月的时间前端部分完成了95%，和后台的联调完成的不多，大概也就70%吧= =实在是页面太多了，一个完整的SASS云项目为了达到发布会的要求，从没有成熟的UI设计和业务实现逻辑到各功能模块的实现用了大概一个半月的时间，后面花了半个月左右的时间联调。总的页面总共加起来数量大概有将近100各左右，我负责了大概其中的20个页面吧：包含LB、NAT、用户信息等等的主页、配置页和详情页，31号晚上提交代码后闲下来无聊数了一下前前后后业务代码、封装模块组件的代码差不多有个1w行吧T T虽然这中间加班了很多次，也有发布会前一晚通宵，但还是有很多收获的吧 :)

这次项目用的主要是VUE框架基于webpack、es6和node开发的环境，其中为了快速开发吧，用了一些iview的组件，自己也在iview提供的基础组件的基础上封装了几个功能性更强的组件。对于这次项目的总结我会每天写一点，当做记录吧，项目结束我会整理成几篇博文放到我的博客去。

## 1.路由（router）	
在说项目路由前，可以先看看vue官方给出的[vue-router](https://router.vuejs.org/zh-cn/essentials/getting-started.html)的介绍，我也会列出一些稍微需要注意的点：
### 1.动态路由参数
用于不同ID的用户都需使用同一个组件渲染
```javascript
const User = {
  template: '<div>User</div>'
}

const router = new VueRouter({
  routes: [
    // 动态路径参数 以冒号开头
    { path: '/user/:id', component: User }
  ]
})
```
> 像 /user/foo 和 /user/bar 都将映射到相同的路由。一个『路径参数』使用冒号 : 标记。当匹配到一个路由时，参数值会被设置到 this.$route.params，可以在每个组件内使用。其中params靠this.$router.push(name or path, params: {id: xx})方法传递，也可以多段设置路由参数：模式:/user/: username/post/:post_id => 匹配路径: /user/evan/post/123 => $route.params: { username: 'evan', post_id: 123 }
### 2.结合项目
这次采用的是分级的路由定义方式：
```javascript
import childRouter from '../../router'
const parentPouter1 = {
	path:
	name:
	title:
	component:
	children: childRouter
}
const routerConfig = [ parentPouter1 ]
export default const router = new VueRouter({
	routes: routerConfig
})
// 再在childRouter里面分级定义子路由：
[
	{
		path:
		name:
		title:
		component: () => import('url') //具体页面的路径
	},
	{
		path:
		name:
		title:
		component: () => import('url') //具体页面的路径
	}
]
```

对于手风琴类的父级展开式的多个子路由的情况：
```javascript
const parentPouter2 = [
	{
		path:
		name:
		title:
		component:
		children: childRouter1
	},
	{
		path:
		name:
		title:
		component:
		children: childRouter2
	}
]
const routerConfig = [ 
	parentRouter1,
	...parentPouter2  //...分构数组成对象形式的路由
]
export default const router = new VueRouter({
	routes: routerConfig
})
```
具体关于项目路由结构可以看第6项介绍。

## 2.封装组件
在三月中旬开发的时候，被要求在主要业务的主页上添加一个详情的可收缩的弹框。需求很简单，但为了统一样式便于开发，采取了单独封装组件的方式。其中为了保证详情框和主页面内容高度一致，用到CSS变量的知识点（具体内容可以阅读[阮一峰CSS变量教程](http://www.ruanyifeng.com/blog/2017/05/css-variables.html)）。
```javascript
<script type='text/javascript'>
	mounted () {
		document.body.style.setProperty('--autoHeight', $(#leftId).height()) // 取到左边内容高度再设置autoHeight变量的大小
	}
</script>
<style type='text/css' scoped>
	body {
		--autoHeught: 25; /*这个高度是随便定的，表示类型即可*/
	}
	.card {
		height: calc(var(--autoHeight)*1px); //var()函数是取css变量的值；calc()函数连接数值和单位
	}
</style>
```

## 3.数据传递
VUE框架中可以用动态路由在不同页面间传递数据，常用的传递参数的方法是通过params和query，注意的是：由于动态路由也是传递params的，所以在 this.$router.push() 方法中path不能和params一起使用，否则params将无效。需要用name来指定页面

### 1.params
```javascript
this.$router.push({name:'RouterName', params:{data: this.userID}}) //其中name参数是下一跳路由的name属性

// 在目的页面使用传递过来的params里的data值
this.$route.params.data
```

### 2.query
```javascript
this.$router.push({name:'RouterName', query:{data: this.userID}}) //其中name参数是跳转路由的name属性
// 或者
this.$router.push({path:'RouterPath', query:{data: this.userID}}) //其中path参数是下一跳路由的path属性

// 在目的页面使用传递过来的query里的data值
this.$route.query.data
```
这两种传递参数的方法区别主要在于：params传递的参数不会体现在页面的URL里，刷新页面后数据就会消失；query传递的参数会以"?userID=xxx"的后缀方式体现在URL中，刷新页面数据还会保留。

## 4.父子组件通信
在单个页面里的组件间的通信，例如打开新建或编辑框时的数据传递；这里只考虑父子组件间的通信，非父子组件通信通过创建事件中心的方式暂不深究。

![](./assets/dataConmmunicate.png)

### 1.父组件传递数据给子组件
主要通过props属性实现：
```javascript
//父组件
<parent>
	<child :childprops='this.data'><child>
</parent>

<script>
	data () {
		return {
			data: 'mclean'
		}
	}
</script>

//子组件
props: ['childprops']
//或者
props: {
    childprops: String // 这样可以指定传入的类型，如果类型不对，会警告
}
//再者
props: {
    childprops: {
        type: Array,
        default: 'yuhui' // 这样可以指定默认的值
    }
}
```
子组件注册一个属性（props）childprops，父组件中对这个属性绑定值，子组件可以直接this.childprops调用父组件传过来的数据。

### 2.子组件向父组件传递
子组件想要改变数据这在VUE里面是不允许的，因为VUE只允许单向数据传递，我们可以通过触发事件来通知父组件改变数据，从而达到改变子组件数据的目的，即拿到子组件传过来的数据。
```javascript
//子组件
<template>
	<button @click='buttonClick'>click</button>
</template>

<script>
	methods: {
		buttonClick () {
			this.$emit('childMethod', childData); // 触发childMethod,传递参数childData
		}
	}
</script>

//父组件
<parent>
	<child v-on:childMethod='parentMethod'></child>
</parent>

<script>
	methods: {
		parentMethod (data) {
			// 参数data即子组件传递的childData
		}
	}
</script>
```
this.$emit()监听触发childMethod方法，通知父组件执行parentMethod方法,并拿到参数。

## 	5.状态管理
针对这次项目，有个直观的感受就是：数据在组件间通信比较频繁的情况下，通常用的父子组件、兄弟组件通信方式就会显得异常繁琐，而且不便于管理。
从VUE一个简单的状态自管理应用来看：
```javascript
new Vue({
  // state
  data () {
    return {
      count: 0
    }
  },
  // view
  template:
    <div>{{ count }}</div>

  // actions
  methods: {
    increment () {
      this.count++
    }
  }
})
```
这个状态自管理应用包含以下几个部分：

* state：驱动应用的数据源；
* view：以声明方式将state映射到视图；
* actions：响应在 view上的用户输入导致的状态变化。

这是一个普通的组件从样式渲染到数据绑定再到数据变化，单一的状态比较清晰，遇到多个组件共享状态时，这种简洁性很容易被破坏且难以管理。因此，把组件的共享状态抽出来，以一个全局单例模式管理，这就是VUEX背后的基本思想。

![](./assets/vuex.png)

后续用完之后再来写: )

## 6.项目结构
这部分应该是在刚开始写的，但忘了= =，现在补上吧。
在说这次项目之前先说基于vue-cli搭建的项目结构各个文件的作用，我就从csdn上找了篇文章（[点击此处](https://blog.csdn.net/qq_34543438/article/details/72868546?locationNum=3&fps=1)）。光看这些个概念可能有点抽象，结合这次项目我用自己的理解解释一下；这次用的是嵌套显示，主要通过路由里的children属性设置，具体配置如下：
### 1.入口html文件（index.html）
```bash
<div id='app'></div>
<div id='version'>...</div> <!-- 检查浏览器版本 -->
```
### 2.入口js文件（main.js）
```javascript
new Vue({
	el: '#app',
	router, // 引用router文件夹index.js
	components: {App}, // 入口vue文件
	template: '<App/>', // 模板将会替换挂载的元素，挂载元素的内容都将被忽略（看下面注释）
	store: VuexStore // vuex原型
})
```
> 注释：也就是说:template: '&lt;App/&gt;' 表示用&lt;app&gt;&lt;/app&gt;替换index.html里面的&lt;div id="app"&gt;&lt;/div&gt;
### 3.入口vue文件（App.vue）
```javascript
<template>
	<div id='app'>
		<router-view></router-view> <!-- 路由视图组件 -->
	</div>
<template>
```
### 4.主路由（router/index.js）
这次项目基于上面的<router-view>渲染分两个VUE文件：login.vue和Main.vue，下面会对这两个VUE文件做具体介绍。
```javascript
//登录页面路由信息
const loginRouter = {
	path:
	name:
	component: () => import(...)
}

//业务页面路由信息，都是挂载在Main.vue页面里，等同于入口vue的<router-view>
const defindeRouter = { // 错误跳转页面路由
	path:
	name:
	component: Main // import Main from ...引入Main组件，设置children属性设置业务页面路由
	children: [{...}]
}
const topbarRouter = { // top栏路由
	path:
	name:
	component: Main
	children: [{...}]
}
const sidebarRouter = [ // 具体各个业务页面路由
	{
		path:
		name:
		component: Main
		children: [{...}]
	},
	{
		path:
		name:
		component: Main
		children: [{...}]
	}
]
export const routerConfig = [
	loginRouter,
	topbarRouter,
	defindeRouter,
	...sidebarRouter // 解构
]

//导出路由信息，在App.vue文件中引入
```
### 5.Main.vue（业务页面都挂载在下面）
```bash
<template>
	<Header></Header>
	<Content>
		<router-view></router-view> // 联系上面的children路由信息，都通过这个路由视图显示
	</Content>
	<Footer></Footer>
</template>
```

综上所述，所有页面都显示在入口index.html的&lt;div id='app'&gt;里，main.js创建VUE实例，login和Main作为两个主vue文件，通过App.vue文件的&lt;router-view&gt;路由视图显示，业务页面通过Main.vue的&lt;router-view&gt;的路由视图显示，利用路由children属性把页面挂载在Main.vue上。

## 7.路由分发
```javascript
/*
	Apache请求数据库的代码
*/
res = db.query('SELECT * from some_table')
res.output()

/*
	Nodejs请求数据库的代码
*/
db.query('SELECT * from some_table', function(res){
	res.output()
})
```

由于项目开发的深入，为了配合设备层的配置下发，后台开始着手core层的接口，也就是说不完全针对页面显示的数据接口；这种情况下需要前台对接口进行路由分发，对于后台给出的接口改构和包装，达到页面显示需要的数据结构的接口，这次用的是nodejs的express框架，在应用到项目前，这里算是学习笔记和感想。

一个基本的express应用的结构：
```javascript
var express = require('express') // 安装node的时候回自动安装express
var app = express()

app.get('/', (req,res) => { // req(请求)和res(响应)与Node提供的对象完全一致
	res.send('监听3030端口进入的所有get请求')		
})
var server = app.listen(3030, function{
	var host = server.address().address
  	var port = server.address().port
  	console.log('Example app listening at http://%s:%s', host, port)
})
```

### 1.基本路由和静态文件挂载
常见的4个基本http请求：
```javascript
// 对网站首页的访问返回 "Hello World!" 字样
app.get('/', function (req, res) {
  res.send('Hello World!');
});

// 网站首页接受 POST 请求
app.post('/', function (req, res) {
  res.send('Got a POST request');
});

// /user 节点接受 PUT 请求
app.put('/user', function (req, res) {
  res.send('Got a PUT request at /user');
});

// /user 节点接受 DELETE 请求
app.delete('/user', function (req, res) {
  res.send('Got a DELETE request at /user');
});
```
利用express托管静态文件（express.static中间件）
```javascript
app.use(express.static('public'))

// 通过http://localhost:3030/image/xx.png访问
// 多个目录按照添加顺序查找

app.use('/public', express.static('public'))
// 存放虚拟目录，通过指定的挂载路径访问：http://localhost:3030/public/image/xx.png
```

### 2.路由
路由是指如何定义应用的端点（URIs）以及如何响应客户端的请求。
路由是由一个 URI、HTTP 请求（GET、POST等）和若干个句柄组成，它的结构如下： app.METHOD(path, [callback...], callback)， app 是 express 对象的一个实例， METHOD 是一个 HTTP 请求方法， path 是服务器上的路径， callback 是当路由匹配时要执行的函数。
```javascript
// 对于上面的4种请求的句柄改用app.route()定义链式句柄
app.route('/public')
	.get((req,res) => {
		...
	})
	.post((req,res) => {
		...
	})
	.put((req,res) => {
		...
	});
// 监听来自/public的所有请求
app.all('/public', function(req,res,next){
	...
	next();
})
// 路由匹配
// 匹配 butterfly、dragonfly，不匹配 butterflyman、dragonfly man等
app.get(/.*fly$/, function(req, res) {
  	res.send('/.*fly$/');
});
```

#### express.Router
调用express()方法创建的Application(app)内部都创建了一个Router，大部分对 Application 的操作实际上都被重定向到了这个内部的Router上而已。而Application所做的，只不过是在这个Router的基础上添加了一些额外的便捷 API 而已。
```javascript
var express = require('express');
var router = express.Router();

// 该路由使用的中间件
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// 定义网站主页的路由
router.get('/', function(req, res) {
  res.send('Birds home page');
});
// 定义 about 页面的路由
router.get('/about', function(req, res) {
  res.send('About public');
});

module.exports = router;

// 在应用中加载路由模块
var pub = require('js文件路径');
...
app.use('/public', pub);
// 应用即可处理发自 /public 和 /public/about 的请求，并且调用为该路由指定的 timeLog 中间件
```

### 3.中间件
中间件（Middleware）是一个函数，它可以访问请求对象（request object (req)），响应对象（response object (res)），和 web 应用中处于请求-响应循环流程中的中间件，一般被命名为 next 的变量。
> 关于next()函数的解释，我找了一篇比较好的[文章](http://cnodejs.org/topic/5757e80a8316c7cb1ad35bab)

中间件的功能包括：
* 执行任何代码；
* 修改请求和响应对象；
* 终结请求-响应循环；
* 调用堆栈中的下一个中间件。
如果当前中间件没有终结请求-响应循环，则必须调用 next()方法将控制权交给下一个中间件，否则请求就会挂起。

Express 应用可使用如下几种中间件：
* 应用级中间件
* 路由级中间件
* 错误处理中间件
* 内置中间件
* 第三方中间件

#### 1.应用级中间件
应用级中间件绑定到**app对象**使用app.use()和app.METHOD()，其中METHOD是需要处理的HTTP请求的方法，例如GET, PUT, POST 等等，全部小写。例如：
```javascript
var app = express();

// 没有挂载路径的中间件，应用的每个请求都会执行该中间件
app.use(function (req, res, next) {
  console.log('Time:', Date.now());
  next();
});

// 挂载至 /user/:id 的中间件，任何指向 /user/:id 的请求都会执行它
app.use('/user/:id', function (req, res, next) {
  console.log('Request Type:', req.method);
  next();
});

// 路由和句柄函数(中间件系统)，处理指向 /user/:id 的 GET 请求
app.get('/user/:id', function (req, res, next) {
  res.send('USER');
});
```
下面这个例子展示了在一个挂载点装载一组中间件。
```javascript
// 一个中间件栈，对任何指向 /user/:id 的 HTTP 请求打印出相关信息
app.use('/user/:id', function(req, res, next) {
  console.log('Request URL:', req.originalUrl);
  next();
}, function (req, res, next) {
  console.log('Request Type:', req.method);
  next();
});
```
作为中间件系统的路由句柄，使得为路径定义多个路由成为可能。在下面的例子中，为指向 /user/:id 的 GET 请求定义了**两个路由**。第二个路由虽然不会带来任何问题，但却永远不会被调用，因为第一个路由已经终止了请求-响应循环。
```javascript
// 一个中间件栈，处理指向 /user/:id 的 GET 请求
app.get('/user/:id', function (req, res, next) {
  console.log('ID:', req.params.id);
  next();
}, function (req, res, next) {
  res.send('User Info');
});

// 处理 /user/:id， 打印出用户 id
app.get('/user/:id', function (req, res, next) {
  res.end(req.params.id);
});
```
如果需要在中间件栈中跳过剩余中间件，调用 next('route') 方法将控制权交给下一个路由。 注意： next('route') 只对使用 app.VERB() 或 router.VERB() 加载的中间件有效。
```javascript
// 一个中间件栈，处理指向 /user/:id 的 GET 请求
app.get('/user/:id', function (req, res, next) {
  // 如果 user id 为 0, 跳到下一个路由
  if (req.params.id == 0) next('route');
  // 否则将控制权交给栈中下一个中间件
  else next(); //
}, function (req, res, next) {
  // 渲染常规页面
  res.render('regular');
});

// 处理 /user/:id， 渲染一个特殊页面
app.get('/user/:id', function (req, res, next) {
  res.render('special');
});
```
#### 2.路由级中间件
路由级中间件和应用级中间件一样，只是它绑定的对象为 express.Router()。
```javascript
var router = express.Router();
```
路由级使用 router.use() 或 router.VERB() 加载。
上述在应用级创建的中间件系统，可通过如下代码改写为路由级：
```javascript
var app = express();
var router = express.Router();

// 没有挂载路径的中间件，通过该路由的每个请求都会执行该中间件
router.use(function (req, res, next) {
  console.log('Time:', Date.now());
  next();
});

// 一个中间件栈，显示任何指向 /user/:id 的 HTTP 请求的信息
router.use('/user/:id', function(req, res, next) {
  console.log('Request URL:', req.originalUrl);
  next();
}, function (req, res, next) {
  console.log('Request Type:', req.method);
  next();
});

// 一个中间件栈，处理指向 /user/:id 的 GET 请求
router.get('/user/:id', function (req, res, next) {
  // 如果 user id 为 0, 跳到下一个路由
  if (req.params.id == 0) next('route');
  // 负责将控制权交给栈中下一个中间件
  else next(); //
}, function (req, res, next) {
  // 渲染常规页面
  res.render('regular');
});

// 处理 /user/:id， 渲染一个特殊页面
router.get('/user/:id', function (req, res, next) {
  console.log(req.params.id);
  res.render('special');
});

// 将路由挂载至应用
app.use('/', router);
```
> 路由级中间件和非路由级中间件的第三个参数next不是同一个next，功能上基本相同。
#### 3.错误处理中间件
>错误处理中间件有 4 个参数，定义错误处理中间件时必须使用这4个参数（4个参数是next(err)执行判断的标识）。即使不需要next对象，也必须在签名中声明它，否则中间件会被识别为一个常规中间件，不能处理错误。
```javascript
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```
具体关于错误处理中间件的介绍可以参考[官方文档](http://www.expressjs.com.cn/guide/error-handling.html)
#### 4.内置中间件
express.static是Express唯一的内置中间件。它基于serve-static，负责在Express应用中托管静态资源。
最常用的用法在上面已经介绍过了，关于更细节的参数可参考[官方文档](http://www.expressjs.com.cn/guide/using-middleware.html#middleware.built-in)

## 8.关于Express应用项目实践
上面说了很多概念性的内容，这部分就针对这次项目来说具体应用。这次后台整体下移，也就是从之前写java的portal层接口下移到对接设备的core层接口，出于安全性考虑，前台不能直接访问core层接口，需要用node在中间连接（认证部分这次用的casClient后面再细说）。主要的三个需求是接口转发、静态资源挂载，还有个服务器端口跳转；下面我会针对这三个需求说一下实现的过程吧 : )

这是主要require的几个模块：
```javascript
var express = require('express')
var proxy = require('http-proxy-middleware')
var request = require('request')
var bodyParser = require('body-parser')
var path = require('path')
var history = require('connect-history-api-fallback')
```
### 1.接口转发
这部分是node实现的最基本要求，即前台调用express定义的前台接口，再由中间件向core层调用对应的接口取数据。
```javascript
// 前台调用接口
this.$axios({
	method: 'GET',
	url: 'http://127.60.0.1:3000/yuhui'
}).then(r=>{
	console.log(r.data)
})

//express捕获到做匹配
var app = express()
app.use('/yuhui', function(req,res,next){
	// 向core层请求数据
	res.jsonp(obj) // 返回给前台
})

app.listen(3000,'127.60.0.2')
```
### 2.静态资源挂载
这个需求是为了用docker容器集成到主系统时，为了减少对接模块调试方便（vue+node+nginx到vue+node），就对前端的静态资源调用放到express来做。挂载静态资源是针对于build之后用于生产环境下的dist文件夹资源的调用，而不是开发环境的入口html，这个要注意哈！
```javascript
app.use(express.static('../dist'))
app.listen(3000,'127.60.0.2') //浏览器访问127.60.0.2:3000就可以访问项目了
```
这样挂载的项目路径中会带有一个#，这是因为router默认采用hash模式，因此要对router做一下修改：
```javascript
export default new Router({
  mode: 'history', //修改路由模式
  routes: [
    {
        path: '/',
        component: Index
    },{
    	path: '/content/:id',
    	component: Content
    },{
    	path: '/viewPage',
    	component: ViewPage
    }
  ]
})
```
但是这样做又会带来一个问题，这样的访问是针对于文件夹的静态资源路径而不是我们在开发环境中做的路由路径，会匹配不到资源返回404；所以呢，你要在服务端增加一个覆盖所有情况的候选资源：如果 URL 匹配不到任何静态资源，则应该返回同一个 index.html 页面（也就是从主页面重进再按照路由的路径显示页面），这个页面就是你 app 依赖的页面。当然这个要自己写一个node处理的中间件可以，不过npm这么好的社区不用就很浪费: )
> npm install --save connect-history-api-fallback，[源码](https://github.com/bripkens/connect-history-api-fallback)在github上，有兴趣的同学可以去研究下，然后express可以以第三方中间件的形式使用，很方便。这里在附上官网的[其他解决办法](https://router.vuejs.org/zh-cn/essentials/history-mode.html)，assetsPublicPath路径[配置解释](https://www.cnblogs.com/resolvent/p/5736678.html)
```javascript
var history = require('connect-history-api-fallback')
app.use(history()) //注意顺序！这个中间件的使用要放在挂载静态资源之前

build: {
  // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

  // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',  
    //因为history默认会修改根目录，未配置前是相对路径；所以在webpack build命令配置需要修改成'/'，保证根目录不变，具体解释点上面链接
}
```
### 3.服务器端口跳转
这个需求呢是我撸码的时候自己提的= =使用环境就是服务器的一个端口挂了，可以跳转到另一个端口，相当于备用；利用http-proxy-middleware模块起一个代理服务器，用于转发端口或者IP+端口。
```javascript
var proxy = require('http-proxy-middleware')
app.use('/yuhui', proxy({
    target: 'http://127.60.0.2:1234',
    changeOrigen: true,
    onProxyRes: function(proxyRes,req,res){
        res.header("Access-Control-Allow-Origin", "*");  
        res.header("Access-Control-Allow-Headers", "X-Requested-With, content-type");  
        res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
        res.header("X-Powered-By",' 3.2.1')  
        res.header("Content-Type", "application/json;charset=utf-8");  
    },
    cookieDomainRewrite: '' // 修改响应信息中的cookie域名，可以为false
}))

app2.use('/yuhui', function(req,res,next){
	res.send('yuhui')
})
app.listen(3000,'127.60.0.2') // 代理服务器端口
app2.listen(1234,'127.60.0.2')
```

做完这几个需求，感触比较深的是：基于node开发要有一种模块化和社区的概念，这样无论是执行效率还是开发效率都会有很高的提升。（模块引用和中间件加载太舒服了~）

## 9.基于casServer的登录认证

### 1.cas server + cas client 单点登录原理介绍
为了集成到cloudOS系统上需要对现在的项目做单点登录（保持单账号登录所有系统），打算用casServer做单点登录和权限控制以及用docker部署，关于docker的部分我后面研究完了在写上来吧:)
从结构上看，CAS 包含两个部分： CAS Server 和 CAS Client。CAS Server需要独立部署，主要负责对用户的认证工作；CAS Client负责处理对客户端受保护资源的访问请求，需要登录时，重定向到 CAS Server。

#### CAS基础协议

![](./assets/casServer1.jpg)

#### CAS的详细登录流程

![](./assets/casServer2.jpg)
> 关于cas的详细介绍，我也是从这两篇文章上了解的：[CAS基础协议](https://blog.csdn.net/feng27156/article/details/38060099)和[CAS的详细流程](http://htmlwww.cnblogs.com/lihuidu/p/6495247.html)

### 2.配置介绍
这次项目呢，我主要做的就是casClient部分的逻辑，作为客户端和casServer的中间件，在不同情况下的重定向操作对于系统正常运行有很大影响，但考虑到客户端、casClient和casServer之间的数据交换和本地ticket验证等复杂的逻辑，可以考虑用npm安装合适的基于node的casClient，再做一些基本的配置即可。
> 这次用的是connect-cas2模块，npm官网上的[配置](https://www.npmjs.com/package/connect-cas2)介绍是英文的，看着不太方便，附上[中文版](https://github.com/TencentWSRD/connect-cas2/blob/master/README.zh.md)的吧，这里列出几个比较重要的属性：
```javascript
var ConnectCas = require('connect-cas2')
var casClient = new ConnectCae({
	servicPrefix: // 网站根目录
	serverPath: // casServer根路径，会和paths.serviceValidate拼接成casServer校验ticket路径
	paths: {
		validate: // 用于Client端校验ST路径，就是cas-connect2这个模块本地验证ST的js文件
		serviceValidate: // 用于casServer校验ticket路径
		login: // 会和serverPath拼接组成CAS的登录页面
		logout: // 注销路径
		...
	}
	...
})
app.use(casClient.core()) // 顺序要在bodyPaser之前
```

## 10.ES6使用小结
这部分呢打算对项目中用到的ES6语法做个小总结吧: )仅是对项目使用的部分做记录，有兴趣的可以去看看阮一峰的[ECMAScript 6 入门](http://es6.ruanyifeng.com/)
### 1.promise
Promise是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。它由社区最早提出和实现，ES6 将其写进了语言标准，统一了用法，原生提供了Promise对象。
所谓Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。
#### 基本用法
```javascript
// 创建promise实例
const promise = new Promise(function(resolve, reject) {
  // ... some code
  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});

// Promise实例生成以后，可以用then方法分别指定resolved状态和rejected状态的回调函数。
promise.then(function(value) {
  // success
}, function(error) {
  // failure
});

```
#### 2.举两个栗子吧
```javascript
// 简单操作
function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms, 'done'); // 第三个参数会作为resolve函数的参数使用
  });
}

timeout(100).then((value) => {
  console.log(value); // 打印done
});	

// 稍复杂操作
const getJSON = function(url) {
  const promise = new Promise(function(resolve, reject){
    const handler = function() {
      if (this.readyState !== 4) {
        return;
      }
      if (this.status === 200) {
        resolve(this.response); 
      } else {
        reject(new Error(this.statusText)); // 分类进不同的回调
      }
    };
    const client = new XMLHttpRequest();
    client.open("GET", url);
    client.onreadystatechange = handler;
    client.responseType = "json";
    client.setRequestHeader("Accept", "application/json");
    client.send();

  });

  return promise; // 返回promise对象是继续回调的关键
};

getJSON("/posts.json").then(function(json) {
  console.log('Contents: ' + json);
}, function(error) {
  console.error('出错了', error);
});
```
> promise新建后会执行some code的代码块，再执行后面的代码，最后执行resolve和reject的部分
#### 3.链式回调，避免回调地狱
多层的回调看起来十分不美观而且不易数据维护，在js中引入链式操作会变得优雅很多。
```javascript
yPromise(value){
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			if(value == 1002){
				resolve(value+1)
			}
			else {
				reject('yuhui')
			}
		},value)
	})
}


this.yPromise(1000)
  .catch(function(err){ // 调用resolve或reject并不会终结 Promise 的参数函数的执行。
	console.log(err)
	// return Promise.resolve(1000)
	return Promise.reject(2000) // 要想继续回调必须返回一个promise对象
}).catch(function(err){
	console.log(err)
	return Promise.resolve(1000)
}).then(function(res){
	console.log(res)
	// var res2 = res + 1000
	// return new Promise(function(resolve, reject){
	// 	resolve(res2)
	// })
	return Promise.resolve(res+1000) //等价于上面的写法
}).then(function(res){
	console.log(res)
	return Promise.resolve(res+1000)
})

```
运行结果：

![](./assets/promise_1.PNG)

### 2.箭头函数
待续。。。: p

## 11.基于token的登录认证
主要从sessions、cookies和token来说  
待续。。。: p  
------------------920更------------------
### 1.基于token的会话验证：
用户登录系统后与服务器建立起会话，为了保持会话避免重复登录，因此浏览器登录第一次后需要一个可以证明自己身份的东西，让服务器知道这是一个曾经登录过的用户并且知道是谁，从而响应对应用户的请求；由于HTTP请求是无状态的，因此区分每一个用户是一个不小的困难。  
在介绍基于token的身份验证之前，可以想到要解决这个问题，用户第一次登录后，服务器回应用户一个会话ID就，用户请求时带上这个ID，服务器检索到这个ID对应的是谁，就可以回应正确的请求了；这对于少量用户群体来说还行，但对于用户量过多的系统，服务器存储的压力就太大了，而且基于负载均衡的服务器集群不能保证一个用户的每次请求都在第一台保存用户ID的服务器上。  
所以这个ID不应该让服务器存，但如果不存的话服务器又不知道请求的是不是合法的用户。
基于token的身份验证：用户第一次登陆后，服务器生成一个由user_id和签名（用服务器秘钥加密后的user_id），二者组合成一个token（令牌）发给浏览器。

![](./assets/token1.png)

之后的每次请求浏览器把token带着，每次服务器解密token里的签名对比明文的user_id，一致的话就可以知道用户是谁了，避免了服务器存储session_id的压力。

![](./assets/token2.png)

### 2.cookie
cookie 是一个非常具体的东西，指的就是浏览器里面能永久存储的一种数据，仅仅是浏览器实现的一种数据存储功能。

cookie由服务器生成，发送给浏览器，浏览器把cookie以kv的形式保存到某个目录下的文本文件内，下一次请求同一网站时会把该cookie发送给服务器。由于cookie是存在客户端上的，所以浏览器加入了一些限制确保cookie不会被恶意使用，同时不会占据太多磁盘空间，所以每个域的cookie数量是有限的。 

### 3.session
session 从字面上讲，就是会话。这个就类似于你和一个人交谈，你怎么知道当前和你交谈的是张三而不是李四呢？对方肯定有某种特征（长相等）表明他就是张三。

session 也是类似的道理，服务器要知道当前发请求给自己的是谁。为了做这种区分，服务器就要给每个客户端分配不同的“身份标识”，然后客户端每次向服务器发请求的时候，都带上这个“身份标识”，服务器就知道这个请求来自于谁了。至于客户端怎么保存这个“身份标识”，可以有很多种方式，对于浏览器客户端，大家都默认采用 cookie 的方式。

服务器使用session把用户的信息临时保存在了服务器上，用户离开网站后session会被销毁。这种用户信息存储方式相对cookie来说更安全，可是session有一个缺陷：如果web服务器做了负载均衡，那么下一个操作请求到了另一台服务器的时候session会丢失。

## 12.VUE源码笔记
[源码链接](https://github.com/Alexandermclean/vue/blob/dev/src/core/instance)
> 在看源码前需要先了解一下强类型模板类的js语言，类似typescript或是flow，vue2.0就是用flow写的（原因[链接](https://www.zhihu.com/question/46397274)）个人看完之后觉得flow好用一点，轻量不干预源码。

## 13.vue+nodejs+webpack环境搭建
### 1.vue-cli搭建框架
vue init webpack xxx--cd xxx--npm install
### 2.nodejs启动dev
新建一个webpack_server.js的配置文件，从webpack.base.conf.js和webpack.dev.conf.js中选择相应的配置代码
主要是：entry、output、module和plugins这四个对象，其中entry是输入，webpack会将输入的文件及在其中导入的文件一起打包；output是输出，指定输出文件的目录，文件名等；module是预处理方式，webpack只能处理js文件，还有很多其他类型的文件，如css，图片，typescript，sass等文件，为了使webpack能顺利打包，那就需要预处理一下；plugins顾名思义就是提供一些额外的功能，相当于插件例如inject：插入output资源特定的位置，可以为head，body等，minify：压缩html文件。

主要涉及的文件：build下的webpack.base.conf.js和webpack.dev.conf.js、config/index.js、package.json和main.js，列一下关于配置中比较重要的几个点：
1.npm express后，在根目录下创建一个server文件夹，在里面新建一个node的启动文件app.js

2.app.js中主要用'webpack-dev-middleware'模块打包运行dev，用webpack-hot-middleware实现修改文件后的热加载（除express文件外），对于express文件修改的热加载可以用nodemon实现，个人感觉nodemon和webpack-hot-middleware配合可以让项目调试起来很方便。
```javascript
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('../build/webpack-server.js');
const webpack = require('webpack');
const compiler = webpack(webpackConfig);

if (setting.webpack.isWebpackDev){
	app.use(webpackDevMiddleware(compiler,{
		publicPath: webpackConfig.output.publicPath,
    	noInfo: true
	}));
	app.use(webpackHotMiddleware(compiler));
}
```
3.当express侦听某个接口时，输入的路径是“/”或“/index.html”这种默认路径时，需要用中间件拦截指向启动后的dev的html入口文件，即打包后根目录下的dist/index.html
```javascript
var DIST_DIR = path.join(__dirname, '../', 'dist')
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
```
4.webpack打包的配置文件设置，webpack(webpackConfig)这一步就是用配置文件创建一个用来传给webpack-middle-ware的对象，主要修改了entry和plugins，entry添加webpack-hot-middleware/client入口和plugins添加热加载的插件new webpack.optimize.OccurrenceOrderPlugin()和new webpack.HotModuleReplacementPlugin()。

正常启动命令，也可以在package.json的scripts里面自定义一个启动命令：
![](./assets/nodemon.PNG)

### 3.集成插件和工具
1.vuex 
```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import vuexStore from './store/index'
Vue.use(Vuex)

new Vue({
  store: vuexStore
})

// store 结构 index.js和modules文件夹
// index.js
import Vue from 'vue'
import Vuex from 'vuex'
import common from './modules/common'
Vue.use(Vuex)

const store = new Vuex.Store({
	modules: {
		common: common
	}
})

export default store

// modules/common.js
const state = {
	name: 'WAF'
}
const getters = {
	getName: state => state.name
}
const mutations = {
	
}
const actions = {
	
}

export default {
	// namespaced: true,  // 命名空间问题TODO
	state,
	getters,
	mutations,
	actions
}

```

2.axios 
```javascript
import axios from './api/axios'
Vue.prototype.$axios = axios

// api/axios
import axios from 'axios'

axios.defaults.timeout = 5000
axios.defaults.headers = Object.assign(axios.defaults.headers, {'Cache-Control': 'no-cache'})

export default axios
```
3.iview 
```javascript
import iView from 'iview'
import 'iview/dist/styles/iview.css'
Vue.use(iView)

// 需要在webpack配置文件中的module.rules添加css、postcss、less等规则
{
	rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
}
```

## 14.HTTPS协议加密机制
### 1.为什么要加密
因为http的内容是明文传输的，明文数据会经过中间代理服务器、路由器、wifi热点、通信服务运营商等多个物理节点，如果信息在传输过程中被劫持，传输的内容就完全暴露了，他还可以篡改传输的信息且不被双方察觉，这就是中间人攻击。所以我们才需要对信息进行加密。最简单容易理解的就是对称加密。

### 2.加密的种类
#### 1.对称加密
通信双方各持一个相同的秘钥，对通信的内容加密解密，这种加密方式优点就是加密解密速度快，效率高。  
但是怎么能保证通信的双方都拿到相同的秘钥而不被其他人拿到呢，这就很难了= =

#### 2.非对称加密
就是有两把秘钥，一把私钥，一把公钥；用公钥加密的内容只能私钥解密，同样私钥加密的内容只能公钥解密。鉴于非对称加密的机制，我们会有这种思路：服务器先把公钥直接明文传输给浏览器，之后浏览器向服务器传数据前都先用这个公钥加密好再传，这条数据的安全似乎可以保障了！因为只有服务器有相应的私钥能解开这条数据。

然而由服务器到浏览器的这条路怎么保障安全？如果服务器用它的的私钥加密数据传给浏览器，那么浏览器用公钥可以解密它，而这个公钥是一开始通过明文传输给浏览器的，这个公钥被谁劫持到的话，他也能用该公钥解密服务器传来的信息了。所以目前似乎只能保证由浏览器向服务器传输数据时的安全性。  

#### 3.改良版的非对称加密
既然一对私钥秘钥能保证一方面的通信安全，那用两队公钥私钥就能保证互相通信安全了 : )  
1.某网站拥有用于非对称加密的公钥A、私钥A’；浏览器拥有用于非对称加密的公钥B、私钥B’。  
2.浏览器像网站服务器请求，服务器把公钥A明文给传输浏览器。  
3.浏览器把公钥B明文传输给服务器。  
4.之后浏览器向服务器传输的所有东西都用公钥A加密，服务器收到后用私钥A’解密。由于只有服务器拥有这个私钥A’可以解密，所以能保证这条数据的安全。  
5.服务器向浏览器传输的所有东西都用公钥B加密，浏览器收到后用私钥B’解密。同上也可以保证这条数据的安全。

的确可以！抛开这里面仍有的漏洞不谈（下文会讲），HTTPS的加密却没使用这种方案，为什么？最主要的原因是非对称加密算法非常耗时，特别是加密解密一些较大数据的时候有些力不从心，而对称加密快很多。

#### 4.非对称加密+对称加密
既然非对称加密耗时，非对称加密+对称加密结合可以吗？而且得尽量减少非对称加密的次数。当然是可以的，而且非对称加密、解密各只需用一次即可。  
1.某网站拥有用于非对称加密的公钥A、私钥A’。   
2.浏览器像网站服务器请求，服务器把公钥A明文给传输浏览器。  
3.浏览器随机生成一个用于对称加密的密钥X，用公钥A加密后传给服务器。  
4.服务器拿到后用私钥A’解密得到密钥X。  
5.这样双方就都拥有密钥X了，且别人无法知道它。之后双方所有数据都用密钥X加密解密。  

但是！这样会有另一个问题，中间人劫持替换了服务器给浏览器的公钥A，换成了自己伪造的公钥B，浏览器生成的对称秘钥X用公钥B加密后被劫持，劫持者用自己的私钥B’解密得到秘钥X，用之前劫持的公钥A加密后给服务器，服务器也会得到一样的秘钥X，但这时秘钥X已经泄露了= =  
因此需要一个证明，证明浏览器收到的公钥确实是需要通信的服务器给的，类似于现实中张三向李四证明自己是张三一样，张三可以出具自己的身份证给李四，技能证明自己是张三；但是又有个问题，我不是张三但我伪造了一个张三的身份证，我好像就变成了张三了；这个时候身份证的真伪就必须有个权威机构来证明比如公安局，在公安局证明了手上的张三的身份证是真的的时候，你就是张三了。兜了一大圈，终于证明了我就是我了。

#### 5.数字证书（CA证书）
互联网中，CA机构就像是公安局，数字证书就是服务器的身份证，证书里包括了证书持有者、证书持有者的公钥等信息，服务器把证书传输给浏览器，浏览器从证书里取公钥就行了。