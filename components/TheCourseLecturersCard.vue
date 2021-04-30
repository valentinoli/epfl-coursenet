<template>
  <v-card>
    <v-card-title>Lecturers</v-card-title>
    <v-list shaped>
      <template v-if="!data[0].sciper">
        <v-list-item>
          <v-list-item-title v-text="data[0].name" />
        </v-list-item>
      </template>
      <template v-else>
        <course-lecturer-list-item
          v-for="l in data"
          :key="l.sciper"
          v-bind="l"
        />
      </template>
    </v-list>
  </v-card>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      required: true,
    },
  },
}
</script>
