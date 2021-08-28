<template>
  <a :href="href" rel="noopener" :target="openNewTab ? '_blank' : null" :class="color">
    <slot />
  </a>
</template>

<script lang="ts">
export default {
  props: {
    href: String,
    openNewTab: Boolean,
    color: String,
  }
}
</script>

<style scoped>
a.teal-but-green {
  color: #26c385;
}
</style>
