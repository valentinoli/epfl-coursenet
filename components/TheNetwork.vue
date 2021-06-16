<template>
  <div>
    <div class="svg-container">
      <div class="header--absolute">
        <slot name="header"></slot>
      </div>

      <div
        class="network-button-group d-flex align-end"
        :class="[smAndDown ? 'flex-column-reverse' : 'flex-column']"
        :style="buttonGroupStyle"
      >
        <div class="d-flex mt-md-2">
          <v-scroll-x-transition>
            <v-select
              v-if="graphTypeSelect"
              :value="graphType"
              :items="graphTypes"
              label="Network type"
              hide-details
              class="pt-0 mr-2"
              style="max-width: 200px"
              :menu-props="`offsetY, ${smAndDown ? 'top' : 'bottom'}`"
              @change="changeGraphType"
            />
          </v-scroll-x-transition>
          <v-btn icon @click="graphTypeSelect = !graphTypeSelect">
            <v-icon>mdi-graph</v-icon>
          </v-btn>
        </div>

        <div class="d-flex mb-3 mb-sm-0 mt-sm-3">
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
              class="pt-0 mr-2"
              style="max-width: 200px"
              @change="networkSearchOnChange"
            >
              <template #selection>
                <!-- Prevent display of selected item -->
              </template>
            </v-autocomplete>
          </v-scroll-x-transition>
          <v-tooltip left>
            <template #activator="{ on }">
              <v-btn
                icon
                v-on="networkSearch ? {} : on"
                @click="networkSearch = !networkSearch"
              >
                <v-icon>mdi-map-search-outline</v-icon>
              </v-btn>
            </template>
            <span>Search the network</span>
          </v-tooltip>
        </div>

        <v-tooltip left>
          <template #activator="{ on }">
            <v-btn icon class="mb-3 mt-sm-3" v-on="on" @click="centerGraph">
              <v-icon>mdi-crosshairs-gps</v-icon>
            </v-btn>
          </template>
          <span>Reset position</span>
        </v-tooltip>
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
          text: 'Course Dependency',
        },
        {
          value: 'bipartite',
          text: 'Courses-Lecturers',
        },
        {
          value: 'similarity',
          text: 'Course Similarity',
        },
      ],
      graph: {},
      // set true to force immediate rendering of the tooltip
      // to find it in the DOM early in mounted() hook
      tooltip: true,
      tooltipContentEl: null,
      networkSearch: false,
      graphTypeSelect: true,
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
    smAndDown() {
      return this.$vuetify.breakpoint.smAndDown
    },
    buttonGroupStyle() {
      const margin = '10px'
      const style = {
        position: 'absolute',
        right: margin,
      }
      return this.smAndDown
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
    'controls.nodeSize'() {
      // pass alpha === 0 to avoid reheating simulation
      this.renderGraph(0)
    },
    'controls.nodeColor'() {
      this.renderGraph(0)
    },
    'controls.nodeGroup'() {
      this.renderGraph()
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
    this.centerGraph()
    this.onResize = () => this.graph.setSVGViewBox()
    window.addEventListener('resize', this.onResize)

    this.tooltipContentEl = this.$refs.tooltip.$refs.content
    this.configureTouchExperience()
    this.hideTooltip()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    ...mapMutations(['setSelectedNode']),
    ...mapActions(['graphTypeAction']),
    changeGraphType(value) {
      this.graphTypeAction(value)
    },
    renderGraph(alpha) {
      this.graph.render(this.graphData, alpha)
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
      this.tooltipContentEl.style.left = 'auto'
      this.tooltipContentEl.style.top = 'auto'
      this.tooltipContentEl.style.bottom = '68px'
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
      this.networkSearch = false
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

.network-button-group
  cursor: move
  // Disallow pointer events in container only
  // to allow the user to interact with the graph in that area
  pointer-events: none
  > *
    // but we do want the user to be able to click on the actions
    pointer-events: auto
  .v-btn
    margin-bottom: 4px
</style>
