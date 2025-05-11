<template>
    <view class="travel-item" @tap="detailsClick(data)">
      <image :src=" `https://localhost:3000${data.cover_image}`" class="travel-item-img" mode="widthFix" />
      <view class="travel-item-box">
        <view class="travel-item-title">{{ data.title }}</view>
        <view class="travel-item-name">
            <view class="user-info">
                <image :src="`https://localhost:3000${data.User.avatar_url}`" mode="aspectFill" class="travel-item-avatar" />
            <view class="user-name">{{ data.User.username }}</view>
            </view>
            <view class="see-container">
          <image src="../../assets/images/see.png" class="eye-icon" />
          <view class="travel-item-see">{{ data.view_count }}</view>
        </view>
        </view>
      </view>
    </view>
  </template>
  
  <script>
  import Taro from '@tarojs/taro'
  export default {
    name: 'ItemData',
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    setup(){
      const detailsClick = (data) => {
       
        Taro.navigateTo({
          url: `/pages/detail/index?note_id=${data.note_id}`
        })
      }
      return{
        detailsClick
      }
    }
  }
  </script>
  
  <style scoped>

  </style>