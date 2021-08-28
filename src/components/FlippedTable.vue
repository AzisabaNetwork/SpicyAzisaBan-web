<template>
  <ul :style="style">
    <slot />
  </ul>
</template>

<script lang="ts">
export default {
  props: {
    style: Object,
  },
}
</script>
