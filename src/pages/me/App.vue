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
        <Card>
          <h2>2段階認証</h2>
          <div class="row">
            <div class='col s12'>
              <p>現在{{ mfa_enabled ? '有効' : '無効' }}になっています。</p>
            </div>
            <InputTextField
                label="現在のパスワード"
                :min-length="7"
                id="me_mfa_password"
                white-text
                ref="me_mfa_password"
                type="password"
                :disabled="disableForm"
                v-if="!mfa_enabled"
            />
            <div class='col s12'>
              <Button
                  type='submit'
                  color='green submit-button'
                  @click='toggleMFA()'
                  :text="mfa_enabled ? '無効化' : '有効化'"
                  :disabled="disableForm"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  </Container>
  <Modal id="me_mfa_modal" :dismissible="false">
    <ModalContent>
      <h4>2FA認証設定</h4>
      <b style='display: inline-block;'>この地点で2FAは有効になっています。無効にするには、下記の復旧コードを記録して、そのあとにこの画面を閉じて2FA認証を無効化してください。</b>
      <img ref="me_mfa_modal_qrcode" src='#' alt='QR code' />
      <p>上のQRコードが読み込めない場合、<span class='code' ref="me_mfa_modal_secret"></span>を手動で登録してください。</p>
      <h4>復旧コード</h4>
      <p>2FA認証の手段を失い、復旧コードも失った場合、アカウントは永久的にアクセスできなくなります。</p>
      <b>これを閉じる前に必ず保存してください。</b>
      <div class='col s12'>
        <button class='btn waves-effect blue' @click='copyRC()' style='margin-top: 5px; margin-bottom: 5px;'>復旧コードをコピー</button>
      </div>
      <div class='mfa-modal-recovery-codes'>
        <span v-for="code in codes" :key="code">{{ code }}</span>
      </div>
    </ModalContent>
    <ModalFooter>
      <Button color="modal-close green" text="OK" />
    </ModalFooter>
  </Modal>
</template>

<script lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Container from '@/components/Container.vue'
import Preloader from '@/components/Preloader.vue'
import InputTextField from '@/components/InputTextField.vue'
import Button from '@/components/Button.vue'
import {isValidName, openModal, toast} from '@/util/util'
import Card from '@/components/Card.vue'
import Modal from '@/components/Modal.vue'
import ModalContent from '@/components/ModalContent.vue'
import ModalFooter from '@/components/ModalFooter.vue'

const refCodes = ref([])

export default {
  components: {
    ModalFooter,
    ModalContent,
    Modal,
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
    refreshMFAStatus() {
      return fetch(`${process.env.VUE_APP_API_URL}/i_users/me`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
        },
      }).then(res => res.json()).then(res => {
        if (res['error']) {
          return
        }
        this.me = res
        this.mfa_enabled = this.me.mfa_enabled
        console.log(res)
        return res
      })
    },
    toggleMFA() {
      this.disableForm = true
      this.refreshMFAStatus().then(res => {
        if (res.mfa_enabled) {
          const token = prompt('現在の2FA認証コードもしくは復旧コード')
          if (!token) return this.disableForm = false
          toast('2FAを無効にしています...')
          fetch(`${process.env.VUE_APP_API_URL}/i_users/disable_2fa`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
            },
            body: JSON.stringify({ token }),
          }).then(res => res.json()).then(res => {
            const err = res.error
            if (err) {
              if (err === 'incorrect_mfa_token') {
                toast('2FA認証コードが間違っています。')
              } else {
                toast(`不明なエラーが発生しました。 (${err})`)
              }
              return
            }
            toast('2FAを無効化しました。')
            this.refreshMFAStatus()
          }).finally(() => {
            this.disableForm = false
          })
        } else {
          const password = this.$refs.me_mfa_password.value
          toast('2FAを有効にしています...')
          fetch(`${process.env.VUE_APP_API_URL}/i_users/enable_2fa`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
            },
            body: JSON.stringify({ password }),
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
            toast('2FAを有効化しました。')
            this.refreshMFAStatus()
            this.showMFAModal(res.secret_key, res.recovery_codes, res.qrcode)
          }).finally(() => {
            this.disableForm = false
          })
        }
      })
    },
    copyRC() {
      navigator.clipboard.writeText(this.recoveryCodes)
      toast('復旧コードをクリップボードにコピーしました。')
    },
    showMFAModal(key: string, codes: string[], qrcode: string) {
      this.recoveryCodes = `SpicyAzisaBan (${this.me.email}) のMFA復旧コード
発行日時: ${new Date().toLocaleString('ja-JP')}

・${codes.join('\n・')}`
      refCodes.value = codes
      this.$refs.me_mfa_modal_qrcode.src = qrcode
      this.$refs.me_mfa_modal_secret.textContent = key
      openModal(document.getElementById('me_mfa_modal'))
    },
  },
  setup() {
    const mfa_enabled = ref(false)
    const me = ref(null)
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
      mfa_enabled.value = res.mfa_enabled
      console.log(res)
    })
    return {
      me,
      mfa_enabled,
      recoveryCodes: '',
      codes: refCodes,
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
.mfa-modal-recovery-codes {
  display: flex;
  flex-wrap: wrap;
}

.mfa-modal-recovery-codes > * {
  border: solid #000000 1px;
  background-color: rgba(0, 0, 0, 0.2);
  width: 20%;
}

.code {
  background-color: rgba(0, 0, 0, 0.2);
  padding-left: 3px;
  padding-right: 3px;
  border-radius: 5px;
}
</style>
