import Vue from 'vue'
import Vuex from 'vuex'
import AppEnv from '@/store/services/AppEnv'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    AppEnv
  }
})
