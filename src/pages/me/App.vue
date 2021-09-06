<template>
  <Navbar :dismissible-login-modal="true" />
  <Preloader size="big" :active="!me" color="spinner-blue-only" />
  <Container v-if="me">
    <div class="row">
      <div class="col s12">
        <div class="row" style="align-items: center;">
          <InputTextField
              label="ユーザー名"
              :min-length="4"
              :max-length="32"
              :default-value="me.username"
              id="username"
              div-class="s11"
              white-text
              active-label
          />
          <Button text="保存" />
        </div>
        <hr />
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

const me = ref(null)

export default {
  components: {
    Button,
    Preloader,
    Container,
    Navbar,
    InputTextField,
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
