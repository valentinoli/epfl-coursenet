import colors from 'vuetify/es5/util/colors'

const name = 'EPFL CourseNet'
const host = 'https://epfl-coursenet.herokuapp.com'

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate(title) {
      const { appName } = this.context.env
      return title ? `${title} | ${appName}` : appName
    },
    title: '',
    // `%s - ${appName}`,
    // title: appName,
    // meta: [
    // { charset: 'utf-8' },
    // { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    // { hid: 'description', name: 'description', content: '' },
    // ],
    // link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  router: {
    middleware: 'prev-entity-route',
  },

  loading: {
    color: '#F44336',
    failedColor: '#D50000',
    height: '4px',
    duration: 1000,
    continuous: true,
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/utils.js',
    '~/plugins/external-resources.js',
    { src: '~/plugins/graph.js', mode: 'client' },
    '~/plugins/vuex-persistedstate.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true, // { path: '~/components', ignore: ['**/TheRecentCoursesList.vue'] },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  eslint: {
    extensions: ['js', 'vue'],
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://github.com/nuxt-community/proxy-module
    '@nuxtjs/proxy',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    prefix: '/api/',
    proxy: true,
    headers: {
      post: {
        'Content-Type': 'application/json',
      },
    },
  },

  // https://github.com/nuxt-community/proxy-module
  proxy: {
    '/api/': { target: process.env.API_URL, pathRewrite: { '^/api/': '' } },
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    icon: {},
    meta: {
      name,
      theme_color: '#ffffff',
      ogHost: host,
    },
    manifest: {
      name,
      short_name: 'CourseNet',
    },
  },

  vue: {
    config: {
      productionTip: false,
    },
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      // dark: true,
      themes: {
        light: {
          primary: colors.red.base,
          // accent: colors.grey.darken3,
          // secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    appName: 'EPFL CourseNet',
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
}
