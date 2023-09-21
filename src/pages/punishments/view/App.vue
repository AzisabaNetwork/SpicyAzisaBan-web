<!--suppress HttpUrlsUsage -->
<template>
  <Navbar :dismissible-login-modal="true" ref="navbar" />
  <Preloader size="big" :active="spinnerActive" color="spinner-blue-only" />
  <Container v-if="punishment">
    <div class="row">
      <div class="col s11" style="margin-left: 0">
        <FlippedTable>
          <FlippedTableEntry :ks="2" :vs="10" k="#ID" :v="'#' + punishment.id" />
          <FlippedTableEntry :ks="2" :vs="10" k="名前/IP">
            <span
                :style="{ 'padding-left': punishment.target.includes('-') ? '68px' : '34px' }">
              {{ punishment.name }}
            </span>
            <a :href="`/players?uuid=${punishment.target}`" v-show="punishment.target.includes('-')">
              <MdIcon icon="article" classes="clickable-icon" style="margin-left: 3px; padding: 5px;" />
            </a>
            <a :href="buildSearchURL(punishment.name)">
              <MdIcon icon="search" classes="clickable-icon" style="margin-left: 3px; padding: 5px;" />
            </a>
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="タイプ"><PunishmentType :type="punishment.type" /></FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="理由">
            <InputTextField v-if="editing" id="p-reason" refForRef="reason" white-text label="理由" :default-value="punishment.reason" active-label />
            <Dummy v-else>{{ punishment.reason }}</Dummy>
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="処罰日時" :v="new Date(punishment.start).toLocaleString('ja-JP')" />
          <FlippedTableEntry :ks="2" :vs="10" k="有効"><ColoredBoolean :bool="punishment.active" /></FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="期限切れ" v-if="punishment.end > 0 && isTemp()"><ColoredBoolean :bool="punishment.end < Date.now()" /></FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="期限切れ日時" v-if="punishment.end > 0">
            <Dummy v-if="isTemp() && editing">
              <label @click="refreshDateTimePickers">
                <input class="filled-in white-text" type="checkbox" v-model="isPerm" :value="punishment.end <= 0" />
                <span>無期限</span>
              </label>
              <InputTextField
                  v-if="!isPerm"
                  id="end-date-picker"
                  input-class="datepicker"
                  :default-value="dateToDateString(new Date(punishment.end))"
                  label="期限切れ日時 (YYYY/MM/DD)"
                  refForRef="end-date-picker"
                  active-label
                  white-text
                  @change="onEndDateTimeChange"
              />
              <InputTextField
                  v-if="!isPerm"
                  id="end-time-picker"
                  input-class="timepicker"
                  :default-value="dateToTimeString(new Date(punishment.end))"
                  label="期限切れ日時 (hh:mm:ss)"
                  refForRef="end-time-picker"
                  active-label
                  white-text
                  @change="onEndDateTimeChange"
              />
            </Dummy>
            <Dummy v-else>{{ new Date(punishment.end).toLocaleString('ja-JP') }}</Dummy>
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="期間">
            <Dummy v-if="isTemp() && editing">
              <InputTextField
                  v-if="!isPerm"
                  id="duration"
                  :default-value="unProcessTime3(punishment.end - punishment.start)"
                  label="期間"
                  refForRef="duration"
                  active-label
                  white-text
                  :input-class="isInvalidDuration ? 'the-invalid' : null"
                  @change="onDurationChange"
              />
              <Dummy v-else>無期限</Dummy>
            </Dummy>
            <NumberToTime v-else :time="punishment.end - punishment.start" />
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="サーバー">
            <InputTextField
                v-if="(this.$refs.navbar.user.group === 'manager' || this.$refs.navbar.user.group === 'admin') && editing"
                id="p-server"
                refForRef="server"
                white-text
                label="サーバー"
                :default-value="punishment.server"
                active-label
            />
            <Dummy v-else>{{ punishment.server }}</Dummy>
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="執行者" :v="punishment['operator_name']" />
          <FlippedTableEntry :ks="2" :vs="10" k="解除済み"><ColoredBoolean :bool="punishment.unpunished" /></FlippedTableEntry>
          <Dummy v-if="punishment.unpunished">
            <FlippedTableEntry :ks="2" :vs="10" k="解除理由">
              <InputTextField
                v-if="editing"
                id="p-u-reason"
                refForRef="unpunishReason"
                white-text
                label="解除理由"
                :default-value="punishment.unpunish.reason"
                active-label
              />
              <Dummy v-else>{{ punishment.unpunish.reason }}</Dummy>
            </FlippedTableEntry>
            <FlippedTableEntry :ks="2" :vs="10" k="解除日時" :v="new Date(punishment.unpunish.timestamp).toLocaleString('ja-JP')" />
            <FlippedTableEntry :ks="2" :vs="10" k="解除した人" :v="punishment.unpunish.operator_name" />
          </Dummy>
        </FlippedTable>
      </div>
      <div class="col s1">
        <table class="actions-table">
          <thead>
            <tr>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <SLink style="display: block; cursor: pointer;" :class="'editing-' + editing.toString()" @click="onEditButtonClick" title="編集">
                  <MdIcon icon="edit" />
                </SLink>
              </td>
            </tr>
            <tr v-if="!editing && punishment.active">
              <td>
                <SLink style="display: block; cursor: pointer;" @click="openUnpunishModal" title="処罰を解除">
                  <MdIcon icon="block" />
                </SLink>
              </td>
            </tr>
            <tr v-if="editing">
              <td>
                <SLink style="display: block;" :class="'update-button-' + isUpdatingData.toString()" @click="updateData" title="保存">
                  <MdIcon icon="save" />
                </SLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <h4>証拠一覧</h4>
    <div class="row">
      <FlippedTable style="width: 100%">
        <FlippedTableEntry v-for="proof in punishment.proofs" :key="proof.id" :ks="1" :vs="11" :k="(proof.public ? 'P' : '') + '#' + proof.id" vc="left full-width text-align-left">
          <Dummy v-if="editing">
            <div class="row" style="align-items: center; margin: 0;">
              <div class="col s10">
                <div class="input-field col12">
                  <input
                    :id="'p-p-' + proof.id"
                    type="text"
                    class="validate white-text"
                    v-model="proof.value"
                  />
                  <label
                    :for="'p-p-' + proof.id"
                    class="active"
                  >{{ '証拠 #' + proof.id }}</label>
                </div>
              </div>
              <div class="col s1">
                <label>
                  <input class="filled-in white-text" type="checkbox" v-model="proof.public" :value="proof.public" />
                  <span>公開</span>
                </label>
              </div>
              <div class="col s1">
                <SLink color="clickable-icon" @click="punishment.proofs = punishment.proofs.filter(p => p.id !== proof.id)">
                  <MdIcon icon="delete" />
                </SLink>
              </div>
            </div>
          </Dummy>
          <Dummy v-else>
            <MdImage v-if="/\.(png|gif|jpg|jpeg)$/.test(proof.text)" :src="proof.text" style="max-width: 90%; max-height: 90%;" />
            <SLink v-else-if="proof.text.startsWith('http://') || proof.text.startsWith('https://')" :href="proof.text">{{ proof.text }}</SLink>
            <Dummy v-else>{{ proof.text }}</Dummy>
          </Dummy>
        </FlippedTableEntry>
        <FlippedTableEntry k="" vc="left full-width text-align-left" v-if="editing" :ks="1" :vs="11">
          <div class="row" style="align-items: center; margin: 0; height: 50px;">
            <div class="col s11">
            </div>
            <div class="col s1">
              <Link color="clickable-icon" @click="punishment.proofs.push({ id: -1, value: '' })">
                <MdIcon icon="add" />
              </Link>
            </div>
          </div>
        </FlippedTableEntry>
      </FlippedTable>
    </div>
  </Container>
  <Modal :dismissible="true" id="unpunish-modal">
    <ModalContent title="処罰の解除">
      <InputTextField
          id="unpunish-reason"
          refForRef="modalUnpunishReason"
          type="text"
          :min-length="1"
          :max-length="255"
          :disabled="isUpdatingData"
          placeholder="解除理由"
      />
    </ModalContent>
    <ModalFooter>
      <v-btn color="modal-close green" text="閉じる" :disabled="isUpdatingData" />
      <v-btn color="red accent-4" text="解除" @click="onUnpunishButtonClick" :disabled="isUpdatingData" />
    </ModalFooter>
  </Modal>
</template>

<script lang="ts">
import { Ref, ref } from 'vue'
import Navbar from '@/components/NavBar.vue'
import Preloader from '@/components/SpicyPreloader.vue'
import Container from '@/components/SpicyContainer.vue'
import FlippedTable from '@/components/FlippedTable.vue'
import FlippedTableEntry from '@/components/FlippedTableEntry.vue'
import SLink from '@/components/SLink.vue'
import PunishmentType from '@/components/PunishmentType.vue'
import NumberToTime from '@/components/NumberToTime.vue'
import ColoredBoolean from '@/components/ColoredBoolean.vue'
import Dummy from '@/components/SDummy.vue'
import MdIcon from '@/components/MdIcon.vue'
import MdImage from '@/components/MdImage.vue'
import InputTextField from '@/components/InputTextField.vue'
import { api, buildSearchURL, openModal, processTime, toast, unProcessTime3, zero } from '@/util/util'
import Modal from '@/components/SModal.vue'
import ModalContent from '@/components/ModalContent.vue'
import ModalFooter from '@/components/ModalFooter.vue'

const editing = ref(false)
const isUpdatingData = ref(false)
const punishment = ref(null)
const isPerm = ref(false)
const unpunishReason: Ref<string> = ref(null)

export default {
  components: {
    ModalFooter,
    ModalContent,
    Modal,
    MdImage,
    MdIcon,
    Dummy,
    ColoredBoolean,
    NumberToTime,
    PunishmentType,
    SLink,
    FlippedTableEntry,
    FlippedTable,
    Container,
    Preloader,
    Navbar,
    InputTextField,
  },
  data() {
    return {
      isInvalidDuration: false,
    }
  },
  methods: {
    buildSearchURL,
    processTime,
    unProcessTime3,
    isTemp() {
      return punishment.value.type.includes('TEMP_')
    },
    dateToDateString(date: Date) {
      return `${date.getFullYear()}/${zero(2, (date.getMonth() + 1).toString())}/${zero(2, date.getDate().toString())}`
    },
    dateToTimeString(date: Date) {
      let hours = date.getHours()
      let what = hours > 12 ? 'PM' : 'AM'
      if (hours > 12) hours -= 12
      if (hours === 0) hours = 12
      return `${zero(2, hours.toString())}:${zero(2, date.getMinutes().toString())}:${zero(2, date.getSeconds().toString())} ${what}`
    },
    onDurationChange(event) {
      try {
        const date = new Date(processTime(event.target.value) + punishment.value.start)
        this.$refs['end-date-picker'].value = this.dateToDateString(date)
        this.$refs['end-time-picker'].value = this.dateToTimeString(date)
        this.isInvalidDuration = false
      } catch (e) {
        this.isInvalidDuration = true
        return
      }
    },
    onEndDateTimeChange() {
      const date = new Date(`${this.$refs['end-date-picker'].value || ''} ${this.$refs['end-time-picker'].value || ''}`)
      const time = date.getTime() - punishment.value.start
      this.$refs.duration.value = this.unProcessTime3(time)
      this.$refs['end-date-picker'].value = this.dateToDateString(date)
      this.$refs['end-time-picker'].value = this.dateToTimeString(date)
    },
    onEditButtonClick() {
      editing.value = !editing.value
      if (!editing.value) {
        this.fixMaterialBox()
        punishment.value.proofs = punishment.value.proofs.filter(p => p.id !== -1)
      }
      let extra = ''
      if (editing.value) extra = '&edit'
      history.replaceState({}, document.title, `${location.origin}/punishments/view?id=${punishment.value.id}${extra}`)
      this.refreshDateTimePickers()
    },
    fixMaterialBox() {
      setTimeout(() => {
        const elems = document.querySelectorAll('.materialboxed')
        // @ts-ignore
        M.Materialbox.init(elems) // eslint-disable-line no-undef
      }, 10)
    },
    refreshDateTimePickers() {
      setTimeout(() => {
        const datePickers = document.querySelectorAll('.datepicker')
        // @ts-ignore
        M.Datepicker.init(datePickers) // eslint-disable-line no-undef
        const timePickers = document.querySelectorAll('.timepicker')
        // @ts-ignore
        M.Timepicker.init(timePickers) // eslint-disable-line no-undef
      }, 10)
    },
    updateData() {
      if (!editing.value || isUpdatingData.value || !punishment.value) return
      isUpdatingData.value = true
      const end = this.isTemp() && !isPerm.value
          ? new Date(`${this.$refs['end-date-picker'].value} ${this.$refs['end-time-picker'].value}`).getTime()
          : -1
      if (isNaN(end)) {
        toast('期限切れ日時が無効です。')
        isUpdatingData.value = false
        return
      }
      fetch(api('/punishments/update'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
        },
        body: JSON.stringify({
          id: punishment.value.id,
          reason: this.$refs.reason.value,
          end,
          server: (this.$refs.server || { value: null }).value || punishment.value.server,
          unpunish_reason: (this.$refs.unpunishReason || { value: null }).value || null, // just in case "value" evaluates to undefined
          proofs: punishment.value.proofs,
        }),
      }).then(res => res.json()).then(async res => {
        const err = res['error']
        if (err) {
          if (err === 'not_found') {
            toast('処罰が見つかりません。')
          } else if (err === 'missing_permissions') {
            toast('この処罰を変更する権限がありません。')
          } else {
            toast(`処罰データの更新に失敗しました: ${err}`)
          }
          return
        }
        await fetch(api(`/punishments/get/${punishment.value.id}`), {
          headers: {
            'Accept': 'application/json',
            'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
          },
        }).then(res => res.json()).then(data => {
          const err = data['error']
          if (err) {
            toast(`処罰情報の取得中にエラーが発生しました。`)
            return
          }
          console.log(data)
          punishment.value = data['data']
        })
        toast('処罰データを更新しました。')
        editing.value = false
      }).finally(() => {
        isUpdatingData.value = false
        this.fixMaterialBox()
      })
    },
    openUnpunishModal() {
      openModal(document.getElementById('unpunish-modal'))
    },
    onUnpunishButtonClick() {
      if (this.isUpdatingData) return
      const reason = this.$refs.modalUnpunishReason.value || ''
      if (!reason || reason.length === 0) return toast('理由が空です。')
      if (reason.length > 255) return toast('理由が長すぎます。')
      this.isUpdatingData = true
      fetch(api('/punishments/unpunish'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
        },
        body: JSON.stringify({
          id: punishment.value.id,
          reason,
        }),
      }).then(res => res.json()).then(res => {
        const err = res['error']
        if (err) {
          if (err === 'not_found') {
            toast('処罰が見つかりません。')
          } else if (err === 'already_unpunished') {
            toast('この処罰はすでに解除されています。')
          } else if (err === 'missing_permissions') {
            toast('この処罰を変更する権限がありません。')
          } else if (err === 'not_linked') {
            toast('アカウントが連携されていません。')
          } else {
            toast('処罰を解除できませんでした: ' + err)
          }
          this.isUpdatingData = false
          return
        }
        toast('処罰を解除しました。')
        setTimeout(() => location.reload(), 2000)
      })
    },
  },
  setup() {
    if (!localStorage.getItem('spicyazisaban_session')) {
      setTimeout(() => {
        // @ts-expect-error
        M.Modal.getInstance(document.getElementById('login-modal')).open() // eslint-disable-line no-undef
      }, 200)
      return
    }
    const params = new URLSearchParams(window.location.search)
    let id = parseInt(params.get('id'))
    if (!id) id = parseInt(location.pathname.replace(/^\/punishments\/view\/(.*)$/, '$1'))
    if (isNaN(id)) id = 0
    const spinnerActive = ref(!!id)
    if (id) {
      fetch(api(`/punishments/get/${id}`), {
        headers: {
          'Accept': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
        },
      }).then(res => res.json()).then(data => {
        const err = data['error']
        if (err) {
          spinnerActive.value = false
          toast(`処罰ID #${id}が見つかりません。`)
          return
        }
        console.log(data)
        punishment.value = data['data']
        editing.value = params.has('edit')
        spinnerActive.value = false
        const elems = document.querySelectorAll('.materialboxed')
        // @ts-expect-error
        M.Materialbox.init(elems) // eslint-disable-line no-undef
      })
    } else {
      toast(`処罰ID #${id}が見つかりません。`)
    }
    return {
      spinnerActive,
      punishment,
      editing,
      isUpdatingData,
      isPerm,
      unpunishReason,
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
  color: #fff;
}

.full-width {
  width: 100%;
}

.text-align-left {
  text-align: left;
}
</style>

<style scoped>
td, th {
  text-align: inherit;
}

table.actions-table, table.actions-table>thead>tr, table.actions-table>tbody>tr {
  border: solid 2px;
  border-radius: 5px;
}

.update-button-true {
  color: gray;
  cursor: not-allowed;
}

.update-button-false {
  cursor: pointer;
}

.editing-true {
  color: orange;
  transition: all 200ms;
}

.editing-false {
  color: gray;
  transition: all 200ms;
}

.the-invalid {
  border-bottom: 1px solid #F44336;
  -webkit-box-shadow: 0 1px 0 0 #f44336;
  box-shadow: 0 1px 0 0 #f44336;
}

.clickable-icon {
  display: flex;
  align-items: center;
  float: right;
  text-align: center;
  margin-left: -6px;
  border-radius: 9999px;
  transition: 150ms ease-in-out;
  cursor: pointer;
  width: 34px;
  height: 34px;
  line-height: 34px;
}

.clickable-icon:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

i.material-icons {
  width: 34px;
  height: 34px;
  line-height: 34px;
}
</style>
