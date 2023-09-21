<template>
  <Navbar :dismissible-login-modal="true" ref="navbar" @me-updated="onUserUpdated" />
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
              refForRef="me_username"
              pattern="^[a-zA-Z0-9_-]{4,32}$"
              :disabled="disableForm"
          />
          <v-btn text="変更" :disabled="disableForm" @click="changeName()" />
        </Card>
        <Card>
          <h2>パスワード変更</h2>
          <InputTextField
              label="現在のパスワード"
              :min-length="7"
              id="me_current_password"
              white-text
              refForRef="me_current_password"
              type="password"
              :disabled="disableForm"
          />
          <InputTextField
              label="新しいパスワード"
              :min-length="7"
              id="me_new_password"
              white-text
              refForRef="me_new_password"
              type="password"
              :disabled="disableForm"
          />
          <InputTextField
              label="新しいパスワード (確認)"
              :min-length="7"
              id="me_new_password_confirm"
              white-text
              refForRef="me_new_password_confirm"
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
              <p>現在{{ me.mfa_enabled ? '有効' : '無効' }}になっています。</p>
            </div>
            <InputTextField
                label="現在のパスワード"
                :min-length="7"
                id="me_mfa_password"
                white-text
                refForRef="me_mfa_password"
                type="password"
                :disabled="disableForm"
                v-if="!me.mfa_enabled"
            />
            <div class='col s12'>
              <Button
                  type='submit'
                  color='green submit-button'
                  @click='toggleMFA()'
                  :text="me.mfa_enabled ? '無効化' : '有効化'"
                  :disabled="disableForm"
              />
            </div>
          </div>
        </Card>
        <Card>
          <h2>Minecraftアカウント連携</h2>
          <p>Minecraftアカウント連携: {{ me.linked_uuid ? 'オン' : 'オフ' }}</p>
          <Dummy v-if="me.linked_uuid">
            <p>連携されているUUID: {{ me.linked_uuid }}</p>
            <p>連携されている名前: {{ me.linked_name }}</p>
          </Dummy>
          <div class="col s12">
            <Button
                type='submit'
                color="green submit-button"
                @click="toggleAccountLink()"
                :text="me.linked_uuid ? '連携解除' : '連携'"
                :disable="disableForm"
            />
          </div>
        </Card>
        <Card>
          <h2>アカウント連携</h2>
          <div class="col s12">
            <Button
                type='submit'
                color="green submit-button"
                @click="enableDiscord()"
                text="Discordアカウントと連携"
                :disable="disableForm"
                v-if="!me.discord_user_tag"
            />
            <Dummy v-else>
              <p>Discordアカウント: {{ me.discord_user_tag }} (ID: {{ me.discord_user_id }})</p>
              <Button
                  type='submit'
                  color="blue submit-button"
                  @click="disableDiscord()"
                  text="Discordアカウントの連携を解除"
                  :disable="disableForm"
              />
            </Dummy>
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
      <v-btn color="modal-close green" text="OK" />
    </ModalFooter>
  </Modal>
  <Modal id="me_link_account" :dismissible="false">
    <ModalContent>
      <h4>アカウント連携</h4>
      <p>サーバーに参加して、<span class='code' ref="me_link_account_code"></span>と打つと連携が可能です。</p>
      <p>このコードは10分間有効です。10分が過ぎると再度連携ボタンをクリックする必要があります。</p>
    </ModalContent>
    <ModalFooter>
      <v-btn color="modal-close green" text="OK" @click="refreshUserStatus()" />
    </ModalFooter>
  </Modal>
</template>

<script lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/NavBar.vue'
import Container from '@/components/SpicyContainer.vue'
import Preloader from '@/components/SpicyPreloader.vue'
import InputTextField from '@/components/InputTextField.vue'
import { api, isValidName, openLoginModal, openModal, toast } from '@/util/util'
import Card from '@/components/SpicyCard.vue'
import Modal from '@/components/SModal.vue'
import ModalContent from '@/components/ModalContent.vue'
import ModalFooter from '@/components/ModalFooter.vue'
import Dummy from '@/components/SDummy.vue'

const refCodes = ref([])

export default {
  components: {
    Dummy,
    ModalFooter,
    ModalContent,
    Modal,
    Card,
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
  methods: {
    onUserUpdated(user) {
      if (!user) return openLoginModal()
      this.me = user
      this.$refs.me_username.value = user.username
      this.disableForm = false
    },
    changeName() {
      if (this.disableForm) return
      const username = this.$refs.me_username.value
      if (!isValidName(username)) {
        return toast('このユーザー名は使用できません。')
      }
      toast('パスワードを変更中...')
      this.disableForm = true
      fetch(api('/i_users/changename'), {
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
      fetch(api('/i_users/changepassword'), {
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
    refreshUserStatus() {
      return fetch(api('/i_users/me'), {
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
        console.log(res)
        return res
      })
    },
    toggleMFA() {
      this.disableForm = true
      this.refreshUserStatus().then(res => {
        if (res.mfa_enabled) {
          const token = prompt('現在の2FA認証コードもしくは復旧コード')
          if (!token) return this.disableForm = false
          toast('2FAを無効にしています...')
          fetch(api('/i_users/disable_2fa'), {
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
            this.refreshUserStatus()
          }).finally(() => {
            this.disableForm = false
          })
        } else {
          const password = this.$refs.me_mfa_password.value
          toast('2FAを有効にしています...')
          fetch(api('/i_users/enable_2fa'), {
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
            this.refreshUserStatus()
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
    toggleAccountLink() {
      this.disableForm = true
      this.refreshUserStatus().then(me => {
        if (me.linked_uuid) {
          // unlink
          fetch(api('/i_users/unlink_account'), {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
            },
          }).then(res => res.json()).then(res => {
            if (res['error']) {
              toast('不明なエラーが発生しました: ' + res['error'])
              return
            }
            this.refreshUserStatus()
            toast('連携を解除しました。')
          }).finally(() => this.disableForm = false)
        } else {
          // link
          fetch(api('/i_users/link_account'), {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
            },
          }).then(res => res.json()).then(res => {
            console.log(res)
            if (res['error']) {
              const error = res['error']
              if (error === 'already_linked') {
                toast('アカウントはすでに連携されています。')
              } else {
                toast('不明なエラーが発生しました: ' + error)
              }
              return
            }
            const code = res['link_code']
            this.$refs.me_link_account_code.textContent = `/sab link ${code}`
            openModal(document.getElementById('me_link_account'))
          }).finally(() => this.disableForm = false)
        }
      })
    },
    enableDiscord() {
      this.disableForm = true
      fetch(api(`/api/oauth2/discord/get_url?for=link&apiRoot=${encodeURIComponent(api(''))}`), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
        },
      }).then(res => res.json()).then(res => {
        if (res['error']) return toast('不明なエラーが発生しました: ' + res['error'])
        location.href = res['url']
      }).finally(() => this.disableForm = false)
    },
    disableDiscord() {
      this.disableForm = true
      fetch(api('/i_users/unlink_discord'), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
        },
      }).then(res => res.json()).then(res => {
        if (res['error']) return toast('不明なエラーが発生しました: ' + res['error'])
        this.refreshUserStatus()
      }).finally(() => this.disableForm = false)
    }
  },
  setup() {
    return {
      recoveryCodes: '',
      codes: refCodes,
    }
  },
  mounted() {
    const params = new URLSearchParams(location.search)
    if (params.has('state')) {
      localStorage.setItem('spicyazisaban_session', params.get('state'))
      location.href = location.origin + '/me'
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
