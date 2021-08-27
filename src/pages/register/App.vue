<template>
  <Navbar :dismissible-login-modal="showForm" />
  <Preloader size="big" :active="spinnerActive" color="spinner-blue-only" />
  <Container v-if="showForm">
    <InputTextField id="username" ref="username" pattern="^[a-zA-Z0-9_-]{4,32}$" :min-length="4" :max-length="32" label="ユーザー名" :white-text="true" :disabled="disableForm" />
    <Button text="ユーザー名を変更" type="submit" color="green" :disabled="disableForm" @click="onSubmit" />
  </Container>
</template>

<script lang="ts">
import { ref } from "vue"
import Navbar from '@/components/Navbar.vue'
import Preloader from "@/components/Preloader.vue"
import InputTextField from "@/components/InputTextField.vue"
import Container from "@/components/Container.vue"
import Button from "@/components/Button.vue";

function toast(text: string) {
  // @ts-ignore
  M.toast({ unsafeHTML: text.replace('\n', '<br />') }) // eslint-disable-line no-undef
  console.log(`Notification: ${text}`)
}

function isValidName(name) {
  if (name.length < 4) return false
  if (name.length > 32) return false
  if (name.includes('SpicyAzisaBan')) return false
  return /^[a-zA-Z0-9_-]{4,32}$/.test(name)
}

const disableForm = ref(false)

export default {
  components: {
    Button,
    Container,
    Preloader,
    Navbar,
    InputTextField,
  },
  methods: {
    onSubmit() {
      if (disableForm.value) return
      const username = this.$refs.username.value
      if (!isValidName(username)) return toast('この名前は使用できません。')
      disableForm.value = true
      fetch(`${process.env.VUE_APP_API_URL}/i_users/changename`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: this.state,
          user_id: this.userId,
          username,
        }),
      }).then(res => res.json()).then(data => {
        const err = data['error']
        if (err) {
          if (err === 'invalid') {
            toast('このユーザー名は使用できません。')
          } else if (err === 'already_taken') {
            toast('このユーザー名はすでにほかの人に使用されています。')
          } else if (err === 'invalid_user') {
            toast('ユーザーが存在しません。')
          } else {
            toast(`不明なエラーが発生しました。 (${err})`)
          }
          return
        }
        toast('ユーザー名を変更しました。')
        setTimeout(() => location.href = '/', 3000)
      }).finally(() => disableForm.value = false)
    },
  },
  setup() {
    let state = new URLSearchParams(window.location.search).get("state")
    if (!state) state = location.pathname.replace(/^\/register\/(.*)$/, "$1")
    const spinnerActive = ref(!!state)
    const showForm = ref(false)
    const userId = ref(0)
    if (state) {
      fetch(`${process.env.VUE_APP_API_URL}/i_users/register/${state}`).then(res => res.json()).then(data => {
        const err = data['error']
        if (err) {
          spinnerActive.value = false
          if (err === 'forbidden') {
            toast('Invalid state')
          }
          setTimeout(() => {
            // @ts-expect-error
            M.Modal.getInstance(document.getElementById("login-modal")).open() // eslint-disable-line no-undef
          }, 200)
          return
        }
        userId.value = data['user_id']
        spinnerActive.value = false
        showForm.value = true
      })
    } else {
      setTimeout(() => {
        // @ts-expect-error
        M.Modal.getInstance(document.getElementById("login-modal")).open() // eslint-disable-line no-undef
      }, 200)
    }
    return {
      spinnerActive,
      showForm,
      userId,
      disableForm,
      state,
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
