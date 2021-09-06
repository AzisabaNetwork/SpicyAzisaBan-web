<template>
  <div class="input-field col" :class="divClass || 's12'">
    <input
        :id="id"
        :type="type || 'text'"
        class="validate"
        :minlength=minLength
        :maxlength=maxLength
        :ref="ref"
        v-model="value"
        :pattern="pattern"
        :class="[whiteText ? 'white-text' : '', inputClass]"
        :style="inputStyle"
        :placeholder="placeholder"
        @change="update"
    />
    <label
        :for="id"
        :style="labelStyle"
        :class="activeLabel ? 'active' : null"
    >{{ label }}</label>
  </div>
</template>

<script>
export default {
  data(props) {
    return {
      value: props.defaultValue
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
    inputStyle: Object,
    labelStyle: Object,
    placeholder: String,
    defaultValue: String,
    activeLabel: Boolean,
    inputClass: String,
    divClass: String,
  },
  methods: {
    update(event) {
      this.value = event.target.value
    },
  },
}
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.white-text {
  color: #fff;
}
</style>
