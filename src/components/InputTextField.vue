<template>
  <div class="input-field col s12">
    <input :id="id" :type="type" class="validate" :minlength=minLength :maxlength=maxLength :ref="ref" v-model="value" />
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
  }
}
</script>
