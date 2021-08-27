<template>
  <NavWrapper :logged-in="loggedIn" :username="username">
    <li><Link href="/" text="処罰履歴" /></li>
  </NavWrapper>
  <AccountMenu>
    <li><Link href="/me" text="設定" /></li>
    <li><Link href="/logout" text="ログアウト" /></li>
  </AccountMenu>
  <Modal id="login-modal">
    <ModalContent title="ログイン / 登録">
      <InputTextField :min-length=5 type="email" label="メールアドレス" id="email" ref="email"/>
      <InputTextField :min-length=7 type="password" label="パスワード" id="password" ref="password"/>
      <InputTextField :min-length=6 :max-length=10 type="text" label="(ログイン時+有効化してる人のみ)2FAのコードもしくは復旧コード" id="2fa" ref="mfa_token"/>
    </ModalContent>
    <ModalFooter>
      <Button color="orange darken-4" v-on:click="doRegister" text="アカウントを作成"/>
      <Button color="green" v-on:click="doLogin" text="ログイン"/>
    </ModalFooter>
  </Modal>
</template>

<script lang="ts">
import { ref } from "vue"
import InputTextField from './InputTextField.vue'
import Button from './Button.vue'
import Link from './Link.vue'
import AccountMenu from "@/components/AccountMenu.vue"
import Modal from "@/components/Modal.vue";
import ModalContent from "@/components/ModalContent.vue";
import ModalFooter from "@/components/ModalFooter.vue";
import NavWrapper from "@/components/NavWrapper.vue";

function toast(text: string) {
  // @ts-ignore
  M.toast({ unsafeHTML: text.replace('\n', '<br />') }) // eslint-disable-line no-undef
  console.log(`Notification: ${text}`)
}

const username = ref("")
const loggedIn = ref(false)
function refreshLoginStatus() {
  fetch(`${process.env.VUE_APP_API_URL}/i_users/me`, {
    headers: {
      'Accept': 'application/json',
    },
  }).then(async res => {
    const data = await res.json()
    const isError = !!(res.status !== 200 || data['error'])
    loggedIn.value = !isError
    if (isError) {
      if (data['error'] !== 'unauthorized') {
        toast('Unknown error fetching user data: ' + data['error'])
      }
      return
    }
    username.value = data['username']
  })
}

export default {
  methods: {
    doRegister() {
      if (!this.$refs.email.value.includes(".") || !this.$refs.email.value.includes("@") || this.$refs.email.value.length < 5) return
      if (this.$refs.password.value.length < 7) return
      if (this.$refs.mfa_token.value.length > 0 && (this.$refs.mfa_token.value.length < 6 || this.$refs.mfa_token.value.length > 10)) return
      toast('アカウントを作成中...')
      fetch(`${process.env.VUE_APP_API_URL}/i_users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: this.$refs.email.value,
          password: this.$refs.password.value,
        }),
      }).then(res => res.json()).then(res => {
        const err = res['error']
        if (err) {
          if (err === 'invalid_email_or_password') {
            toast('メールアドレス、もしくはパスワードの形式が間違っています。')
          } else if (err === 'dupe_user') {
            toast('別のユーザーがすでにこのメールアドレスで登録しているか、同一のIPで複数のアカウントを作ろうとしています。')
          } else {
            toast(`不明なエラーが発生しました。 (${err})`)
          }
          return
        }
        toast('確認のメールを送信しました。\n見つからない場合は迷惑メールフォルダも確認してください。')
      })
    },
    doLogin() {
      if (!this.$refs.email.value.includes(".") || !this.$refs.email.value.includes("@") || this.$refs.email.value.length < 5) return
      if (this.$refs.password.value.length < 7) return
      if (this.$refs.mfa_token.value.length > 0 && (this.$refs.mfa_token.value.length < 6 || this.$refs.mfa_token.value.length > 10)) return
      toast('ログイン中...')
      fetch(`${process.env.VUE_APP_API_URL}/i_users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: this.$refs.email.value,
          password: this.$refs.password.value,
          mfa_token: this.$refs.mfa_token.value,
        }),
      }).then(res => res.json()).then(res => {
        const err = res['error']
        if (err) {
          if (err === 'invalid_email_or_password') {
            toast('メールアドレス、もしくはパスワードが間違っています。')
          } else if (err === 'no_password') {
            toast('このアカウントにはパスワードがありません(ログインが無効化されています)。')
          } else if (err === 'incomplete_user') {
            toast('このユーザーはまだ登録が完了していません。')
          } else if (err === 'incorrect_mfa_token') {
            toast('2FA認証コードが間違ってます。')
          } else if (err === 'banned') {
            toast(`このアカウントは無効化されています。(理由: ${res.reason})`)
          } else {
            toast(`不明なエラーが発生しました。 (${err})`)
          }
          return
        }
        refreshLoginStatus()
        toast('You\'ve (probably) successfully logged in!')
      })
    },
  },
  components: {
    NavWrapper,
    ModalFooter,
    ModalContent,
    Modal,
    AccountMenu,
    InputTextField,
    Button,
    Link,
  },
  data() {
    return {
      loggedIn,
      username,
    }
  },
  setup() {
    refreshLoginStatus()
  },
}

setTimeout(() => {
  // eslint-disable-next-line no-undef
  M.AutoInit()
}, 100)
</script>
