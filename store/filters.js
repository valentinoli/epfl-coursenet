export const state = () => ({
  multiselect: {
    credits: [],
    semester: [],
    section: [],
    language: [],
    examForm: [],
  },
  treeviewItems: [],
  treeviewSelectedLeaves: [],
  treeviewDefaultLength: 0,
  courseCherriesAll: [],
  courseCherries: [],
})

export const getters = {
  allDefault(state) {
    return (
      state.treeviewSelectedLeaves.length === state.treeviewDefaultLength &&
      state.courseCherriesAll.every((arr) => !arr.length) &&
      Object.values(state.multiselect).every((arr) => !arr.length)
    )
  },
}

function getLeaves(item) {
  if (item.children.length) {
    return item.children.flatMap(getLeaves)
  }

  return item
}

export const mutations = {
  change(state, { key, value }) {
    state[key] = value
  },
  changeMultiselect(state, { key, value }) {
    state.multiselect[key] = value
  },
  changeCourseCherries(state, { cherries, courses }) {
    state.courseCherriesAll = cherries
    state.courseCherries = cherries.filter((cherry) =>
      courses.some((c) => c.slug === cherry.slug)
    )
  },
  resetMultiselects(state) {
    for (const k in state.multiselect) {
      state.multiselect[k] = []
    }
  },
  resetTreeview(state, treeview) {
    state.treeviewItems = treeview
    // Get all leaves
    const leaves = treeview.flatMap(getLeaves)
    state.treeviewDefaultLength = leaves.length
    // By default all nodes are selected
    state.treeviewSelectedLeaves = leaves
  },
  resetCourseCherries(state) {
    state.courseCherriesAll = []
    state.courseCherries = []
  },
}
