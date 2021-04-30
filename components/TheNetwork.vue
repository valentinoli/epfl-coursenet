<template>
  <div>
    <div class="svg-container">
      <div class="header--absolute">
        <slot name="header"></slot>
      </div>

      <div
        class="network-button-group d-flex flex-column flex-sm-column-reverse align-end"
        :style="buttonGroupStyle"
      >
        <v-tooltip left>
          <template #activator="{ on }">
            <!-- <base-icon-button v-on="on" @click="centerGraph">
              mdi-crosshairs-gps
            </base-icon-button> -->
            <v-btn icon v-on="on" @click="centerGraph">
              <v-icon>mdi-crosshairs-gps</v-icon>
            </v-btn>
          </template>
          <span>Reset position</span>
        </v-tooltip>
        <v-menu :bottom="!xs" close-on-click offset-x offset-y>
          <template #activator="{ attrs, on: onMenu }">
            <v-tooltip left>
              <template #activator="{ on: onTooltip }">
                <!-- <base-icon-button
                  v-bind="attrs"
                  v-on="{ ...onMenu, ...onTooltip }"
                >
                </base-icon-button> -->
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="xs ? onMenu : { ...onMenu, ...onTooltip }"
                >
                  <v-icon>mdi-graph</v-icon>
                </v-btn>
              </template>
              <span>Change network type</span>
            </v-tooltip>
          </template>
          <v-list>
            <v-list-item-group
              :value="graphTypeIndex"
              mandatory
              @change="changeGraphTypeIndex"
            >
              <v-list-item v-for="(item, i) in graphTypes" :key="i">
                <v-list-item-title class="mr-1">{{
                  item.text
                }}</v-list-item-title>
                <!-- <v-list-item-icon
                  v-for="(icon, j) in item.icons"
                  :key="j"
                  class="mx-1"
                  ><v-icon>mdi-{{ icon }}</v-icon></v-list-item-icon
                > -->
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
        <div class="d-flex">
          <v-scroll-x-transition>
            <v-autocomplete
              v-if="networkSearch"
              :items="graphData.nodes"
              :item-text="({ code, name }) => `${code} ${name}`"
              label="Search network"
              placeholder="Start typing..."
              hide-selected
              hide-details
              return-object
              class="pt-0"
              @change="networkSearchOnChange"
            >
              <template #selection>
                <!-- Prevent display of selected item -->
              </template>
            </v-autocomplete>
          </v-scroll-x-transition>
          <v-tooltip left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click="networkSearch = !networkSearch">
                <v-icon>mdi-map-search-outline</v-icon>
              </v-btn>
            </template>
            <span>Search the network</span>
          </v-tooltip>
        </div>
      </div>
      <svg></svg>
    </div>
    <v-tooltip
      ref="tooltip"
      v-model="tooltip"
      attach="#app"
      :max-width="200"
      :min-width="200"
      content-class="v-tooltip__content--network"
    >
      <the-network-tooltip-content
        v-if="selectedNode"
        v-bind="selectedNode"
        :touch-interface="touchInterface"
      />
    </v-tooltip>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { select } from 'd3-selection'

export default {
  props: {
    graphData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      graphTypes: [
        {
          value: 'directed',
          text: 'Course Dependency Network',
          // icons: ['book-education-outline', 'arrow-right', 'book-education'],
        },
        {
          value: 'bipartite',
          text: 'Courses-Lecturers Network',
          // icons: ['book-education-outline', 'minus', 'human-male-female'],
        },
        {
          value: 'similarity',
          text: 'Course Similarity Network',
        },
      ],
      graph: {},
      // set true to force immediate rendering of the tooltip
      // to find it in the DOM early in mounted() hook
      tooltip: true,
      tooltipContentEl: null,
      networkSearch: false,
    }
  },
  computed: {
    ...mapState([
      'colorMaps',
      'controls',
      'graphType',
      'touchInterface',
      'selectedNode',
      'graphOpacity',
      'graphOpacityVoronoi',
    ]),
    ...mapGetters(['isBipartiteGraph', 'isDirectedGraph', 'isSimilarityGraph']),
    graphTypeIndex() {
      return this.graphTypes.findIndex((t) => t.value === this.graphType)
    },
    xs() {
      return this.$vuetify.breakpoint.xsOnly
    },
    buttonGroupStyle() {
      const margin = '10px'
      const style = { position: 'absolute', right: margin }
      return this.xs
        ? {
            ...style,
            bottom: margin,
          }
        : {
            ...style,
            top: margin,
          }
    },
  },
  watch: {
    selectedNode(d) {
      if (d.triggerZoom) {
        const sel = select(`#${d.slug}`)
        const nodeDatum = sel.datum()
        const nodeEl = sel.node()
        this.graph.zoomNode(nodeDatum, nodeEl)
      }
    },
    graphData: {
      handler(data) {
        if (data && this.graph.render) {
          this.graph.render(data)
        }
      },
    },
    controls: {
      deep: true,
      handler() {
        this.renderGraph()
      },
    },
    touchInterface(val) {
      if (val) {
        this.configureTouchExperience()
      }
    },
  },
  mounted() {
    // Only executed on client
    this.graph = new this.$graph(this)
    this.renderGraph()
    window.addEventListener('resize', () => {
      this.graph.setSVGViewBox()
    })

    this.tooltipContentEl = this.$refs.tooltip.$refs.content
    this.configureTouchExperience()
    this.hideTooltip()
  },
  methods: {
    ...mapMutations(['setSelectedNode']),
    ...mapActions(['graphTypeAction']),
    changeGraphTypeIndex(index) {
      const graphType = this.graphTypes[index].value
      this.graphTypeAction(graphType)
    },
    renderGraph() {
      this.graph.render(this.graphData)
    },
    centerGraph() {
      this.graph.centerGraph()
    },
    onTouchTooltip(evt) {
      // prevent click event from firing
      // in case browser triggers both
      evt.preventDefault()
      this.tooltip = true
    },
    configureTouchExperience() {
      // some browsers don't yet support TouchEvents, so we handle both touchstart and click
      this.tooltipContentEl.addEventListener('touchstart', this.onTouchTooltip)
      this.tooltipContentEl.addEventListener('click', this.onTouchTooltip)
    },
    hideTooltip() {
      this.tooltip = false
    },
    showTooltip() {
      this.tooltip = true
    },
    updateTooltipPosition(
      { clientX: x, clientY: y },
      xOffset = 20,
      yOffset = 0
    ) {
      const { tooltipContentEl: t } = this

      // We check the window position of the mouse to avoid overflow
      const { innerWidth, innerHeight } = window
      if (x > innerWidth / 2) {
        t.style.left = 'auto'
        t.style.right = `${innerWidth - x + xOffset}px`
      } else {
        t.style.left = `${x + xOffset}px`
        t.style.right = 'auto'
      }

      if (y > innerHeight / 2) {
        t.style.top = 'auto'
        t.style.bottom = `${innerHeight - y + yOffset}px`
      } else {
        t.style.top = `${y + yOffset}px`
        t.style.bottom = 'auto'
      }
    },
    networkSearchOnChange(node) {
      // hide tooltip before mutating the state
      this.hideTooltip()
      this.setSelectedNode({ ...node, triggerZoom: true })
    },
  },
}
</script>

<style lang="sass">
[v-cloak]
  display: none
$absolute-margin: 10px

// https://github.com/AleshaOleg/postcss-sass/issues/120
// @import '~vuetify/src/styles/styles.sass'
// .network-button-group
//   position: absolute
//   top: $absolute-margin
//   right: $absolute-margin
//   @media #{map-get($display-breakpoints, 'sm-and-up')}
//     top: auto
//     bottom: $absolute-margin

.svg-container
  position: relative

  .header--absolute
    position: absolute
    top: $absolute-margin
    left: $absolute-margin

.v-tooltip__content.v-tooltip__content--network
  /* Override Vuetify default, enable pointer events */
  pointer-events: auto

.network-button-group .v-btn
  margin-bottom: 4px
</style>
