<template>
  <div class="py-1">
    <template v-if="code">
      <div class="font-weight-bold">{{ code }}</div>
      <div class="mb-2">{{ name }}</div>
      <div>Credits: {{ credits }}</div>
      <div>Section: {{ section }}</div>
      <div>Semester: {{ semester }}</div>
    </template>
    <template v-else>
      <div class="font-weight-bold">{{ name }}</div>
      <div>SCIPER: {{ sciper }}</div>
    </template>
    <div class="mt-2">
      <template v-if="$store.getters.isDirectedGraph">
        <div>Node in-degree: {{ inDegree }}</div>
        <div>Node out-degree: {{ outDegree }}</div>
      </template>
      <template v-else>
        <div>Node degree: {{ degree }}</div>
      </template>
    </div>
    <div v-if="code" class="mt-2">
      <template v-if="touchInterface">
        <v-btn small @touchstart="$router.push(`/course/${slug}`)">
          <v-icon left>mdi-eye</v-icon>
          View course
        </v-btn>
      </template>
      <template v-else>
        <div class="font-italic">Double click to view</div>
      </template>
    </div>
  </div>
</template>

<script>
const stringProps = Object.fromEntries(
  ['slug', 'code', 'name', 'section', 'semester', 'sciper'].map((p) => [
    p,
    {
      type: String,
      default: '',
    },
  ])
)
const numberPropsRequired = Object.fromEntries(
  ['degree', 'inDegree', 'outDegree'].map((p) => [
    p,
    {
      type: Number,
      required: true,
    },
  ])
)
export default {
  inheritAttrs: false,
  props: {
    ...stringProps,
    ...numberPropsRequired,
    touchInterface: {
      type: Boolean,
      required: true,
    },
    credits: {
      type: Number,
      // lecturer does not have credits
      // so this prop can't be required
      default: 0,
    },
  },
}
</script>
