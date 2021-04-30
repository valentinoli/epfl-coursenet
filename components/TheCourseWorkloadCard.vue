<template>
  <v-card v-if="data">
    <v-card-title>Workload</v-card-title>
    <v-list two-line>
      <template v-for="(val, key) in data">
        <v-list-item v-if="val" :key="key">
          <v-list-item-content>
            <v-list-item-title v-text="key" />
            <v-list-item-subtitle v-text="val" />
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
}
</script>
