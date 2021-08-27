<template>
  <div class="input-field col s12">
    <input
        :id="id"
        :type="type || 'text'"
        class="validate"
        :minlength=minLength
        :maxlength=maxLength
        :ref="ref"
        v-model="value"
        :pattern="pattern"
        :class="[whiteText ? 'white-text' : '']"
    />
    <label :for="id">{{ label }}</label>
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: "",
    }
  },
  props: {
    type: String,
    id: String,
    label: String,
    maxLength: Number,
    minLength: Number,
    ref: String,
    pattern: String,
    whiteText: Boolean,
  }
}
</script>

<style scoped>
.white-text {
  color: #fff;
}
</style>
