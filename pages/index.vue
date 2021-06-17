<template>
  <div class="d-flex flex-column align-center justify-center mt-6 mt-sm-16">
    <h1 class="text-center">
      Welcome to the<br v-if="$vuetify.breakpoint.xsOnly" />
      <img
        class="display-inline mx-2"
        :src="require('@/static/epfl-logo.svg')"
        style="height: 25px"
      />CourseNet
    </h1>
    <div style="max-width: 300px">
      <the-page-finder class="mt-8" width="inherit" />
      <the-course-finder class="mt-8" width="inherit" />
    </div>
    <v-footer
      app
      class="d-flex justify-center align-center font-weight-light px-1"
      color="white"
      elevation="5"
    >
      <the-copyright-contact-info />
    </v-footer>
  </div>
</template>
