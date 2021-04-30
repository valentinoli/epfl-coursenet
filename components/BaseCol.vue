<template>
  <v-col :cols="cols" :sm="sm" :md="md" :lg="lg" :xl="xl">
    <slot></slot>
  </v-col>
</template>

<script>
export default {
  props: {
    cols: {
      type: String,
      default: '12',
    },
    sm: {
      type: String,
      default: '6',
    },
    md: {
      type: String,
      default: '4',
    },
    lg: {
      type: String,
      default: '4',
    },
    xl: {
      type: String,
      default: '3',
    },
  },
}
</script>
