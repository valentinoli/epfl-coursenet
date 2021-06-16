<template>
  <div
    class="network-link"
    :style="{
      backgroundColor: voronoiColor,
    }"
    @click="onClick"
  >
    <div
      class="network-link__node"
      :style="{
        backgroundColor: nodeColor,
      }"
    ></div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState({
      cmap: 'colorMaps',
      controls: 'controls',
    }),
    voronoiColor() {
      return this.$nodeVoronoiColor(
        this.cmap,
        this.controls.nodeGroup,
        this.item
      )
    },
    nodeColor() {
      return this.$nodeFillColor(this.cmap, this.controls.nodeColor, this.item)
    },
  },
  methods: {
    ...mapMutations(['setCurrentView', 'setSelectedNode']),
    onClick() {
      const view = 'the-network'
      this.$router.push({
        query: { view },
      })
      this.setCurrentView(view)
      this.setSelectedNode({ ...this.item, triggerZoom: true })
    },
  },
}
</script>

<style lang="sass">
$outer: 35px
$inner: 25px
$padding: ($outer - $inner)/2
.network-link-header
  padding-left: $padding
.network-link
  display: block
  cursor: pointer
  color: inherit
  width: $outer
  height: $outer
  padding: $padding
  text-decoration: none
  opacity: 0.8
  &:hover
    opacity: 1
  &__node
    width: $inner
    height: $inner
    border-radius: 50%
    opacity: inherit
</style>
