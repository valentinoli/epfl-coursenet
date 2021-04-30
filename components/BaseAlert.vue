<template>
  <v-alert :elevation="elevation" :type="type">
    <slot></slot>
  </v-alert>
</template>

<script>
export default {
  props: {
    elevation: {
      type: Number,
      default: 2,
    },
    type: {
      type: String,
      default: 'info',
    },
  },
}
</script>
