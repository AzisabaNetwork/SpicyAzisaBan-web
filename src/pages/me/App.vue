<template>
  <Navbar :dismissible-login-modal="true" ref="navbar" />
  <Preloader size="big" :active="!me" color="spinner-blue-only" />
  <Container v-if="me">
    <div class="row">
      <div class="col s12">
        <Card>
          <h2>ユーザー名変更</h2>
          <InputTextField
              label="ユーザー名"
              :min-length="4"
              :max-length="32"
              :default-value="me.username"
              id="me_username"
              white-text
              active-label
              ref="me_username"
              pattern="^[a-zA-Z0-9_-]{4,32}$"
              :disabled="disableForm"
          />
          <Button text="変更" :disabled="disableForm" @click="changeName()" />
        </Card>
        <Card>
          <h2>パスワード変更</h2>
          <InputTextField
              label="現在のパスワード"
              :min-length="7"
              id="me_current_password"
              white-text
              ref="me_current_password"
              type="password"
              :disabled="disableForm"
          />
          <InputTextField
              label="新しいパスワード"
              :min-length="7"
              id="me_new_password"
              white-text
              ref="me_new_password"
              type="password"
              :disabled="disableForm"
          />
          <InputTextField
              label="新しいパスワード (確認)"
              :min-length="7"
              id="me_new_password_confirm"
              white-text
              ref="me_new_password_confirm"
              type="password"
              :disabled="disableForm"
          />
          <div class="col s12">
            <Button text="変更" :disabled="disableForm" @click="changePassword()" />
          </div>
        </Card>
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
import Card from '@/components/Card.vue'

const me = ref(null)

export default {
  components: {
    Card,
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
      toast('パスワードを変更中...')
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
    changePassword() {
      if (this.disableForm) return
      const currentPassword = this.$refs.me_current_password.value
      const newPassword = this.$refs.me_new_password.value
      if (currentPassword < 7) return
      if (newPassword !== this.$refs.me_new_password_confirm.value) {
        return toast('パスワード (確認)が一致しません。')
      }
      if (newPassword.length < 7) {
        return toast('パスワードは7文字以上にする必要があります。')
      }
      this.disableForm = true
      fetch(`${process.env.VUE_APP_API_URL}/i_users/changepassword`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
        },
        body: JSON.stringify({
          user_id: this.$refs.navbar.user.id,
          currentPassword,
          newPassword,
        }),
      }).then(res => res.json()).then(res => {
        const err = res.error
        if (err) {
          if (err === 'incorrect_password') {
            toast('パスワードが間違っています。')
          } else {
            toast(`不明なエラーが発生しました。 (${err})`)
          }
          return
        }
        toast('パスワードを変更しました。')
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
