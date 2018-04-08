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

## 2.封装组件
在三月中旬开发的时候，被要求在主要业务的主页上添加一个详情的可收缩的弹框。需求很简单，但为了统一样式便于开发，采取了单独封装组件的方式。其中为了保证详情框和主页面内容高度一致，用到CSS变量的知识点（具体内容可以阅读[阮一峰CSS变量教程](http://www.ruanyifeng.com/blog/2017/05/css-variables.html){:target="_blank"}）。
```bash
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