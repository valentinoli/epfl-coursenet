<template>
  <base-navigation-drawer :value.sync="drawer" right @input="toggleDrawer">
    <template #prepend>
      <div class="d-flex justify-between align-center">
        <v-tabs v-model="tab" @change="setTab">
          <v-tab>
            <v-icon left>{{ icon }}</v-icon>
            {{ label }}
          </v-tab>
        </v-tabs>
        <base-icon-button color="inherit" @click="drawer = false">
          mdi-close
        </base-icon-button>
      </div>
    </template>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <the-network-filters v-bind="$attrs" />
      </v-tab-item>
    </v-tabs-items>
  </base-navigation-drawer>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  inheritAttrs: false,
  props: {
    icon: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      drawer: false,
      tab: 0,
    }
  },
  computed: {
    ...mapState({
      drawerState: (state) => state.networkDrawer,
      tabState: (state) => state.networkDrawerActiveTab,
    }),
  },
  watch: {
    drawerState(drawer) {
      this.drawer = drawer
    },
    tabState(tab) {
      this.tab = tab
    },
  },
  methods: {
    ...mapMutations({
      toggleDrawer: 'toggleNetworkDrawer',
      setTab: 'setNetworkDrawerActiveTab',
    }),
  },
}
</script>
