<template>
  <div class="pb-5">
    <v-treeview
      v-if="showTreeview"
      v-model="treeviewSelected"
      :items="filters.treeviewItems"
      :open.sync="treeviewOpen"
      open-on-click
      return-object
      selectable
      hoverable
      shaped
      dense
      selected-color="primary"
      class="my-4"
    >
      <template #label="{ item: { name, value } }">
        <div class="d-flex align-center">
          <img v-if="value" :src="$specIconURL(value)" class="mr-2" />
          <span>{{ name }}</span>
        </div>
      </template>
    </v-treeview>
    <base-multi-select
      v-for="{ items, storeKey, label } in selects"
      :key="storeKey"
      :value="filters.multiselect[storeKey]"
      :items="items"
      :label="label"
      @select-change="onChangeMultiselect(storeKey, $event)"
    />

    <v-autocomplete
      v-model="courseCherries"
      :items="coursesSorted"
      :item-text="({ code, name }) => `${code} ${name}`"
      append-icon="mdi-magnify"
      label=""
      placeholder="Select courses..."
      return-object
      multiple
      hide-no-data
      hide-details
      clearable
      outlined
    >
      <template #selection="{ item, parent }">
        <v-tooltip top color="primary">
          <template #activator="{ on, attrs }">
            <v-chip
              v-bind="attrs"
              close
              outlined
              color="primary"
              v-on="on"
              @click:close="parent.selectItem(item, false)"
            >
              {{ item.code }}
            </v-chip>
          </template>
          <span>{{ item.name }}</span>
        </v-tooltip>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

const arrayProps = Object.fromEntries(
  ['credits', 'semester', 'section', 'language', 'examForm', 'courses'].map(
    (p) => [
      p,
      {
        type: Array,
        required: true,
      },
    ]
  )
)

export default {
  props: {
    ...arrayProps,
  },
  data() {
    return {
      newTreeviewItems: false,
      treeviewOpen: [],
    }
  },
  computed: {
    ...mapState(['filters']),
    showTreeview() {
      // show only if root has children
      return this.filters.treeviewItems[0].children.length
    },
    treeviewSelected: {
      get() {
        return this.filters.treeviewSelectedLeaves
      },
      set(value) {
        if (!this.newTreeviewItems) {
          this.change({
            key: 'treeviewSelectedLeaves',
            value,
          })
        } else {
          // to avoid a bug we do not mutate
          // the state if the treeview items were updated
          this.newTreeviewItems = false
        }
      },
    },
    selects() {
      // computed value since props can be updated
      return [
        {
          items: this.credits,
          storeKey: 'credits',
          label: 'Credits',
        },
        {
          items: this.semester,
          storeKey: 'semester',
          label: 'Semester',
        },
        {
          items: this.section,
          storeKey: 'section',
          label: 'Section',
        },
        {
          items: this.language,
          storeKey: 'language',
          label: 'Language',
        },
        {
          items: this.examForm,
          storeKey: 'examForm',
          label: 'Exam form',
        },
      ]
    },
    coursesSorted() {
      return JSON.parse(JSON.stringify(this.courses)).sort((a, b) =>
        a.code > b.code ? 1 : -1
      )
    },
    courseCherries: {
      get() {
        return this.filters.courseCherriesAll
      },
      set(cherries) {
        this.changeCourseCherries({ cherries, courses: this.courses })
      },
    },
  },
  watch: {
    coursesSorted(courses) {
      // Filters changed, need to update cherries
      this.changeCourseCherries({ cherries: this.courseCherries, courses })
    },
    'filters.treeviewItems'() {
      this.newTreeviewItems = true
    },
  },
  methods: {
    ...mapMutations({
      change: 'filters/change',
      changeMultiselect: 'filters/changeMultiselect',
      changeCourseCherries: 'filters/changeCourseCherries',
    }),
    onChangeMultiselect(key, value) {
      this.changeMultiselect({ key, value })
    },
  },
}
</script>

<style lang="sass">
.v-autocomplete.v-select--is-menu-active .v-input__icon--append .v-icon.mdi-magnify
  // Override style to avoid rotation of icon
  // https://stackoverflow.com/a/61805903/8238129
  transform: none
</style>
