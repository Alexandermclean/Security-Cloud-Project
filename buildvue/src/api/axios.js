import axios from 'axios'

axios.defaults.timeout = 5000
axios.defaults.headers = Object.assign(axios.defaults.headers, {'Cache-Control': 'no-cache'})

export default axios