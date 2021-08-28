<template>
  <i class="material-icons" :class="classes" :style="style">{{ icon }}</i>
</template>

<script lang="ts">
export default {
  props: {
    classes: String,
    style: String,
    icon: String,
  },
}
</script>
