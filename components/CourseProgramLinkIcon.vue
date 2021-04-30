<template>
  <base-icon-button
    :to="`/${levelSlug}/${programSlug}`"
    class="v-btn--program-link"
  >
    mdi-school
  </base-icon-button>
</template>

<script>
export default {
  props: {
    levelSlug: {
      type: String,
      required: true,
    },
    programSlug: {
      type: String,
      required: true,
    },
  },
}
</script>

<style lang="sass">
.v-list-group--active > .v-list-group__header > .v-list-group__header__append-icon
  .v-btn.v-btn--program-link .v-icon
    transform: none
</style>
