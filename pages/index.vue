<template>
  <div class="d-flex flex-column align-center justify-center mt-16">
    <h1 class="text-center">
      Welcome to the<br v-if="$vuetify.breakpoint.xsOnly" />
      <img
        class="display-inline mx-2"
        :src="require('@/static/epfl-logo.svg')"
        style="height: 25px"
      />CourseNet
    </h1>
    <the-page-finder class="mt-8" />
    <the-course-finder class="mt-8" />
  </div>
</template>
