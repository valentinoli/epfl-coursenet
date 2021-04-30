<template>
  <v-autocomplete
    :items="$store.state.navAutocompleteItems"
    item-value="path"
    item-text="title"
    :search-input.sync="search"
    label="Search study programs"
    placeholder="Start typing..."
    prepend-icon="mdi-magnify"
    append-outer-icon="mdi-school"
    @change="$router.push($event)"
  >
    <template #selection>
      <!-- Prevent display of selected item -->
    </template>
    <template #no-data>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>
            No results <v-icon>mdi-emoticon-sad-outline</v-icon>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <template #item="{ item }">
      <v-list-item-content>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
        <v-list-item-subtitle v-if="item.subtitle">{{
          item.subtitle
        }}</v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-icon>
        <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
        <v-img
          v-else-if="item.specializationValue"
          :src="$specIconURL(item.specializationValue)"
        />
      </v-list-item-icon>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  data() {
    return {
      search: '',
    }
  },
}
</script>
