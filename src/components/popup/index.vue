<template>
    <div v-if="visible" class="custom-modal-mask">
      <div class="custom-modal-container">
        <div class="custom-modal-header">
          <span class="custom-modal-title">{{ title }}</span>
          <span class="custom-modal-close" @click="onClose">×</span>
        </div>
        <scroll-view scroll-y class="custom-modal-content">
          <p>{{ content }}</p>
        </scroll-view>
        <div class="custom-modal-footer">
          <span class="custom-modal-confirm" @click="onConfirm">复制内容</span>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
    const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    onClose: {
        type: Function,
        required: true
    },
    onConfirm: {
        type: Function,
        required: true
    }
    })
    
</script>
  
  <style src="./index.css"></style>
 