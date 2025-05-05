<template>
    <view class="travel-item">
      <image :src="data.url" class="travel-item-img" mode="widthFix" />
      <view class="travel-item-box">
        <view class="travel-item-title">{{ data.title }}</view>
        <view class="travel-item-name">
            <view class="user-info">
                <image :src="data.avatar" mode="aspectFill" class="travel-item-avatar" />
            <view class="user-name">{{ data.name }}</view>
            </view>
            <view class="see-container">
          <image src="../../assets/images/see.png" class="eye-icon" />
          <view class="travel-item-see">{{ data.num }}</view>
        </view>
        </view>
      </view>
    </view>
  </template>
  
  <script>
  export default {
    name: 'ItemData',
    props: {
      data: {
        type: Object,
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
  /* 可以在这里添加组件特有样式 */
  </style>