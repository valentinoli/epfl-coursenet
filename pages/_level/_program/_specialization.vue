<template>
  <div>
    <lazy-the-network-navigation-drawer
      v-bind="{ ...filterOptionsFiltered, ...actionButtons[0] }"
      :courses="subgraphNodesFiltered"
    />
    <!-- transition seems to mess up with d3 transition on the <svg> somehow -->
    <!-- <v-slide-x-transition mode="out-in"> -->
    <keep-alive>
      <component :is="currentView" v-bind="currentViewProps">
        <template #header>
          <the-page-header v-bind="headerSlotProps" />
        </template>
      </component>
    </keep-alive>
    <!-- </v-slide-x-transition> -->
    <v-bottom-navigation
      app
      color="primary"
      class="d-flex justify-space-between"
      :value="bottomNavigation"
    >
      <div class="d-flex">
        <v-btn
          v-for="{ view, label, icon } in viewButtons"
          :key="label"
          :style="btnStyle"
          :class="{ 'v-btn--active-view': view === currentView }"
          @click="changeView(view)"
        >
          <span>{{ label }}</span>
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
      </div>
      <div class="d-flex v-btn-group--inactive">
        <v-btn
          v-for="{ label, icon, click } in actionButtons"
          :key="label"
          :style="btnStyle"
          @click="click"
        >
          <span>{{ label }}</span>
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
      </div>
    </v-bottom-navigation>
    <lazy-base-bottom-sheet
      :value.sync="showControls"
      v-bind="actionButtons[1]"
    >
      <the-network-controls />
    </lazy-base-bottom-sheet>
    <lazy-base-bottom-sheet :value.sync="showLegend" v-bind="actionButtons[2]">
      <the-network-legend
        :directed-nodes="directedGraphFiltered.nodes"
        :bipartite-nodes="bipartiteGraphFiltered.nodes"
      />
    </lazy-base-bottom-sheet>
  </div>
</template>

<script>
import graphUtils from '@/utils/graph-filtering'
import { mapGetters, mapState, mapMutations } from 'vuex'

export default {
  async asyncData({
    $axios,
    route,
    error,
    store: { commit, state },
    $fetchSimlinks,
  }) {
    const endpoint = route.fullPath === '/all-courses' ? '/' : route.fullPath
    try {
      const data = await $axios.$get(`/epfl${endpoint}`, { progress: false })
      const treeview = [data.treeview]
      if (route.fullPath !== state.previousEntityRoute) {
        // important! commit course slugs before fetching similarity links
        const { courses } = data.treeview
        commit('setCourseSlugs', courses)
        if (state.graphType === 'similarity') {
          // note: if we dispatch the 'fetchSimilarityLinks' vuex action
          // instead of the following, it will not be executed until asyncData()
          // has finished making the graph render without any links
          const links = await $fetchSimlinks(
            state.controls.similarityThreshold,
            courses
          )
          commit('setSimilarityLinks', links)
        }
        // important: reset only after fetching similarity links
        commit('filters/resetMultiselects')
        commit('filters/resetTreeview', treeview)
        commit('filters/resetCourseCherries')
      }
      delete data.treeview
      return { ...data }
    } catch (e) {
      error(e)
    }
  },
  data() {
    return {
      showControls: false,
      showLegend: false,
      viewButtons: [
        {
          view: 'the-network',
          label: 'Network',
          icon: 'mdi-graph-outline',
        },
        {
          view: 'the-data-table',
          label: 'Table',
          icon: 'mdi-table-large',
        },
      ],
      actionButtons: [
        {
          label: 'Filters',
          icon: 'mdi-filter-outline',
          click: () => {
            this.toggleDrawer()
          },
        },
        {
          label: 'Controls',
          icon: 'mdi-tune-variant',
          click: () => (this.showControls = true),
        },
        {
          label: 'Legend',
          icon: 'mdi-map-legend',
          click: () => (this.showLegend = true),
        },
      ],
    }
  },
  head() {
    const { entity, title: entityTitle, levelTitle, programTitle } = this
    let title = entityTitle
    if (entity === 'program') {
      title += ` – ${levelTitle}`
    } else if (entity === 'specialization') {
      title += ` – ${programTitle} – ${levelTitle}`
    }
    return {
      title,
    }
  },
  computed: {
    ...mapState([
      'filters',
      'controls',
      'graphType',
      'currentView',
      'similarityLinks',
    ]),
    ...mapGetters({
      filtersAllDefault: 'filters/allDefault',
      isDataTable: 'isCurrentViewDataTable',
    }),
    bottomNavigation() {
      return this.viewButtons.findIndex((b) => b.view === this.currentView)
    },
    xs() {
      return this.$vuetify.breakpoint.xsOnly
    },
    btnStyle() {
      if (this.xs) {
        // Make buttons smaller on mobile
        return {
          minWidth: '60px',
          fontSize: '0.70rem',
          padding: '0 6px',
        }
      }

      return {}
    },
    subgraphNodesTreeviewFiltered() {
      const { subgraph } = this.graph.nodes
      if (this.filtersAllDefault) {
        return subgraph
      }
      return graphUtils.subgraphNodesTreeviewFilter(
        subgraph,
        this.filters.treeviewSelectedLeaves
      )
    },
    subgraphNodesFiltered() {
      return graphUtils.subgraphNodesMultiselectFilter(
        this.subgraphNodesTreeviewFiltered,
        this.filters.multiselect
      )
    },
    subgraphNodes() {
      // return course cherries if any
      const { courseCherries: c } = this.filters
      const nodes = c.length ? c : this.subgraphNodesFiltered
      return nodes
    },
    filterOptionsFiltered() {
      if (this.filtersAllDefault) {
        return this.filterOptions
      }
      return Object.fromEntries(
        Object.entries(this.filterOptions).map(([k, v]) => [
          k,
          // Filter out options which none of the subgraphNodes has (after treeview filtering)
          // For example, filter out section 'IN' if no course belongs to that section.
          v.filter((option) =>
            this.subgraphNodesTreeviewFiltered.some((n) => n[k] === option)
          ),
        ])
      )
    },
    directedGraphFiltered() {
      const { graph: g, subgraphNodes } = this

      return graphUtils.filterDirectedGraphNeighborhoods(
        graphUtils.filterDirectedGraph(g, subgraphNodes),
        this.controls
      )
    },
    directedGraph() {
      return graphUtils.processGraph(
        graphUtils.flattenDirectedGraph(this.directedGraphFiltered)
      )
    },
    bipartiteGraphFiltered() {
      return graphUtils.createBipartiteGraph(this.subgraphNodes)
    },
    bipartiteGraph() {
      const { nodes, links } = this.bipartiteGraphFiltered
      const graph = {
        nodes: Object.values(nodes).flat(),
        links,
      }
      return graphUtils.processGraph(graph)
    },
    similarityGraph() {
      const graph = {
        nodes: this.subgraphNodes,
        links: this.similarityLinks,
      }
      return graphUtils.processGraph(graph)
    },
    graphData() {
      switch (this.graphType) {
        case 'directed':
          return this.directedGraph
        case 'bipartite':
          return this.bipartiteGraph
        case 'similarity':
          return this.similarityGraph
        default:
          return null
      }
    },
    subgraphNodesProcessed() {
      return this.graphData.nodes.filter((n) =>
        this.subgraphNodes.find((sn) => sn.slug === n.slug)
      )
    },
    currentViewProps() {
      if (this.isDataTable) {
        return { courses: this.subgraphNodesProcessed }
      }
      return { graphData: this.graphData }
    },
    headerSlotProps() {
      const { entity, title, levelTitle, programTitle, value } = this
      return { entity, title, levelTitle, programTitle, value }
    },
  },
  watch: {
    '$route.query.view': {
      immediate: true,
      handler(view) {
        if (!view) {
          this.setCurrentView('the-network')
        } else {
          this.setCurrentView(view)
        }
      },
    },
  },
  methods: {
    ...mapMutations({
      toggleDrawer: 'toggleNetworkDrawer',
      setTab: 'setNetworkDrawerActiveTab',
      changeFilter: 'filters/change',
    }),
    ...mapMutations(['setCurrentView', 'setCourseSlugs']),
    changeView(view) {
      this.$router.push({
        query: { view },
      })
      this.setCurrentView(view)
    },
  },
}
</script>

<style lang="sass" scoped>
h1, h2, h3
  > a
    text-decoration: none
    &:hover
      text-decoration: underline

// bottom navigation workaround
.theme--light.v-bottom-navigation
  .v-btn:not(.v-btn--active).v-btn--active-view
    color: inherit !important
  .v-btn-group--inactive .v-btn.v-btn--active
    color: rgba(0, 0, 0, 0.6)
</style>
