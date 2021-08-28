<template>
  <li class="row">
    <div class="col" :class="`s${ks || 5}`">
      <span class="flow-text">
        {{ k }}
      </span>
    </div>
    <div class="col" :class="`s${vs || 7}`">
      <span class="flow-text">
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
