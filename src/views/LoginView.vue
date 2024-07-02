<script setup lang="ts">
import { ref } from 'vue';
import Button from '../components/common/Button.vue'
import Input from '../components/common/Input.vue'
import { fetchRequest } from '@/services/api.service';
import { useToast } from 'vue-toast-notification';
import router from '@/router';

let formValues = ref({
  email: "",
  password: "",
})

const $toast = useToast();

async function onFormSubmit(ev: SubmitEvent) {
  console.log(ev)
  ev.preventDefault();
  console.log("Values Submitted!", formValues.value);
  const tokenInfo = await submitLogin();
  
  if (tokenInfo.ApiStatusCode === 200) {
    
    let instance = $toast.success('User successfully logged in!');
    localStorage.setItem('accessToken', tokenInfo.Data.AccessToken)
    localStorage.setItem('tokenExpiresAt', tokenInfo.Data.ExpiresAt)
    localStorage.setItem('refreshToken', tokenInfo.Data.RefreshToken)
    
    const userInfo = await getUserInfo();
    
    localStorage.setItem('userInfo', JSON.stringify(userInfo.Data))

    router.push({ path: '/home' })
  }
}

async function submitLogin() {
  try {
    const response = await fetchRequest('oauth/token', {
      method: 'POST',
      body: {
          "Email": formValues.value.email,
          "Password": formValues.value.password,
          "GrantType": "password",
          "Scope": "amazon_data",
          "ClientId": "C0001",
          "ClientSecret": "SECRET0001",
          "RedirectUri": "https://api.eva.guru"
        }
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}

async function getUserInfo() {
  try {
    const response = await fetchRequest('user/user-information', {
      method: 'POST',
      body: {
          "email": formValues.value.email,
        }
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}

function updateValue(ev: KeyboardEvent) {
  formValues.value[ev.currentTarget.name] = ev.currentTarget.value;
}
</script>

<template>
  <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-10 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form :on-submit="onFormSubmit" class="space-y-6">

        <Input :value="formValues.email" :valueChange="updateValue" :is-required="true" name="email" label="Email Address" type="email" />
        
        <Input :value="formValues.password" :valueChange="updateValue" :is-required="true" name="password" label="Password" type="password" label-wrapper-classes="flex items-center justify-between" />

        <div>
          <Button type="submit" text="Login" :onClick="onFormSubmit"></Button>
        </div>
      </form>

    </div>
  </div>
</template>
