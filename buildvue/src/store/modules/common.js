const state = {
	name: 'WAF'
}
const getters = {
	getName: state => state.name
}
const mutations = {
	setName (state, agreement) {
		state.name = agreement
	}
}
const actions = {
	takeAction ({commit}) {
		setTimeout(() => {
      commit('setName') // action可以在异步里调用mutations
    }, 1000)
	},
	increment (context) {
		context.commit('setName')
	}
}

export default {
	// namespaced: true,
	state,
	getters,
	mutations,
	actions
}