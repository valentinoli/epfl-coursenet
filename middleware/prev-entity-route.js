export default function ({ store, from }) {
  // Keep track of previous entity route
  // to know when to clear filters
  if (from && from.name === 'level-program-specialization') {
    store.commit('setPreviousEntityRoute', from.fullPath)
  }
}
