<template>
  <NavWrapper :logged-in="loggedIn" :username="username" :default-search-word="defaultSearchWord" @search-input="fireSearchInputEvent">
    <template v-slot:common>
      <li><Link href="/punishments/new" style="display: inline-flex; width: 100%;"><MdIcon icon="add" />処罰を追加</Link></li>
      <li><Link href="/">処罰履歴</Link></li>
    </template>
    <template v-slot:menu>
      <li><Link href="/me">設定</Link></li>
      <li><Link @click="doLogout()">ログアウト</Link></li>
    </template>
  </NavWrapper>
  <Modal id="login-modal" :dismissible="dismissibleLoginModal">
    <ModalContent title="ログイン / 登録">
      <InputTextField :min-length=5 type="email" label="メールアドレス" id="navbar_email" ref="email"/>
      <InputTextField :min-length=7 type="password" label="パスワード" id="navbar_password" ref="password"/>
      <InputTextField :min-length=6 :max-length=10 type="text" label="(ログイン時+有効化してる人のみ)2FAのコードもしくは復旧コード" id="navbar_2fa" ref="mfa_token"/>
    </ModalContent>
    <ModalFooter>
      <Button color="orange darken-4" @click="doRegister" text="アカウントを作成" :disabled="disableForm" />
      <Button color="green" @click="doLogin" text="ログイン" :disabled="disableForm" />
    </ModalFooter>
  </Modal>
</template>

<script lang="ts">
import { ref } from "vue"
import InputTextField from './InputTextField.vue'
import Button from './Button.vue'
import Link from './Link.vue'
import Modal from "@/components/Modal.vue";
import ModalContent from "@/components/ModalContent.vue";
import ModalFooter from "@/components/ModalFooter.vue";
import NavWrapper from "@/components/NavWrapper.vue";
import {api} from '@/util/util'
import MdIcon from '@/components/MdIcon.vue'

function toast(text: string) {
  // @ts-ignore
  M.toast({ unsafeHTML: text.replace('\n', '<br />') }) // eslint-disable-line no-undef
  console.log(`Notification: ${text}`)
}

const username = ref("")
const loggedIn = ref(false)
const user = ref({
  id: 0,
  username: '',
  group: 'user',
  last_update: 0,
})

function refreshLoginStatus() {
  return fetch(api('/i_users/me'), {
    headers: {
      'Accept': 'application/json',
      'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
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
    user.value = data
    username.value = data['username']
    return data
  })
}

export default {
  props: {
    dismissibleLoginModal: Boolean,
    defaultSearchWord: String,
  },
  emits: ['meUpdated', 'search-input'],
  methods: {
    fireSearchInputEvent(event) {
      this.$emit('search-input', event)
    },
    doRegister() {
      if (!this.$refs.email.value.includes(".") || !this.$refs.email.value.includes("@") || this.$refs.email.value.length < 5) return
      if (this.$refs.password.value.length < 7) return
      this.disableForm = true
      toast('アカウントを作成中...')
      fetch(api('/i_users/register'), {
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
      }).finally(() => this.disableForm = false)
    },
    doLogin() {
      if (!this.$refs.email.value.includes(".") || !this.$refs.email.value.includes("@") || this.$refs.email.value.length < 5) return
      if (this.$refs.password.value.length < 7) return
      const mfa = this.$refs.mfa_token?.value || ''
      if (mfa.length > 0 && (mfa.length < 6 || mfa.length > 10)) return
      this.disableForm = true
      toast('ログイン中...')
      fetch(api('/i_users/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: this.$refs.email.value,
          password: this.$refs.password.value,
          mfa_token: mfa,
        }),
      }).then(res => res.json()).then(res => {
        // @ts-expect-error
        M.Modal.getInstance(document.getElementById('login-modal')).close() // eslint-disable-line no-undef
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
        localStorage.setItem('spicyazisaban_session', res['state'])
        refreshLoginStatus()
        location.reload()
        toast('You\'ve (probably) successfully logged in!')
      }).finally(() => this.disableForm = false)
    },
    doLogout() {
      const session = localStorage.getItem("spicyazisaban_session")
      if (!session) return
      fetch(api('/i_users/logout'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': session,
        },
      }).then(res => {
        if (res.status === 200) {
          localStorage.removeItem("spicyazisaban_session")
          refreshLoginStatus()
          toast('ログアウトしました。')
        } else {
          res.text().then(text => toast(text))
        }
      })
    },
  },
  components: {
    MdIcon,
    NavWrapper,
    ModalFooter,
    ModalContent,
    Modal,
    InputTextField,
    Button,
    Link,
  },
  data() {
    return {
      loggedIn,
      username,
      user,
      disableForm: false,
    }
  },
  setup(props, { emit }) {
    refreshLoginStatus().then(res => {
      emit('meUpdated', res)
    })
  },
}

setTimeout(() => {
  // @ts-ignore
  M.AutoInit() // eslint-disable-line no-undef
}, 100)
</script>
