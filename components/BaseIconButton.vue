<template>
  <v-btn icon :color="color" v-bind="$attrs" @click="$emit('click', $event)">
    <v-icon :small="smallIcon">
      <slot>checkbox-blank-outline</slot>
    </v-icon>
  </v-btn>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: 'primary',
    },
    smallIcon: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
