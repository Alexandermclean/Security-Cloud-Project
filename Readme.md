sass_program

----------------------------------
by 2018/4/8 11:00
----------------------------------
emmmmm 今年2月1号开始的安全SASS云项目在上个月（3月31号）也结束第一次的发布会检查，总体上来说还是挺不错的吧，2个月的时间前端部分完成了95%，和后台的联调完成的不多，大概也就70%吧= =实在是页面太多了，一个完整的SASS云项目为了达到发布会的要求，从没有成熟的UI设计和业务实现逻辑到各功能模块的实现用了大概一个半月的时间，后面花了半个月左右的时间联调。总的页面总共加起来数量大概有将近100各左右，我负责了大概其中的20个页面吧：包含LB、NAT、用户信息等等的主页、配置页和详情页，31号晚上提交代码后闲下来无聊数了一下前前后后业务代码、封装模块组件的代码差不多有个1w行吧T T虽然这中间加班了很多次，也有发布会前一晚通宵，但还是有很多收获的吧 :)

这次项目用的主要是VUE框架基于webpack、es6和node开发的环境，其中为了快速开发吧，用了一些iview的组件，自己也在iview提供的基础组件的基础上封装了几个功能性更强的组件。对于这次项目的总结我会每天写一点，当做记录吧，项目结束我会整理成几篇博文放到我的博客去。

## 1.路由（router）	
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
> 注释：也就是说:template: '<App/>' 表示用<app></app>替换index.html里面的<div id="app"></div>
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
