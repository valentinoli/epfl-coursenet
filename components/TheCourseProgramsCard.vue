<template>
  <v-card>
    <v-card-title>Study programs</v-card-title>
    <v-list shaped>
      <v-list-group v-for="level in data" :key="level.slug" no-action>
        <template #activator>
          <v-list-item-content>
            <v-list-item-title v-text="level.title" />
          </v-list-item-content>
        </template>
        <template #prependIcon>
          <base-icon-button :to="`/${level.slug}`">
            mdi-school-outline
          </base-icon-button>
        </template>

        <template v-for="p in level.programs">
          <v-list-group
            v-if="p.specializations && p.specializations.length"
            :key="p.slug"
            no-action
            sub-group
            append-icon="menu-down"
          >
            <template #activator>
              <course-program-list-item-content v-bind="p" />
            </template>
            <template #appendIcon>
              <course-program-link-icon
                :level-slug="level.slug"
                :program-slug="p.slug"
              />
            </template>
            <v-list-item
              v-for="s in p.specializations"
              :key="s.slug"
              dense
              nuxt
              :to="`/${level.slug}/${p.slug}/${s.slug}`"
            >
              <v-list-item-avatar :size="18">
                <v-img :src="$specIconURL(s.value)" />
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title v-text="s.title" />
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item
            v-else
            :key="p.slug"
            nuxt
            :to="`/${level.slug}/${p.slug}`"
          >
            <course-program-list-item-content v-bind="p" />
            <v-list-item-action>
              <base-icon-button>mdi-school</base-icon-button>
            </v-list-item-action>
          </v-list-item>
        </template>
      </v-list-group>
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
