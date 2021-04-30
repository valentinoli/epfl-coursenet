<template>
  <v-container class="pt-8">
    <slot name="header"></slot>
    <v-data-table
      :headers="headers"
      :items="items"
      :search="search"
      item-key="slug"
      sort-by="name"
      multi-sort
      :single-expand="xs"
      :custom-filter="filter"
      class="mt-8"
    >
      <template #top>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          class="mb-6"
          single-line
          hide-details
          outlined
          dense
          clearable
          style="max-width: 400px"
        ></v-text-field>
      </template>
      <template v-if="xs" #item="{ item, expand, isExpanded }">
        <tr @click="expand(!isExpanded)">
          <td class="py-2">
            <nuxt-link :to="`/course/${item.slug}`">
              {{ item.name }}
            </nuxt-link>
            <div>{{ item.code }}</div>
          </td>
          <td>
            <v-btn icon class="v-data-table__expand-icon">
              <v-icon>{{
                isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'
              }}</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
      <template v-if="xs" #expanded-item="{ item }">
        <tr class="v-data-table__expanded__content">
          <td>
            <dl>
              <div
                v-for="{ value, text } in headers.slice(3)"
                :key="value"
                class="py-3"
              >
                <dt class="font-weight-bold">{{ text }}</dt>
                <dd>{{ item[value] }}</dd>
              </div>
            </dl>
          </td>
          <td style="vertical-align: top" class="py-3">
            <data-table-item-network-link :item="item" />
          </td>
        </tr>
      </template>
      <template #header.networkLink>
        <v-icon class="network-link-header">mdi-graph-outline</v-icon>
      </template>
      <template #item.networkLink="{ item }">
        <data-table-item-network-link :item="item" />
      </template>
      <template #item.name="{ item: i }">
        <nuxt-link :to="`/course/${i.slug}`">{{ i.name }}</nuxt-link>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  props: {
    courses: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    const courseFields = [
      'name',
      'code',
      'credits',
      'semester',
      'section',
      'language',
      'examForm',
    ].map((h) => ({
      value: h,
      text: this.$camelCaseTransform(h),
      cellClass: h === 'code' ? 'text-nowrap' : '',
    }))

    const headers = [
      {
        value: 'networkLink',
        text: '',
        sortable: false,
      },
      ...courseFields,
    ]
    return {
      headers,
      search: '',
    }
  },
  computed: {
    xs() {
      return this.$vuetify.breakpoint.xsOnly
    },
    searchTerms() {
      return this.getSearchString(this.search).split(/\s+/)
    },
    items() {
      return this.courses.map((i) => ({
        ...i,
        searchString: this.getSearchString(`${i.name} ${i.code}`),
      }))
    },
  },
  methods: {
    getSearchString(...str) {
      // Remove punctuation, accents and diacritics,
      // replace multiple spaces with a single space, and lowercase
      // https://stackoverflow.com/a/37511463/8238129
      return str
        .join(' ')
        .replace(/[_.!?:,’‘'~-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036F]/g, '')
        .toLowerCase()
    },
    filter(value, search, item) {
      // The item is a match if every user term is in the item search string
      return this.searchTerms.every((term) => item.searchString.includes(term))
    },
  },
}
</script>

<style lang="sass">
.v-data-table
  th,
  td.text-nowrap
    white-space: nowrap
</style>
