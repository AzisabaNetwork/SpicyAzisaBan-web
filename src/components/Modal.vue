<template>
  <div :id="id" class="modal">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    id: String,
    dismissible: Boolean,
  },
  setup(props) {
    setTimeout(() => {
      // eslint-disable-next-line no-undef
      M.Modal.init(document.getElementById(props.id), { dismissible: props.dismissible })
    }, 150)
  },
}
</script>
