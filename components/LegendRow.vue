<template>
  <div v-if="items.length">
    <div>
      <div v-if="heading" class="text-h5 mt-6 mb-1" v-text="heading" />
      <div
        v-if="subheading"
        class="text-subtitle-1 font-weight-bold mb-2"
        :class="[!heading && 'mt-6']"
        v-text="subheading"
      />
    </div>
    <v-row>
      <!-- v-for="(value, key) in colorMap" -->
      <legend-col
        v-for="(item, index) in items"
        :key="index"
        v-bind="item"
        :opacity="opacity"
        :item-variant="itemVariant"
        :min-col-width="minColWidth"
      >
        <template #img><slot name="img" /></template>
      </legend-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  inheritAttrs: false,
  props: {
    items: {
      type: Array,
      required: true,
    },
    heading: {
      type: String,
      default: '',
    },
    subheading: {
      type: String,
      default: '',
    },
    itemVariant: {
      type: String,
      default: 'circle',
      validator(value) {
        return value === 'circle' || value === 'square'
      },
    },
  },
  computed: {
    ...mapState(['graphOpacity', 'graphOpacityVoronoi']),
    opacity() {
      // drawing nodes or Voronoi groups?
      return this.itemVariant === 'circle'
        ? this.graphOpacity
        : this.graphOpacityVoronoi
    },
    minColWidth() {
      const maxLengthLabel = Math.max(...this.items.map((i) => i.label.length))
      // take into account width of circle/square + margins/paddings
      // assuming each character takes up to 10px (depends on font size of course)
      return `${maxLengthLabel * 10 + 100}px`
    },
  },
}
</script>
