<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      <span>{{ cardTitle }}</span>
      <v-icon>mdi-book-open-variant</v-icon>
    </v-card-title>
    <v-list>
      <v-list-item
        v-for="{ slug, code, name } in courses"
        :key="slug"
        dense
        nuxt
        :to="`/course/${slug}`"
      >
        <v-list-item-content>
          <v-list-item-title v-text="name" />
          <v-list-item-subtitle v-text="code" />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
export default {
  props: {
    cardTitle: {
      type: String,
      required: true,
    },
    courses: {
      type: Array,
      required: true,
    },
  },
}
</script>
