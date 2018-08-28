<template>
	<div>
		<span>yuhui</span>
		<div>
			<span>~ 指向static测试：</span>
			<span>{{staticTest}}</span>
		</div>
	</div>
</template>

<script type="text/javascript">
import test from '~/test.json'
export default {
	data () {
		return {
			staticTest: ''
		}
	},
	created () {
		this.staticTest = test.yu
	}
}
</script>