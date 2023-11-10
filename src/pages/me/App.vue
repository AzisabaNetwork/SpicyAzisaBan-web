<template>
  <Navbar :dismissible-login-modal="true" ref="navbar" @me-updated="onUserUpdated" />
  <Preloader size="big" :active="!me" color="spinner-blue-only" />
  <Container v-if="me">
    <div class="row">
      <div class="col s12">
        <Card>
          <h2>ユーザー名変更</h2>
          <v-text-field
              label="ユーザー名"
              minlength="4"
              maxlength="32"
              :rules="[v => v.test(/^[a-zA-Z0-9_-]{4,32}$/) || 'Invalid username']"
              v-model="username"
              :readonly="disableForm"
          ></v-text-field>
          <v-btn text="変更" :disabled="disableForm" @click="changeName()" />
        </Card>
        <Card>
          <h2>パスワード変更</h2>
          <v-text-field
              label="現在のパスワード"
              minlength="7"
              :rules="[v => v.length > 7 || 'パスワードは7文字以上である必要があります']"
              v-model="currentPassword"
              type="password"
              :readonly="disableForm"
          ></v-text-field>
          <v-text-field
              label="新しいパスワード"
              minlength="7"
              :rules="[v => v.length > 7 || 'パスワードは7文字以上である必要があります']"
              v-model="newPassword"
              type="password"
              :readonly="disableForm"
          ></v-text-field>
          <v-text-field
              label="新しいパスワード（確認）"
              minlength="7"
              :rules="[v => v.length > 7 || 'パスワードは7文字以上である必要があります']"
              v-model="newPasswordConfirm"
              type="password"
              :readonly="disableForm"
          ></v-text-field>
          <div class="col s12">
            <v-btn :disabled="disableForm" @click="changePassword()">変更</v-btn>
          </div>
        </Card>
        <Card>
          <h2>2段階認証</h2>
          <div class="row">
            <div class='col s12'>
              <p>現在{{ me.mfa_enabled ? '有効' : '無効' }}になっています。</p>
            </div>
            <v-text-field
                label="現在のパスワード"
                minlength="7"
                :rules="[v => v.length > 7 || 'パスワードは7文字以上である必要があります']"
                v-model="currentPassword"
                type="password"
                :readonly="disableForm"
            ></v-text-field>
            <div class='col s12'>
              <v-btn
                  type='submit'
                  color='green'
                  icon="mdi-submit"
                  @click='toggleMFA()'
                  :disabled="disableForm"
              >{{ me.mfa_enabled ? '無効化' : '有効化' }} </v-btn>
            </div>
          </div>
        </Card>
        <Card>
          <h2>Minecraftアカウント連携</h2>
          <p>Minecraftアカウント連携: {{ me.linked_uuid ? 'オン' : 'オフ' }}</p>
          <template v-if="me.linked_uuid">
            <p>連携されているUUID: {{ me.linked_uuid }}</p>
            <p>連携されている名前: {{ me.linked_name }}</p>
          </template>
          <div class="col s12">
            <v-btn
                type='submit'
                color="green"
                @click="toggleAccountLink()"
                :disabled="disableForm"
            >{{ me.linked_uuid ? '連携解除' : '連携' }}</v-btn>
          </div>
        </Card>
        <Card>
          <h2>アカウント連携</h2>
          <div class="col s12">
            <v-btn
                v-if="!me.discord_user_tag"
                type="submit"
                color="green"
                @click="enableDiscord()"
                :disabled="disableForm"
            >Discordアカウントと連携</v-btn>
            <template v-else>
              <p>Discordアカウント: {{ me.discord_user_tag }} (ID: {{ me.discord_user_id }})</p>
              <v-btn
                  type='submit'
                  color="blue"
                  @click="disableDiscord()"
                  :disabled="disableForm"
              >Discordアカウントの連携を解除</v-btn>
            </template>
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
      <v-btn class="modal-close" color="green">OK</v-btn>
    </ModalFooter>
  </Modal>
  <Modal id="me_link_account" :dismissible="false">
    <ModalContent>
      <h4>アカウント連携</h4>
      <p>サーバーに参加して、<span class='code' ref="me_link_account_code"></span>と打つと連携が可能です。</p>
      <p>このコードは10分間有効です。10分が過ぎると再度連携ボタンをクリックする必要があります。</p>
    </ModalContent>
    <ModalFooter>
      <v-btn color="modal-close green" @click="refreshUserStatus()">OK</v-btn>
    </ModalFooter>
  </Modal>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import Navbar from '@/components/NavBar.vue'
import Container from '@/components/SpicyContainer.vue'
import Preloader from '@/components/SpicyPreloader.vue'
import { api, isValidName, openLoginModal, openModal, toast } from '@/util/util'
import Card from '@/components/SpicyCard.vue'
import Modal from '@/components/SModal.vue'
import ModalContent from '@/components/ModalContent.vue'
import ModalFooter from '@/components/ModalFooter.vue'

const navbar = ref(null)
const me_mfa_modal_qrcode = ref(null)
const me_mfa_modal_secret = ref(null)
const me_link_account_code = ref(null)

const username = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const codes = ref([])
const recoveryCodes = ref('')
const disableForm = ref(true)
const me = ref({
  email: '',
  username: '',
  mfa_enabled: false,
  linked_uuid: '',
  linked_name: '',
  discord_user_id: '',
  discord_user_tag: '',
})

const onUserUpdated = (user: any) => {
  if (!user) return openLoginModal()
  me.value = user
  username.value = user.username
  disableForm.value = false
}

const changeName = () => {
  if (disableForm.value) return
  if (!isValidName(username.value)) {
    return toast('このユーザー名は使用できません。')
  }
  toast('パスワードを変更中...')
  disableForm.value = true
  fetch(api('/i_users/changename'), {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
    },
    body: JSON.stringify({
      user_id: navbar.value.user.id,
      username: username.value,
    }),
    credentials: 'include',
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
      navbar.value.username = username.value
    }, 100)
  }).finally(() => {
    disableForm.value = false
  })
}

const changePassword = () => {
  if (disableForm.value) return
  if (currentPassword.value.length < 7) return
  if (newPassword.value !== newPasswordConfirm.value) {
    return toast('パスワード (確認)が一致しません。')
  }
  if (newPassword.value.length < 7) {
    return toast('パスワードは7文字以上にする必要があります。')
  }
  disableForm.value = true
  fetch(api('/i_users/changepassword'), {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
    },
    body: JSON.stringify({
      user_id: navbar.value.user.id,
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    }),
    credentials: 'include',
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
    disableForm.value = false
  })
}

const refreshUserStatus = async () => {
  return await fetch(api('/i_users/me'), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
    },
    credentials: 'include',
  }).then(res => res.json()).then(res => {
    if (res['error']) {
      return
    }
    me.value = res
    console.log(res)
    return res
  })
}

const toggleMFA = () => {
  disableForm.value = true
  refreshUserStatus().then(res => {
    if (res.mfa_enabled) {
      const token = prompt('現在の2FA認証コードもしくは復旧コード')
      if (!token) {
        disableForm.value = false
        return
      }
      toast('2FAを無効にしています...')
      fetch(api('/i_users/disable_2fa'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
        },
        body: JSON.stringify({ token }),
        credentials: 'include',
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
        refreshUserStatus()
      }).finally(() => {
        disableForm.value = false
      })
    } else {
      toast('2FAを有効にしています...')
      fetch(api('/i_users/enable_2fa'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
        },
        body: JSON.stringify({ password: currentPassword.value }),
        credentials: 'include',
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
        refreshUserStatus()
        showMFAModal(res.secret_key, res.recovery_codes, res.qrcode)
      }).finally(() => {
        disableForm.value = false
      })
    }
  })
}

const copyRC = () => {
  navigator.clipboard.writeText(recoveryCodes.value)
  toast('復旧コードをクリップボードにコピーしました。')
}

const showMFAModal = (key: string, codeArray: string[], qrcode: string) => {
  recoveryCodes.value = `SpicyAzisaBan (${me.value.email}) のMFA復旧コード
発行日時: ${new Date().toLocaleString('ja-JP')}

・${codeArray.join('\n・')}`
  codes.value = codeArray
  me_mfa_modal_qrcode.value.src = qrcode
  me_mfa_modal_secret.value.textContent = key
  openModal(document.getElementById('me_mfa_modal'))
}

const toggleAccountLink = () => {
  disableForm.value = true
  refreshUserStatus().then(me => {
    if (me.linked_uuid) {
      // unlink
      fetch(api('/i_users/unlink_account'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
        },
        credentials: 'include',
      }).then(res => res.json()).then(res => {
        if (res['error']) {
          toast('不明なエラーが発生しました: ' + res['error'])
          return
        }
        refreshUserStatus()
        toast('連携を解除しました。')
      }).finally(() => disableForm.value = false)
    } else {
      // link
      fetch(api('/i_users/link_account'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
        },
        credentials: 'include',
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
        me_link_account_code.value.textContent = `/sab link ${code}`
        openModal(document.getElementById('me_link_account'))
      }).finally(() => disableForm.value = false)
    }
  })
}

const enableDiscord = () => {
  disableForm.value = true
  fetch(api(`/api/oauth2/discord/get_url?for=link&apiRoot=${encodeURIComponent(api(''))}`), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
    },
    credentials: 'include',
  }).then(res => res.json()).then(res => {
    if (res['error']) return toast('不明なエラーが発生しました: ' + res['error'])
    location.href = res['url']
  }).finally(() => disableForm.value = false)
}

const disableDiscord = () => {
  disableForm.value = true
  fetch(api('/i_users/unlink_discord'), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-SpicyAzisaBan-Session': localStorage.getItem("spicyazisaban_session"),
    },
    credentials: 'include',
  }).then(res => res.json()).then(res => {
    if (res['error']) return toast('不明なエラーが発生しました: ' + res['error'])
    refreshUserStatus()
  }).finally(() => disableForm.value = false)
}

onMounted(() => {
  const params = new URLSearchParams(location.search)
  if (params.has('state')) {
    localStorage.setItem('spicyazisaban_session', params.get('state'))
    location.href = location.origin + '/me'
  }
})
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
