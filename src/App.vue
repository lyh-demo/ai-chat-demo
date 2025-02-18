<script setup lang="ts">
import type { ChatData } from './types'
import { onMounted, reactive, ref } from 'vue'
import { toast } from 'vue3-toastify'
import ChatGPTIcon from './components/ChatGPTIcon.vue'
import SettingIcon from './components/SettingIcon.vue'
import UserIcon from './components/UserIcon.vue'
import { chat } from './lib/ai.ts'
import 'vue3-toastify/dist/index.css'

const messageContent = ref<string>('')
const isConfig = ref<boolean>(true)
const state = reactive({
  data: [] as ChatData[],
})

function clearMessageContent() {
  messageContent.value = ''
}

function toggleConfigStatus() {
  isConfig.value = !isConfig.value
}

function getAPIKey() {
  return localStorage.getItem('apiKey') ?? ''
}

function handleConfigButtonClick() {
  if (!isConfig.value) {
    messageContent.value = getAPIKey()
  }
  else {
    clearMessageContent()
  }
  toggleConfigStatus()
}

function saveAPIKey(apiKey: string) {
  localStorage.setItem('apiKey', apiKey)
  return true
}

onMounted(() => {
  if (getAPIKey()) {
    toggleConfigStatus()
  }
})

async function sendChatMessage(message: string) {
  const apiKey = getAPIKey()
  if (!apiKey) {
    toast.error('请先配置您的 API KEY', {
      position: toast.POSITION.TOP_CENTER,
    })
    return
  }
  const messageList = [
    { role: 'system', content: '你是一个 AI 助手，能够帮助用户解决各种问题' },
    { role: 'user', content: message },
  ]
  const result = await chat(messageList, apiKey)
  if (!result) {
    toast.error('获取数据失败，请检查您的 API KEY', {
      position: toast.POSITION.TOP_CENTER,
    })
    return
  }
  state.data.push({
    userAsk: message,
    gptResponse: result,
  })
  clearMessageContent()
}

async function sendMessageOrSaveAPIKey() {
  if (!messageContent.value.length) {
    return
  }
  if (isConfig.value) {
    if (saveAPIKey(messageContent.value.trim())) {
      toggleConfigStatus()
    }
    clearMessageContent()
  }
  else {
    await sendChatMessage(messageContent.value)
  }
}
</script>

<template>
  <div class="flex flex-col h-screen pt-20">
    <div class="flex flex-nowrap fixed w-full items-center justify-between top-0 px-6 py-4 bg-gray-100">
      <div class="text-2xl font-bold">
        ChatGPT
      </div>
      <div class="p-2 cursor-pointer hover:bg-gray-200 rounded-md" @click="handleConfigButtonClick">
        <SettingIcon :width="20" :height="20" />
      </div>
    </div>
    <div class="flex-1 ml-3">
      <div class="mt-5 flex items-center">
        <ChatGPTIcon />
        <div class="ml-4 bg-gray-100 leading-10 h-10 rounded-md px-4">
          您好，有什么可以帮忙的？
        </div>
      </div>
      <div v-for="(item, index) in state.data" :key="index" class="mt-5">
        <div class="flex">
          <UserIcon />
          <div class="ml-4 bg-gray-100 leading-10 h-10 rounded-md px-4">
            {{ item.userAsk }}}
          </div>
        </div>
        <div class="flex mt-5">
          <ChatGPTIcon />
          <div class="ml-4 bg-gray-100 leading-10 h-10 rounded-md px-4">
            {{ item.gptResponse }}
          </div>
        </div>
      </div>
    </div>
    <div class="sticky bottom-0 w-full p-6 pb-8 bg-gray-100 flex flex-col">
      <div v-if="isConfig" class="mb-2">
        <a href="https://gpt302.saaslink.net/1BUaRS" target="_blank" class="text-sm text-gray-500 hover:text-blue-500">请输入您的 API KEY：</a>
      </div>
      <div class="flex">
        <input v-model="messageContent" class="block w-96 rounded-md bg-white px-4 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" :type="isConfig ? 'password' : 'text'" @keydown.enter="sendMessageOrSaveAPIKey">
        <button class="ml-4 rounded-md bg-indigo-600 px-4 py-2 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" @click="sendMessageOrSaveAPIKey">
          {{ isConfig ? '保存' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
