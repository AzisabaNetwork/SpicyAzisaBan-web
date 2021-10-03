<!--suppress HttpUrlsUsage -->
<template>
  <Navbar :dismissible-login-modal="true" ref="navbar" @me-updated="meUpdated" />
  <Container>
    <div class="row">
      <div class="col s11" style="margin-left: 0">
        <FlippedTable>
          <FlippedTableEntry :ks="2" :vs="10" :k="targetType">
            <InputTextField id="p-target" ref="target" white-text :label="targetType" active-label :disabled="disableForm" />
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="タイプ" vstyle="color: #fff;">
            <select id="p-type" @change="updateElements" :disabled="disableForm">
              <option value="BAN" selected>Ban</option>
              <option value="TEMP_BAN">TempBan</option>
              <option value="IP_BAN">IPBan</option>
              <option value="TEMP_IP_BAN">TempIPBan</option>
              <option value="MUTE">Mute</option>
              <option value="TEMP_MUTE">TempMute</option>
              <option value="IP_MUTE">IPMute</option>
              <option value="TEMP_IP_MUTE">TempIPMute</option>
              <option value="WARNING">Warning</option>
              <option value="CAUTION">Caution</option>
              <option value="KICK">Kick</option>
              <option value="NOTE">Note</option>
            </select>
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="理由">
            <InputTextField id="p-reason" ref="reason" white-text label="理由" active-label />
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="期限切れ日時" v-if="isTemp">
            <InputTextField
                id="end-date-picker"
                input-class="datepicker"
                label="期限切れ日時 (YYYY/MM/DD)"
                ref="end-date-picker"
                active-label
                white-text
                @change="onEndDateTimeChange"
            />
            <InputTextField
                id="end-time-picker"
                input-class="timepicker"
                label="期限切れ日時 (hh:mm:ss)"
                ref="end-time-picker"
                active-label
                white-text
                @change="onEndDateTimeChange"
            />
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="期間" v-if="isTemp">
            <InputTextField
                id="duration"
                label="期間"
                ref="duration"
                active-label
                white-text
                :input-class="isInvalidDuration ? 'the-invalid' : null"
                @change="onDurationChange"
            />
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="サーバー">
            <InputTextField
                id="p-server"
                ref="server"
                white-text
                label="サーバー"
                default-value="global"
                active-label
            />
          </FlippedTableEntry>
          <FlippedTableEntry :ks="2" :vs="10" k="執行者">
            {{ operator }}
          </FlippedTableEntry>
        </FlippedTable>
        <Button :disabled="disableForm" color="submit-button" text="送信" @click="doCreate" />
      </div>
    </div>
  </Container>
</template>

<script lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Container from '@/components/Container.vue'
import FlippedTable from '@/components/FlippedTable.vue'
import FlippedTableEntry from '@/components/FlippedTableEntry.vue'
import InputTextField from '@/components/InputTextField.vue'
import { api, autoInitM, processTime, toast, unProcessTime3, zero } from '@/util/util'
import Button from '@/components/Button.vue'

const operator = ref('')

const start = Date.now()

export default {
  components: {
    Button,
    FlippedTableEntry,
    FlippedTable,
    Container,
    Navbar,
    InputTextField,
  },
  data() {
    return {
      isInvalidDuration: false,
      isTemp: false,
      targetType: 'ID / UUID',
      disableForm: false,
      operator,
    }
  },
  methods: {
    processTime,
    unProcessTime3,
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
        const date = new Date(processTime(event.target.value) + start)
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
      if (isNaN(date.getTime())) {
        console.warn('NaN date:', this.$refs['end-date-picker'].value || '', this.$refs['end-time-picker'].value || '')
        return
      }
      const time = date.getTime() - start
      this.$refs.duration.value = this.unProcessTime3(time)
      this.$refs['end-date-picker'].value = this.dateToDateString(date)
      this.$refs['end-time-picker'].value = this.dateToTimeString(date)
    },
    doCreate() {
      if (this.disableForm) return
      const end = this.isTemp
          ? new Date(`${this.$refs['end-date-picker'].value} ${this.$refs['end-time-picker'].value}`).getTime()
          : -1
      if (isNaN(end) || (end !== -1 && end < start)) return toast('期限切れ日時が無効です。')
      if (!this.$refs.reason.value) return toast('理由が空です。')
      this.disableForm = true
      fetch(api('/punishments/create'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-SpicyAzisaBan-Session': localStorage.getItem('spicyazisaban_session'),
        },
        body: JSON.stringify({
          target: this.$refs.target.value,
          type: (document.getElementById('p-type') as HTMLSelectElement).value,
          reason: this.$refs.reason.value,
          start,
          end,
          server: this.$refs.server.value || 'global',
        }),
      }).then(res => res.json()).then(async res => {
        if (res['error']) {
          const err = res['error']
          if (err === 'not_linked') {
            toast('アカウントが連携されていません。')
          } else if (err === 'player_not_resolved') {
            toast('対象が見つかりません。')
          } else if (err === 'not_punishable_ip') {
            toast('対象のIPアドレスは処罰できません。')
          } else if (err === 'invalid_end') {
            toast('期限切れの日付が無効です。')
          } else if (err === 'server_not_enough_permission') {
            toast('サーバーを変更する権限がありません。')
          } else {
            toast(`処罰の追加に失敗しました: ${err}`)
          }
          this.disableForm = false
          return
        }
        toast('処罰を追加しました。')
        setTimeout(() => {
          location.href = `/#${res.ids.join(',')}`
        }, 2000)
      }).catch(() => this.disableForm = false)
    },
    meUpdated() {
      operator.value = this.$refs.navbar.user.linked_name || '未連携'
    },
    updateElements() {
      const pType = (document.getElementById('p-type') as HTMLSelectElement).value
      this.isTemp = pType.includes('TEMP_')
      if (pType.includes('IP_')) {
        this.targetType = 'ID / UUID / IP'
      } else {
        this.targetType = 'ID / UUID'
      }
    },
  },
  mounted() {
    autoInitM()
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

.full-width {
  width: 100%;
}

.text-align-left {
  text-align: left;
}

.select-dropdown {
  color: #2ec7b9;
}

.dropdown-content {
  background-color: #22282a;
  border-radius: 0 0 20px 20px;
}
.dropdown-content li > a, .dropdown-content li > span {
  color: #2ec7b9;
}
.dropdown-content li:hover, .dropdown-content li.active {
  background-color: inherit;
}
.select-dropdown.dropdown-content li.selected {
  background-color: #52585a;
}
.select-dropdown.dropdown-content li.selected:hover {
  background-color: rgba(0,0,0,0.08);
}
</style>

<style scoped>
td, th {
  text-align: inherit;
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
