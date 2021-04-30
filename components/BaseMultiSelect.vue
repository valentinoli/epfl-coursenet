<template>
  <v-select
    v-model="values"
    v-bind="$attrs"
    multiple
    outlined
    hide-details
    chips
    deletable-chips
    clearable
    class="my-6"
    menu-props="offsetY"
    @change="$emit('select-change', $event)"
  >
    <template #item="{ item, on, attrs }">
      <v-list-item v-bind="attrs" v-on="on">
        <template #default="{ active }">
          <v-list-item-action>
            <v-simple-checkbox :value="active" v-on="on"></v-simple-checkbox>
          </v-list-item-action>
          <v-list-item-icon v-if="item.value" class="mr-3">
            <v-img :src="$specIconURL(item.value)" />
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title || item }}</v-list-item-title>
          </v-list-item-content>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      values: this.value,
    }
  },
}
</script>
