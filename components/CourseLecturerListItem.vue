<template>
  <v-list-item
    :href="$peopleURL(sciper)"
    target="_blank"
    rel="noreferrer noopener"
  >
    <v-list-item-avatar color="primary">
      <v-icon v-if="imgFallback" dark>mdi-account-circle</v-icon>
      <v-img
        v-else
        :src="$peopleImgURL(sciper)"
        :alt="name"
        @error="imgFallback = true"
      />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title v-text="name"></v-list-item-title>
    </v-list-item-content>
    <v-list-item-icon>
      <v-icon small>mdi-open-in-new</v-icon>
    </v-list-item-icon>
  </v-list-item>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    sciper: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      imgFallback: false,
    }
  },
}
</script>
