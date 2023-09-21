<template>
  <p>
    <label>
      <input
          type="radio"
          :name="name"
          :class="color"
          :disabled="disabled"
          style="margin: 2px;"
          :checked="checked"
          :ref="refForRef"
          :value="value"
      />
      <span>{{ text }}</span>
    </label>
  </p>
</template>

<script>
export default {
  data() {
    return {
      checked: this.defaultChecked || false
    }
  },
  props: {
    name: String,
    color: String,
    text: String,
    disabled: Boolean,
    refForRef: String,
    defaultChecked: Boolean,
    value: String,
  },
}
</script>
