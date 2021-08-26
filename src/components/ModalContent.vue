<template>
  <div class="modal-content">
    <h4>{{ title }}</h4>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    title: String,
  }
}
</script>
