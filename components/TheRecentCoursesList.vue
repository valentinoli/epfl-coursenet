<template>
  <div v-if="recentCourses.length">
    <v-divider></v-divider>
    <v-subheader>Recently viewed courses</v-subheader>
    <v-list dense shaped subheader>
      <v-list-item
        v-for="{ slug, code, name } in recentCourses"
        :key="slug"
        nuxt
        :to="`/course/${slug}`"
      >
        <v-list-item-content>
          <v-list-item-title v-text="name" />
          <v-list-item-subtitle v-text="code" />
        </v-list-item-content>
        <v-list-item-action>
          <base-icon-button
            small-icon
            @click.prevent.stop="$store.commit('courses/remove', slug)"
          >
            mdi-close
          </base-icon-button>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: mapState({ recentCourses: (state) => state.courses.courses }),
}
</script>
