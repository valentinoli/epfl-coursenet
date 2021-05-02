<template>
  <div class="legend">
    <legend-row
      :items="nodeGroupItems"
      heading="Groups"
      :subheading="nodeGroupItemsSubheading"
      item-variant="square"
    />
    <legend-row
      v-if="nodeGroup && nodeGroup !== 'bipartition'"
      :items="nodeGroupLecturerItems"
      subheading="Lecturers"
      item-variant="square"
    />
    <legend-row
      :items="neighborhoodItems"
      subheading="Neighborhood"
      item-variant="square"
    />
    <legend-row
      :items="nodeFillItems"
      heading="Nodes"
      :subheading="nodeFillItemsSubheading"
    />
    <legend-row
      :items="nodeFillLecturerItems"
      :subheading="nodeColor && 'Lecturers'"
    >
      <template #img>
        <img :src="$defaultProfileImg" />
      </template>
    </legend-row>
    <legend-row :items="neighborhoodItems" subheading="Neighborhood" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    directedNodes: {
      type: Object,
      required: true,
    },
    bipartiteNodes: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState({
      nodeGroup: (state) => state.controls.nodeGroup,
      nodeColor: (state) => state.controls.nodeColor,
      colorMaps: 'colorMaps',
    }),
    ...mapGetters(['isBipartiteGraph', 'isDirectedGraph']),
    lecturersCount() {
      return this.isBipartiteGraph ? this.bipartiteNodes.lecturers.length : 0
    },
    neighborhoodItems() {
      if (this.isDirectedGraph) {
        const { directedNodes: n } = this
        // should not include n.subgraph
        const counts = Object.fromEntries(
          ['incoming', 'outgoing', 'incomingOutgoing'].map((key) => [
            key,
            n[key].length,
          ])
        )
        return this.mergeCountsColorMap(
          this.filterCounts(counts),
          this.colorMaps.neighborhood
        )
      }
      return []
    },
    courses() {
      if (this.isBipartiteGraph) {
        // treat lecturers separately
        return this.bipartiteNodes.courses
      }

      return this.directedNodes.subgraph
    },
    nodeGroupColorMap() {
      if (this.nodeGroup) {
        return this.colorMaps[this.nodeGroup]
      }

      return {}
    },
    nodeFillColorMap() {
      if (this.nodeColor) {
        return this.colorMaps[this.nodeColor]
      }

      return { uniform: this.colorMaps.uniform }
    },
    nodeGroupCounts() {
      const { nodeGroup } = this

      if (nodeGroup) {
        if (nodeGroup === 'bipartition') {
          // special case, do not need to iterate over nodes
          return {
            courses: this.courses.length,
            lecturers: this.lecturersCount,
          }
        }

        return this.countColorMap(this.nodeGroupColorMap, nodeGroup)
      }

      return {}
    },
    nodeFillCounts() {
      const { nodeColor } = this

      if (nodeColor) {
        if (nodeColor === this.nodeGroup) {
          return this.nodeGroupCounts
        }
        return this.countColorMap(this.nodeFillColorMap, nodeColor)
      }

      return { uniform: this.courses.length }
    },
    nodeGroupItems() {
      return this.mergeCountsColorMap(
        this.filterCounts(this.nodeGroupCounts),
        this.nodeGroupColorMap
      )
    },
    nodeFillItems() {
      return this.mergeCountsColorMap(
        this.filterCounts(this.nodeFillCounts),
        this.nodeFillColorMap
      )
    },
    nodeGroupLecturerItems() {
      if (this.isBipartiteGraph) {
        return this.mergeCountsColorMap(
          this.filterCounts({ lecturers: this.lecturersCount }),
          this.colorMaps.bipartition
        )
      }

      return []
    },
    nodeFillLecturerItems() {
      const { nodeGroupLecturerItems: items } = this
      if (items.length === 1) {
        return [
          {
            ...items[0],
            color: 'white',
            textColor: 'black',
            borderColor: 'black',
          },
        ]
      }
      return []
    },
    nodeGroupItemsSubheading() {
      const { nodeGroup } = this
      if (!nodeGroup) {
        return ''
      }
      const heading = this.$camelCaseTransform(nodeGroup)
      if (nodeGroup === 'bipartition') {
        return heading
      }
      return `Course — ${heading}`
    },
    nodeFillItemsSubheading() {
      const { nodeColor } = this
      if (!nodeColor) {
        return ''
      }
      const heading = `Course — ${this.$camelCaseTransform(nodeColor)}`
      return heading
    },
  },
  methods: {
    countColorMap(colorMap, param) {
      const counts = Object.fromEntries(
        Object.keys(colorMap).map((k) => [k, 0])
      )
      this.courses.forEach(({ [param]: key }) => counts[key]++)

      return counts
    },
    filterCounts(counts) {
      return Object.entries(counts).filter((c) => c[1])
    },
    mergeCountsColorMap(countsEntries, colorMap) {
      return countsEntries.map(([key, count]) => ({
        ...colorMap[key],
        count,
      }))
    },
  },
}
</script>

<style lang="sass">
.legend
  .col
    flex-grow: 0

    /* min-width according to the largest observed legend item */
    // min-width: 167px

  .row
    justify-content: flex-start

  &__item
    cursor: pointer

    &-square,
    &-circle
      width: 40px
      height: 40px

    &-circle
      border-radius: 50%
</style>
