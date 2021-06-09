<template>
  <div class="pa-4">
    <h1>{{ name }}</h1>
    <h2>{{ code }}</h2>

    <v-row class="mt-4">
      <base-col>
        <the-course-basic-info-card :data="basicInfo" />
      </base-col>
      <base-col>
        <base-alert v-if="remark">
          {{ remark }}
        </base-alert>
        <base-alert v-if="numberOfPlaces">
          {{ `Number of places: ${numberOfPlaces}` }}
        </base-alert>
        <the-course-lecturers-card
          v-if="lecturers.length"
          :data="lecturers"
          class="mb-4"
        />
        <the-course-workload-card v-if="workloadInfo" :data="workloadInfo" />
      </base-col>
      <base-col v-if="requiredCourses.length || dependentCourses.length">
        <course-dependency-card
          v-if="requiredCourses.length"
          card-title="Required courses"
          :courses="requiredCourses"
          class="mb-4"
        />
        <course-dependency-card
          v-if="dependentCourses.length"
          card-title="Dependent courses"
          :courses="dependentCourses"
        />
      </base-col>
      <base-col sm="12" md="6" lg="6" xl="4">
        <the-course-programs-card v-if="levels.length" :data="levels" />
      </base-col>
    </v-row>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios, params }) {
    const data = await $axios.$get(`/course/${params.id}`)
    return { ...data }
  },
  head() {
    const title = `${this.code} ${this.name}`
    return {
      title,
      meta: [
        {
          hid: 'og:title',
          property: 'og:title',
          content: `${title} | ${this.$appName}`,
        },
      ],
    }
  },
  computed: {
    basicInfo() {
      return {
        Credits: this.credits,
        Semester: this.semester,
        Language: this.language,
        'Exam Form': this.examForm,
        Section: this.section,
      }
    },
    workloadInfo() {
      const info = {
        Lectures: this.lecture,
        Exercises: this.exercises,
        Projects: this.project,
        'Practical work': this.practicalWork,
        Labs: this.labs,
      }

      if (Object.values(info).some((v) => v)) {
        return info
      }

      return null
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.$store.commit('courses/push', this)
      },
    },
  },
}
</script>
