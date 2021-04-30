<template>
  <v-bottom-sheet
    v-model="sheet"
    hide-overlay
    scrollable
    :inset="$vuetify.breakpoint.smAndUp"
  >
    <!-- https://vuetifyjs.com/en/api/v-bottom-sheet/#props-scrollable -->
    <v-card class="py-6 px-8">
      <div class="d-flex justify-space-between mb-2">
        <div class="mt-1">
          <v-icon left>{{ icon }}</v-icon>
          <span>{{ label }}</span>
        </div>
        <base-icon-button color="inherit" @click="sheet = false">
          mdi-close
        </base-icon-button>
      </div>
      <v-card-text height="50vh">
        <slot />
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      sheet: this.value,
    }
  },
  watch: {
    value(v) {
      this.sheet = v
    },
    sheet(v) {
      // propagate to parent component
      this.$emit('update:value', v)
    },
  },
}
</script>
