<template>
	<div style="height: 100%">
		<Header id='asd'>
			<Menu mode='horizontal' :theme='theme2' style='float:right'>
				<MenuItem name='h1'><Icon type="ios-paper" />通告</MenuItem>
				<MenuItem name='h2'><Icon type="ios-people" />首页</MenuItem>
				<MenuItem name='h3'><Icon type="ios-stats" />工单</MenuItem>
				<MenuItem name='h4'><Icon type="ios-construct" />嘻嘻</MenuItem>
			</Menu>
		</Header>
		<div class='wrap'>
			<div class='sidebar'>
				<Menu :theme="theme2" width='100%' height='100%' accordion>
		            <Submenu name="1">
		                <template slot="title">
		                    <Icon type="ios-paper" />
		                    内容管理
		                </template>
		                <MenuItem name="1-1">文章管理</MenuItem>
		                <MenuItem name="1-2">评论管理</MenuItem>
		                <MenuItem name="1-3">举报管理</MenuItem>
		            </Submenu>
		            <Submenu name="2">
		                <template slot="title">
		                    <Icon type="ios-people" />
		                    用户管理
		                </template>
		                <MenuItem name="2-1">新增用户</MenuItem>
		                <MenuItem name="2-2">活跃用户</MenuItem>
		            </Submenu>
		            <Submenu name="3">
		                <template slot="title">
		                    <Icon type="ios-stats" />
		                    统计分析
		                </template>
		                <MenuGroup title="使用">
		                    <MenuItem name="3-1">新增和启动</MenuItem>
		                    <MenuItem name="3-2">活跃分析</MenuItem>
		                    <MenuItem name="3-3">时段分析</MenuItem>
		                </MenuGroup>
		                <MenuGroup title="留存">
		                    <MenuItem name="3-4">用户留存</MenuItem>
		                    <MenuItem name="3-5">流失用户</MenuItem>
		                </MenuGroup>	
		            </Submenu>
		        </Menu>
			</div>
	        <div class="content">
	        	<div class="breadcrumb">
	        		<Breadcrumb>
				        <BreadcrumbItem to="/">Home</BreadcrumbItem>
				        <BreadcrumbItem to="/components/breadcrumb">Components</BreadcrumbItem>
				        <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
				    </Breadcrumb>
	        	</div>
	        	<span style="font-size:20px">main</span>
	        	<router-view></router-view>
	        </div>
		</div>
	</div>
</template>

<script type="text/javascript">
	export default {
		data () {
			return {
				theme2: 'dark'
			}
		},
		mounted () {
			document.body.style.setProperty('--wrapheight', ($('#asd').height()))
		}
	}
</script>

<style type="text/css" scoped>
	.wrap {
		overflow: auto;
		height: calc(100% - var(--wrapheight));
	}
	.sidebar {
		display: block;
		float: left;
		width: 10%;
		height: 100%;
		border-right: 1px solid #ccc;
	}
	.content {
		display: inline-block;
		width: 90%;
		height: 100%;
		padding: 10px;
	}
	.breadcrumb {
		float: left;
	}
</style>