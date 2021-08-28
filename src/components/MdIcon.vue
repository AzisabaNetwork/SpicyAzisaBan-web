<template>
  <i class="material-icons unselectable" :class="classes" :style="style">{{ icon }}</i>
</template>

<script lang="ts">
export default {
  props: {
    classes: String,
    style: Object,
    icon: String,
  },
}
</script>

<style scoped>
.unselectable {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
