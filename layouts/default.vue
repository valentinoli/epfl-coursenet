<template>
  <v-app>
    <v-app-bar app color="white">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title
        v-if="!courseFinder"
        class="d-flex align-center pl-2 pl-sm-4"
      >
        <nuxt-link
          to="/"
          class="d-flex align-center"
          :style="{
            textDecoration: 'none',
            color: 'inherit',
          }"
        >
          <v-img
            alt="EPFL Logo"
            class="mr-2"
            contain
            :src="require('@/static/epfl-logo.svg')"
            width="60"
          />
          <span>CourseNet</span>
        </nuxt-link>
      </v-toolbar-title>
      <template v-if="$route.fullPath !== '/'">
        <v-spacer v-if="!courseFinder" />
        <base-icon-button
          v-if="xs"
          color="inherit"
          @click="courseFinder = !courseFinder"
        >
          mdi-magnify
        </base-icon-button>
        <the-course-finder
          v-if="!xs || courseFinder"
          :style="{ maxWidth: xs ? '100%' : '300px' }"
          prepend-icon=""
        />
      </template>
    </v-app-bar>
    <lazy-base-navigation-drawer :value.sync="drawer">
      <template #prepend>
        <div class="d-flex justify-space-between align-center">
          <base-icon-button to="/">mdi-home-outline</base-icon-button>
          <base-icon-button color="inherit" @click="closeDrawer">
            mdi-close
          </base-icon-button>
        </div>
      </template>
      <v-treeview
        :open="treeviewOpen"
        :items="navTreeviewItems"
        open-on-click
        hoverable
        shaped
        dense
        class="my-4"
      >
        <template #label="{ item: { name, value, params } }">
          <div class="d-flex align-center">
            <img v-if="value" :src="$specIconURL(value)" class="mr-2" />
            <!--
              @click.stop.native -> avoids opening node when link clicked
            -->
            <nuxt-link
              :to="{
                name: 'level-program-specialization',
                params,
                query: $route.query,
              }"
              class="nav-link"
              @click.stop.native="drawer = false"
            >
              {{ name }}
            </nuxt-link>
          </div>
        </template>
      </v-treeview>
      <the-recent-courses-list />
    </lazy-base-navigation-drawer>
    <v-main>
      <nuxt v-if="$route.name === 'level-program-specialization'" />
      <v-container v-else>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      drawer: false,
      treeviewOpen: [],
      courseFinder: false,
    }
  },
  head() {
    return {
      meta: [
        {
          hid: 'og:url',
          property: 'og:url',
          content: `${process.env.baseUrl}${this.$route.path}`,
        },
      ],
    }
  },
  computed: {
    ...mapState(['navTreeviewItems', 'touchInterface']),
    xs() {
      return this.$vuetify.breakpoint.xsOnly
    },
  },
  created() {
    // open root
    this.treeviewOpen = [this.navTreeviewItems[0].id]
  },
  mounted() {
    this.testTouchInterface()
  },
  methods: {
    ...mapMutations(['setPreviousEntityRoute', 'setTouchInterface']),
    closeDrawer() {
      this.drawer = false
    },
    testTouchInterface() {
      // Attempt to check for touch interface
      // See http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
      // We want to offer a friendly experience to touch device users
      // Caveats with the following approach:
      // 1. It requires interaction before you can know the result
      // 2. The event still won't fire for many browsers which don't support the
      //    Touch Events API...
      document.addEventListener(
        'touchstart',
        () => {
          this.setTouchInterface()
        },
        {
          once: true,
          capture: true,
          passive: true,
        }
      )
    },
  },
}
</script>

<style lang="sass">
html
  overflow-y: auto
  .overflow-y-hidden
    overflow-y: scroll !important

.v-treeview-node__label
  white-space: normal

a:not(.v-btn):not(.v-list-item)
  text-decoration: none
  &:hover
    text-decoration: underline

  &.nav-link.nuxt-link-exact-active
    font-weight: bold
</style>
