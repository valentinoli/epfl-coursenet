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
    @change="onChange"
  >
    <template #selection>
      <!-- Prevent display of selected item -->
    </template>
  </v-autocomplete>
</template>

<script>
import debounce from 'debounce-async'

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
      cancel: null,
      updateSearchDebounced: debounce(async function (val) {
        if (this.cancel) {
          // cancel previous request
          this.cancel()
          this.cancel = null
        }

        if (val) {
          this.loading = true
          this.items = await this.$axios.$get(`/course/search?query=${val}`, {
            cancelToken: new this.$axios.CancelToken((c) => (this.cancel = c)),
          })
        } else {
          // no search string -> empty result set
          this.items = []
        }

        this.loading = false
      }, 500),
    }
  },
  watch: {
    search(val) {
      this.updateSearchDebounced(val).catch((e) => {})
    },
  },
  methods: {
    itemText({ code, name }) {
      // https://github.com/vuetifyjs/vuetify/issues/11585
      return `${code} ${name}`
    },
    onChange(slug) {
      this.$router.push(`/course/${slug}`)
      this.selected = null
    },
  },
}
</script>
