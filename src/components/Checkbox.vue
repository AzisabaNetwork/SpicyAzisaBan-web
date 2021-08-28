<template>
  <label>
    <input
        :id="id"
        class="filled-in"
        type="checkbox"
        :ref="ref"
        v-model="value"
        :class="[whiteText ? 'white-text' : '', value ? 'checked' : '']"
        :style="inputStyle"
    />
    <span :style="labelStyle">{{ label }}</span>
  </label>
</template>

<script lang="ts">
export default {
  data(props) {
    return {
      value: props.defaultValue
    }
  },
  props: {
    id: String,
    inputStyle: Object,
    labelStyle: Object,
    label: String,
    whiteText: Boolean,
    defaultValue: Boolean,
    ref: String,
  },
}
</script>
