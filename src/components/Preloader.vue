<template>
  <div class="preloader-wrapper active" :class="size" v-show="active">
    <div class="spinner-layer" :class="color">
      <div class="circle-clipper left">
        <div class="circle"></div>
      </div><div class="gap-patch">
      <div class="circle"></div>
    </div><div class="circle-clipper right">
      <div class="circle"></div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    size: String,
    color: String,
    active: Boolean,
  }
}
</script>
