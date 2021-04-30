<template>
  <v-col :style="{ minWidth: minColWidth }">
    <div
      class="legend__item d-flex align-center"
      @mouseenter.self="mouseenter = true"
      @mouseleave.self="mouseenter = false"
    >
      <div
        class="d-flex justify-center align-center"
        :class="legendItemClass"
        :style="{
          backgroundColor: color,
          color: textColor || 'black',
          opacity: mouseenter ? 1 : opacity,
          border: `1px solid ${borderColor}`,
        }"
      >
        <span v-if="mouseenter">{{ count }}</span>
        <slot v-else name="img" />
      </div>
      <div class="ml-4">{{ label }}</div>
    </div>
  </v-col>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      required: true,
    },
    textColor: {
      type: String,
      required: true,
    },
    borderColor: {
      type: String,
      default: 'white',
    },
    label: {
      type: [String, Number],
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    opacity: {
      type: Number,
      required: true,
    },
    itemVariant: {
      type: String,
      required: true,
    },
    minColWidth: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      mouseenter: false,
    }
  },
  computed: {
    legendItemClass() {
      return `legend__item-${this.itemVariant}`
    },
  },
}
</script>
