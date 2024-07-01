<script setup lang="ts">
defineProps<{
  name: string,
  label: string,
  type: "text" | "email" | "password" | undefined,
  isRequired: boolean,
  labelWrapperClasses?: string
  value: string, 
  valueChange: any,
}>()
</script>

<template>
  <!-- <div>
    <label :for="name" class="block text-sm font-medium leading-6 text-gray-900">{{label}}</label>
    <slot name="heading"></slot>
    <div class="mt-2">
      <input :id="name" :name="name" :type="type" :required="isRequired" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
    </div>
  </div> -->
  <div>
    <div :class="labelWrapperClasses">
      <label :for="name" class="block text-sm font-medium leading-6 text-gray-900">{{label}}</label>
      <slot name="label-right"></slot>
    </div>
    <div class="mt-2">
      <input :value="value" @input="valueChange" :id="name" :name="name" :type="type" :required="isRequired" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
    </div>
  </div>
</template>
