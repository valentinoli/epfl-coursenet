<template>
  <v-navigation-drawer
    v-model="drawer"
    v-bind="$attrs"
    app
    temporary
    :overlay-opacity="0.2"
    overlay-color="primary"
    :width="width"
    class="pa-5"
    @input="$emit('input', $event)"
  >
    <template #prepend>
      <div class="mb-6">
        <slot name="prepend"></slot>
      </div>
    </template>
    <slot></slot>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      drawer: this.value,
    }
  },
  computed: {
    width() {
      return this.$vuetify.breakpoint.xsOnly ? '100%' : '450px'
    },
  },
  watch: {
    value(v) {
      this.drawer = v
    },
    drawer(v) {
      // propagate to parent component
      this.$emit('update:value', v)
    },
  },
}
</script>
