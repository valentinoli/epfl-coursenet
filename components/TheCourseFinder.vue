<template>
  <v-autocomplete
    v-model="selected"
    v-bind="$attrs"
    :items="items"
    item-value="slug"
    :item-text="itemText"
    :loading="loading"
    :search-input.sync="search"
    label="Search courses"
    placeholder="Type any keyword..."
    hide-no-data
    hide-details
    no-filter
    :prepend-icon="prependIcon"
    :append-outer-icon="appendOuterIcon"
    @update:search-input="updateSearch"
    @change="$router.push(`/course/${$event}`)"
  >
    <template #selection>
      <!-- Prevent display of selected item -->
    </template>
  </v-autocomplete>
</template>

<script>
import debounce from 'lodash.debounce'

export default {
  props: {
    appendOuterIcon: {
      type: String,
      default: 'mdi-book-open-variant',
    },
    prependIcon: {
      type: String,
      default: 'mdi-magnify',
    },
  },
  data() {
    return {
      selected: null,
      items: [],
      search: null,
      loading: false,
    }
  },
  methods: {
    updateSearch: debounce(async function (val) {
      if (val) {
        this.loading = true
        this.items = await this.$axios.$get(`/course/search?query=${val}`)
        this.loading = false
      }
    }, 500),
    itemText({ code, name }) {
      // https://github.com/vuetifyjs/vuetify/issues/11585
      return `${code} ${name}`
    },
  },
}
</script>
