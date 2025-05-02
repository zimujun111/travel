<template>
    <view class="my">
      <view class="title">首页</view>
      <view class="content">
        这是首页
      </view>
    </view>
    <TabBar></TabBar>
    
  </template>
  
  <script setup>
  import TabBar from "../../../custom-tab-bar/index"
  
  </script>
  
  <style>
  .my {
    padding: 20px;
  }
  
  .title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .content {
    font-size: 16px;
    color: #666;
  }
  </style>