<template>
  <span :class="bool ? 'light-green-text' : 'red-text'">{{ String(bool) }}</span>
</template>

<script lang="ts">
export default {
  props: {
    bool: Boolean,
  },
}
</script>
