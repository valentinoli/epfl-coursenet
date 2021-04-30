import { getColorMaps } from '~/utils/colors'

export const state = () => ({
  appName: 'EPFL CourseNet',
  navTreeviewItems: [],
  navAutocompleteItems: [],
  colorMaps: {},
  networkDrawer: false,
  networkDrawerActiveTab: 0,
  previousEntityRoute: '',
  graphType: 'directed',
  touchInterface: false,
  currentView: 'the-network',
  selectedNode: null,
  graphOpacityVoronoi: 0.45, // must be smaller than graphOpacity
  graphOpacity: 0.75,
  similarityLinks: [],
  courseSlugs: [],
})

export const getters = {
  isBipartiteGraph(state) {
    return state.graphType === 'bipartite'
  },
  isDirectedGraph(state) {
    return state.graphType === 'directed'
  },
  isSimilarityGraph(state) {
    return state.graphType === 'similarity'
  },
  isCurrentViewNetwork(state) {
    return state.currentView === 'the-network'
  },
  isCurrentViewDataTable(state) {
    return state.currentView === 'the-data-table'
  },
}

export const mutations = {
  setTreeviewItems(state, items) {
    state.navTreeviewItems = items
  },
  setAutocompleteItems(state, items) {
    state.navAutocompleteItems = items
  },
  computeColorMaps(state, filterOptions) {
    state.colorMaps = getColorMaps(filterOptions)
  },
  toggleNetworkDrawer(state, drawer) {
    if (typeof drawer === 'boolean') {
      state.networkDrawer = drawer
    } else {
      state.networkDrawer = !state.networkDrawer
    }
  },
  setNetworkDrawerActiveTab(state, tab) {
    state.networkDrawerActiveTab = tab
  },
  setPreviousEntityRoute(state, route) {
    state.previousEntityRoute = route
  },
  setGraphType(state, type) {
    state.graphType = type
  },
  setTouchInterface(state) {
    state.touchInterface = true
  },
  setCurrentView(state, value) {
    state.currentView = value
  },
  setSelectedNode(state, value) {
    state.selectedNode = value
  },
  setCourseSlugs(state, slugs) {
    state.courseSlugs = slugs
  },
  setSimilarityLinks(state, links) {
    state.similarityLinks = links
  },
}

export const actions = {
  async storeNavItems({ commit }) {
    const { treeview, autocomplete, allFilterOptions } = await this.$axios.$get(
      '/nav'
    )
    // treeview items needs to be an array
    commit('setTreeviewItems', [treeview])
    commit('setAutocompleteItems', autocomplete)
    commit('computeColorMaps', allFilterOptions)
  },
  async nuxtServerInit({ dispatch }) {
    await dispatch('storeNavItems')
  },
  async fetchSimilarityLinks({ commit, rootState, state }) {
    const links = await this.$fetchSimlinks(
      rootState.controls.similarityThreshold,
      state.courseSlugs
    )
    commit('setSimilarityLinks', links)
  },
  async graphTypeAction({ commit, dispatch }, graphType) {
    if (graphType === 'similarity') {
      // fetch similarity links before mutating graphType
      // to avoid graph rendering before links are available
      await dispatch('fetchSimilarityLinks')
    }
    commit('setGraphType', graphType)
  },
}
