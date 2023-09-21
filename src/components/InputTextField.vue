<template>
  <div class="input-field col" :class="divClass || 's12'">
    <input
        :id="id"
        :type="type || 'text'"
        :name="name"
        class="validate"
        :minlength=minLength
        :maxlength=maxLength
        :ref="refForRef || 'input'"
        v-model="value"
        :pattern="pattern"
        :class="[whiteText ? 'white-text' : '', inputClass]"
        :style="inputStyle"
        :placeholder="placeholder"
        :disabled="disabled"
        @change="update"
        @input="fireInputEvent"
    />
    <label
        :for="id"
        :style="labelStyle"
        :class="activeLabel ? 'active' : null"
        :ref="labelRef || 'label'"
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
    refForRef: String,
    pattern: String,
    whiteText: Boolean,
    inputStyle: Object,
    labelStyle: Object,
    placeholder: String,
    defaultValue: String,
    activeLabel: Boolean,
    inputClass: String,
    divClass: String,
    disabled: Boolean,
    labelRef: String,
    name: String,
    'v_model': String,
  },
  emits: ['input'],
  methods: {
    update(event) {
      this.value = event.target.value
    },
    fireInputEvent(event) {
      this.$emit('input', event)
    },
  },
  mounted() {
    if (this.defaultValue) {
      this.$refs[this.labelRef || 'label'].classList.add('active')
    }
  },
}
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.white-text {
  color: #fff;
}

input:not([type]):not(.browser-default):disabled+label,
input:not([type]):not(.browser-default)[readonly="readonly"]+label,
input[type=text]:not(.browser-default):disabled+label,
input[type=text]:not(.browser-default)[readonly="readonly"]+label,
input[type=password]:not(.browser-default):disabled+label,
input[type=password]:not(.browser-default)[readonly="readonly"]+label,
input[type=email]:not(.browser-default):disabled+label,
input[type=email]:not(.browser-default)[readonly="readonly"]+label,
input[type=url]:not(.browser-default):disabled+label,
input[type=url]:not(.browser-default)[readonly="readonly"]+label,
input[type=time]:not(.browser-default):disabled+label,
input[type=time]:not(.browser-default)[readonly="readonly"]+label,
input[type=date]:not(.browser-default):disabled+label,
input[type=date]:not(.browser-default)[readonly="readonly"]+label,
input[type=datetime]:not(.browser-default):disabled+label,
input[type=datetime]:not(.browser-default)[readonly="readonly"]+label,
input[type=datetime-local]:not(.browser-default):disabled+label,
input[type=datetime-local]:not(.browser-default)[readonly="readonly"]+label,
input[type=tel]:not(.browser-default):disabled+label,
input[type=tel]:not(.browser-default)[readonly="readonly"]+label,
input[type=number]:not(.browser-default):disabled+label,
input[type=number]:not(.browser-default)[readonly="readonly"]+label,
input[type=search]:not(.browser-default):disabled+label,
input[type=search]:not(.browser-default)[readonly="readonly"]+label,
textarea.materialize-textarea:disabled+label,
textarea.materialize-textarea[readonly="readonly"]+label {
  color: rgba(255, 255, 255, 0.2);
}
</style>
