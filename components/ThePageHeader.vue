<template>
  <div :style="style">
    <h1 class="d-flex align-center">
      <span>
        {{ title }}
      </span>
      <img v-if="isSpecialization" :src="$specIconURL(value)" class="mx-3" />
    </h1>
    <template v-if="isProgram">
      <h2>
        <nuxt-link :to="{ params: { program: null }, query }">{{
          levelTitle
        }}</nuxt-link>
      </h2>
    </template>
    <template v-else-if="isSpecialization">
      <h2>
        <nuxt-link :to="{ params: { specialization: null }, query }">{{
          programTitle
        }}</nuxt-link>
      </h2>
      <h3>
        <nuxt-link
          :to="{
            params: { program: null, specialization: null },
            query,
          }"
        >
          {{ levelTitle }}
        </nuxt-link>
      </h3>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    entity: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    levelTitle: {
      type: String,
      default: '',
    },
    programTitle: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
  },
  computed: {
    isProgram() {
      return this.entity === 'program'
    },
    isSpecialization() {
      return this.entity === 'specialization'
    },
    style() {
      return this.$vuetify.breakpoint.xsOnly
        ? {
            fontSize: '0.7rem',
          }
        : {}
    },
    query() {
      return this.$route.query
    },
  },
}
</script>
