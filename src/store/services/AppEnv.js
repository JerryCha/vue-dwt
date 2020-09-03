const state = {
  viewportWidth: 0,
  viewportHeight: 0,
  windowWidth: 0,
  windowHeight: 0
}

const getters = {}

const mutations = {
  setViewportWidth (state, width) {
    state.viewportWidth = width
  },
  setViewportHeight (state, height) {
    state.viewportHeight = height
  },
  setWindowWidth (state, width) {
    state.windowWidth = width
  },
  setWindowHeight (state, height) {
    state.windowHeight = height
  }
}

const actions = {
  setViewportDimension (context, dimension) {
    context.commit('setViewportWidth', dimension[0])
    context.commit('setViewportHeight', dimension[1])
  },
  setWindowDimension (context, dimension) {
    context.commit('setWindowWidth', dimension[0])
    context.commit('setWindowHeight', dimension[1])
  }
}

export default {
  state,
  getters,
  mutations,
  actions,
  namespaced: true
}