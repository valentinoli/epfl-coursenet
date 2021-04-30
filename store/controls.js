export const state = () => ({
  incomingSwitch: true,
  outgoingSwitch: true,
  nodeGroup: null,
  nodeSize: null,
  nodeColor: null,
  similarityThreshold: 0.2,
})

export const mutations = {
  change(state, { key, value }) {
    state[key] = value
  },
}
