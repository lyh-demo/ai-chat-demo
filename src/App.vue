<script setup lang="ts">
import type { ChatData } from './types'
import { onMounted, reactive, ref } from 'vue'
import ChatGPTIcon from './components/ChatGPTIcon.vue'
import UserIcon from './components/UserIcon.vue'
import { chat } from './lib/ai.ts'

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
    console.error('请先配置您的 API KEY')
    return
  }
  const messageList = [
    { role: 'system', content: '你是一个 AI 助手，能够帮助用户解决各种问题' },
    { role: 'user', content: message },
  ]
  const result = await chat(messageList, apiKey) as any
  state.data.push({
    userAsk: message,
    gptResponse: result.choices[0].message.content,
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
    <div class="flex flex-nowrap fixed w-full items-baseline top-0 px-6 py-4 bg-gray-100">
      <div class="text-2xl font-bold">
        ChatGPT
      </div>
      <div class="ml-auto px-3 py-2 text-sm cursor-pointer hover:bg-white rounded-md" @click="handleConfigButtonClick">
        设置
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
          <div>{{ item.gptResponse }}</div>
        </div>
      </div>
    </div>
    <div class="sticky bottom-0 w-full p-6 pb-8 bg-gray-100 flex-shrink-0 flex-grow-0 basis-20">
      <div v-if="isConfig" class="mb-2 text-sm text-gray-500">
        请输入您的 API KEY
      </div>
      <div class="flex">
        <input v-model="messageContent" class="input" :type="isConfig ? 'password' : 'text'" @keydown.enter="sendMessageOrSaveAPIKey">
        <button class="btn ml-4 hover:bg-white" @click="sendMessageOrSaveAPIKey">
          {{ isConfig ? '保存' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
