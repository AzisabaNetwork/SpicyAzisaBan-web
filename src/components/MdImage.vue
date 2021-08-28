<template>
  <img
      class="materialboxed"
      :src="src"
      :alt="alt || ''"
      :class="classes"
      :style="style"
  />
</template>

<script lang="ts">
export default {
  props: {
    src: String,
    alt: String,
    classes: String,
    style: Object,
  },
}
</script>
