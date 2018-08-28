<template>
	<div>
		<div id="myChart" style="width:300px;height:300px"></div>
	</div>
</template>

<script type="text/javascript">
export default {
	data () {
		return {

		}
	},
	methods: {
		drawLine(){
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById('myChart'))
      // 绘制图表
      myChart.setOption({
          title: { text: '在Vue中使用echarts' },
          tooltip: {},
          xAxis: {
            data: ["y","z","h","t","o","p"]
          },
          yAxis: {},
          series: [{
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }]
      });
    }
  },
  mounted () {
  	this.drawLine()
  }
}	
</script>