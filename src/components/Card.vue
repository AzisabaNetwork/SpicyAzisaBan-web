<template>
  <section class="not-flexing-card z-depth-5" style="align-items: center;">
    <slot />
  </section>
</template>

<style>
.not-flexing-card>div.col {
  float: inherit;
}
</style>

<style scoped>
.not-flexing-card {
  word-wrap: break-word;
  position: relative;
  flex-direction: column;
  background-color: #22282a;
  background-clip: border-box;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: .25rem;
  margin: .5rem .5rem 1rem .5rem;
  padding: 2rem;
}
</style>
