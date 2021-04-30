<template>
  <div
    class="d-flex flex-column flex-sm-row align-center align-sm-start justify-space-between"
  >
    <template v-if="isDirectedGraph || isSimilarityGraph">
      <div
        v-if="isDirectedGraph"
        class="d-flex flex-column align-center align-sm-start"
      >
        <v-subheader class="px-0">Neighborhood switches</v-subheader>
        <v-switch
          v-for="s in switches"
          :key="s.storeKey"
          v-model="s.value"
          :label="s.label"
          inset
          hide-details
          class="mr-4"
          @change="change(s.storeKey, $event)"
        />
      </div>
      <div v-else style="min-width: 180px">
        <v-subheader class="px-0 mb-8">Similarity threshold</v-subheader>
        <v-slider
          v-model="similaritySlider"
          :min="0.2"
          :max="0.95"
          :step="0.05"
          ticks
          color="primary"
          thumb-color="primary"
          thumb-label="always"
          :loading="sliderLoading"
          :disabled="sliderDisabled"
          @input="onSliderInput"
        />
      </div>
    </template>
    <div
      class="d-flex flex-column align-center align-sm-start mt-6 mt-sm-0 ml-sm-4"
    >
      <v-subheader class="px-0">Node customization</v-subheader>
      <div class="d-flex flex-column flex-lg-row mt-4">
        <v-select
          v-for="s in selects"
          :key="s.storeKey"
          v-model="s.value"
          :items="s.items"
          :label="s.label"
          outlined
          hide-details
          :menu-props="{ offsetY: true, top: true, nudgeTop: 10 }"
          class="mb-4 mb-lg-0 mr-lg-4"
          :style="{
            maxWidth: '200px',
          }"
          @change="change(s.storeKey, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  data() {
    return {
      sliderDisabled: false,
      sliderLoading: false,
    }
  },
  computed: {
    ...mapState(['controls', 'courseSlugs']),
    ...mapGetters(['isBipartiteGraph', 'isDirectedGraph', 'isSimilarityGraph']),
    switches() {
      const { controls: c } = this
      return [
        {
          storeKey: 'incomingSwitch',
          label: 'Incoming',
          value: c.incomingSwitch,
        },
        {
          storeKey: 'outgoingSwitch',
          label: 'Outgoing',
          value: c.outgoingSwitch,
        },
      ]
    },
    selects() {
      const { controls: c, isBipartiteGraph, isDirectedGraph } = this
      const groupItems = [
        {
          value: null,
          text: 'None',
        },
        {
          value: 'credits',
          // text: 'Credits',
        },
        {
          value: 'semester',
          // text: 'Semester',
        },
        {
          value: 'section',
          // text: 'Section',
        },
      ]
      const sizeItems = [
        {
          value: null,
          text: 'Uniform',
        },
        {
          value: 'credits',
          // text: 'Credits',
        },
        // {
        //   value: 'registrations',
        //   text: 'Registrations',
        // },
      ]
      if (isDirectedGraph) {
        sizeItems.push(
          ...[
            {
              value: 'inDegree',
              text: 'Node in-degree',
            },
            {
              value: 'outDegree',
              text: 'Node out-degree',
            },
          ]
        )
      } else {
        sizeItems.push({
          value: 'degree',
          text: 'Node degree',
        })
      }
      if (isBipartiteGraph) {
        groupItems.splice(1, 0, {
          value: 'bipartition',
          // text: 'Bipartition',
        })
      }

      const colorItems = [
        {
          value: null,
          text: 'Uniform',
        },
        {
          value: 'credits',
          // text: 'Credits',
        },
        {
          value: 'semester',
          // text: 'Semester',
        },
        {
          value: 'section',
          // text: 'Section',
        },
      ]
      return [
        {
          storeKey: 'nodeGroup',
          label: 'Node group',
          value: c.nodeGroup,
          items: groupItems.map(this.addText),
        },
        {
          storeKey: 'nodeColor',
          label: 'Node color',
          value: c.nodeColor,
          items: colorItems.map(this.addText),
        },
        {
          storeKey: 'nodeSize',
          label: 'Node size',
          value: c.nodeSize,
          items: sizeItems.map(this.addText),
        },
      ]
    },
    similaritySlider: {
      get() {
        return this.controls.similarityThreshold
      },
      set(value) {
        this.change('similarityThreshold', value)
      },
    },
  },
  methods: {
    ...mapMutations({
      changeControl: 'controls/change',
      setSimilarityLinks: 'setSimilarityLinks',
    }),
    addText(item) {
      return {
        ...item,
        text: item.text || this.$camelCaseTransform(item.value),
      }
    },
    change(key, value) {
      this.changeControl({ key, value })
    },
    onSliderInput: debounce(async function (value) {
      this.sliderDisabled = true
      this.sliderLoading = true
      this.$nuxt.$loading.start()
      const links = await this.$fetchSimlinks(value, this.courseSlugs)
      this.sliderDisabled = false
      this.sliderLoading = false
      this.$nuxt.$loading.finish()
      this.setSimilarityLinks(links)
    }, 1000),
  },
}
</script>

<style lang="sass">
.v-subheader
  white-space: nowrap
</style>
