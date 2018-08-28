const northRouter = [
	{
		path: 'first',
		name: 'north_first',
		title: '北一',
		component: () => import('@/pages/north/n_first')
	},
	{
		path: 'echart',
		name: 'echart',
		title: '试试图',
		component: () => import('@/pages/north/tryEchart')
	}
]

export default northRouter