<template>
  <Navbar :dismissible-login-modal="true" ref="navbar" />
  <Preloader size="big" :active="!me" color="spinner-blue-only" />
  <Container v-show="Object.keys(me).length > 0">
    <div class="row">
      <div class="col s12">
        <Card>
          <h2>ユーザー名</h2>
          <InputTextField
              label="ユーザー名"
              :min-length="4"
              :max-length="32"
              :default-value="me.username"
              id="admin_username"
              white-text
              active-label
              ref="admin_username"
              pattern="^[a-zA-Z0-9_-]{4,32}$"
              :disabled="disableForm"
          />
        </Card>
        <Card>
          <h2>メールアドレス</h2>
          <InputTextField
              label="メールアドレス"
              :default-value="me.email"
              id="admin_email"
              white-text
              active-label
              ref="admin_email"
              :min-length="1"
              :disabled="disableForm"
          />
        </Card>
        <Card>
          <h2>パスワード</h2>
          <InputTextField
              label="新しいパスワード"
              :min-length="7"
              id="admin_new_password"
              white-text
              ref="admin_new_password"
              type="password"
              :disabled="disableForm"
          />
        </Card>
        <Card>
          <h2>グループ</h2>
          <RadioButton ref="admin_group_user" name="group" text="ユーザー" value="user" />
          <RadioButton ref="admin_group_manager" name="group" text="処罰管理者" value="manager" />
          <RadioButton ref="admin_group_admin" name="group" text="管理者" value="admin" />
        </Card>
        <Button text="保存" color="submit-button green" :disabled="disableForm" @click="updateUser" />
      </div>
    </div>
  </Container>
</template>

<script lang="ts">
import Navbar from '@/components/Navbar.vue'
import Container from '@/components/Container.vue'
import Preloader from '@/components/Preloader.vue'
import InputTextField from '@/components/InputTextField.vue'
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import RadioButton from '@/components/RadioButton.vue'
import { api, toast } from '@/util/util'

export default {
  components: {
    RadioButton,
    Card,
    Button,
    Preloader,
    Container,
    Navbar,
    InputTextField,
  },
  data() {
    return {
      disableForm: true,
      me: {},
    }
  },
  emits: ['updatedUser'],
  methods: {
    onUserUpdated(user) {
      if (!user) return location.href = '/?error=not_logged_in'
      console.log(user)
      this.me = user
      this.$refs.admin_username.value = user.username
      this.$refs.admin_email.value = user.email
      this.disableForm = false
      if (user.group === 'manager') {
        this.$refs.admin_group_manager.checked = true
      } else if (user.group === 'admin') {
        this.$refs.admin_group_admin.checked = true
      } else {
        this.$refs.admin_group_user.checked = true
      }
    },
    updateUser() {
      this.disableForm = true
      const groupElement = (document.querySelector('input[type=radio]:checked') as HTMLInputElement)
      fetch(api(`/i_users/update`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
        },
        body: JSON.stringify({
          id: this.me.id,
          username: this.$refs.admin_username.value,
          email: this.$refs.admin_email.value,
          password: this.$refs.admin_new_password.value,
          group: groupElement ? groupElement.value : null,
        }),
      }).then(res => res.json()).then(res => {
        const err = res['error']
        if (err) {
          if (err === 'not_found') {
            toast('ユーザーが存在しません。')
          } else {
            toast('ユーザーの取得に失敗しました: ' + err)
          }
          return
        }
        toast('ユーザー情報を更新しました。')
      }).finally(() => this.disableForm = false)
    },
  },
  mounted() {
    const params = new URLSearchParams(location.search)
    const id = parseInt(params.get('id'))
    if (isNaN(id) || !id || id <= 0) return toast('ユーザーが存在しません。')
    fetch(api(`/i_users/get/${id}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
      },
    }).then(res => res.json()).then(res => {
      const err = res['error']
      if (err) {
        if (err === 'not_found') {
          toast('ユーザーが存在しません。')
        } else if (err === 'unauthorized') {
          location.href = '/?error=not_logged_in'
        } else {
          toast('ユーザーの取得に失敗しました: ' + err)
        }
        return
      }
      this.onUserUpdated(res)
    })
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
