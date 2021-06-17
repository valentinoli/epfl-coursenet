<template>
  <div class="d-flex align-center" style="font-size: 0.9em">
    <v-icon small class="mr-1">mdi-copyright</v-icon>
    <span>{{ new Date().getFullYear() }} Valentin Loftsson —&nbsp;</span>
    <v-btn
      href="mailto:valentin.loftsson@epfl.ch"
      target="_blank"
      rel="noreferrer noopener"
      text
      icon
      color="black"
    >
      <v-icon>mdi-at</v-icon>
    </v-btn>
    <v-btn
      href="https://github.com/valentinoli/epfl-coursenet"
      target="_blank"
      rel="noreferrer noopener"
      text
      icon
      color="black"
    >
      <v-icon>mdi-github</v-icon>
    </v-btn>
  </div>
</template>
