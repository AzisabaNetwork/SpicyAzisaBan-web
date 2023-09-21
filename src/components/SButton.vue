<template>
  <button class="btn waves-effect" :class="color" :disabled="disabled" style="margin: 2px;">{{ text }}</button>
</template>

<script>
export default {
  props: {
    color: String,
    text: String,
    disabled: Boolean,
  },
}
</script>
