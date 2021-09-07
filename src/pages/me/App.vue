<template>
  <Navbar :dismissible-login-modal="true" ref="navbar" />
  <Preloader size="big" :active="!me" color="spinner-blue-only" />
  <Container v-if="me">
    <div class="row">
      <div class="col s12">
        <div class="not-flexing-card z-depth-5" style="align-items: center;">
          <InputTextField
              label="ユーザー名"
              :min-length="4"
              :max-length="32"
              :default-value="me.username"
              id="me_username"
              div-class="s11"
              white-text
              active-label
              ref="me_username"
              pattern="^[a-zA-Z0-9_-]{4,32}$"
              :disabled="disableForm"
          />
          <Button text="変更" :disabled="disableForm" @click="changeName()" />
        </div>
      </div>
    </div>
  </Container>
</template>

<script lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Container from '@/components/Container.vue'
import Preloader from '@/components/Preloader.vue'
import InputTextField from '@/components/InputTextField.vue'
import Button from '@/components/Button.vue'
import {isValidName, toast} from '@/util/util'

const me = ref(null)

export default {
  components: {
    Button,
    Preloader,
    Container,
    Navbar,
    InputTextField,
  },
  data() {
    return {
      disableForm: false,
    }
  },
  methods: {
    changeName() {
      if (this.disableForm) return
      const username = this.$refs.me_username.value
      if (!isValidName(username)) {
        return toast('このユーザー名は使用できません。')
      }
      this.disableForm = true
      fetch(`${process.env.VUE_APP_API_URL}/i_users/changename`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
        },
        body: JSON.stringify({
          user_id: this.$refs.navbar.user.id,
          username,
        }),
      }).then(res => res.json()).then(res => {
        const err = res.error
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
        setTimeout(() => {
          this.$refs.navbar.username = username
        }, 100)
      }).finally(() => {
        this.disableForm = false
      })
    },
  },
  setup() {
    fetch(`${process.env.VUE_APP_API_URL}/i_users/me`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
      },
    }).then(res => res.json()).then(res => {
      if (res['error']) {
        return
      }
      me.value = res
      console.log(res)
    })
    return {
      me,
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
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
