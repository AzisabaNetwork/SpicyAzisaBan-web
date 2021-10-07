<template>
  <li class="row">
    <div class="col" :class="`s${ks || 5}`">
      <span class="flow-text" :class="kc" style="text-align: center">
        {{ k }}
        <slot name="key" />
      </span>
    </div>
    <div class="col" :class="`s${vs || 7}`" :style="vstyle">
      <span class="flow-text" :class="vc">
        {{ v }}
        <slot />
      </span>
    </div>
  </li>
</template>

<script lang="ts">
export default {
  props: {
    ks: Number,
    vs: Number,
    k: String,
    v: String,
    kc: String,
    vc: String,
    vstyle: String,
  },
}
</script>

<style scoped>
.col {
  border: 1px solid #fff;
}

.row {
  margin-bottom: 0;
}
</style>
