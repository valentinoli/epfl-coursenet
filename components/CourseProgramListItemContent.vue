<template>
  <v-list-item-content>
    <v-list-item-title v-text="title" />
    <v-list-item-subtitle v-if="semesters" v-text="semesters" />
  </v-list-item-content>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    semesterNumbers: {
      type: Array,
      required: true,
    },
  },
  computed: {
    semesters() {
      const { semesterNumbers: num } = this
      if (!num.length) {
        return ''
      }

      const numsText = num.join(', ')

      let prependedText = 'Semester'

      if (num.length > 1) {
        prependedText += 's'
      }

      return `${prependedText} ${numsText}`
    },
  },
}
</script>
