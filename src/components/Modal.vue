<template>
  <div :id="id" class="modal">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    id: String,
  }
}
</script>
