<template>
  <view class="container">
    <view class="page-body">
      <view class="page-section">
        <view class="page-section-spacing">
          <!-- 列表区域 -->
          <scroll-view 
            scroll-y 
            :style="{height: `${windowHeight}px`}"
            class="card-scroll-view"
            :scroll-top="scrollTop"
            @scrolltoupper="upper"
            @scroll="scroll"
          >
            <view class="card-list-wrapper">
              <view class="card-list">
                <view 
                  class="card-item" 
                  
                  v-for="item in list" 
                  :key="item.note_id"
                >
                  <!-- 卡片内容 -->
                  <view class="card-content">
                    <!-- 左侧图片 -->
                    <view class="card-image-container">
                      <image :src="`https://localhost:3000${item.cover_image}`" mode="aspectFill" class="card-image"  lazy-load="true"></image>
                    </view>
                    
                    <!-- 右侧内容 -->
                    <view class="card-info">
                      <view class="card-title">{{ item.title }}</view>
                      <view class="card-desc" v-if="item.status==='approved' || item.status==='pending'">{{ item.content }}</view>
                      <view class="card-desc" v-else-if="item.status==='rejected'">拒绝原因：{{ item.reject_reason.reason }}</view>
                      
                    </view>
                  </view>
                  
                  <!-- 底部按钮 -->
                  <view class="card-actions">
                    <button 
                      class="action-btn" 
                      :class="{
                        'passed-btn': item.status === 'approved',
                        'reject-btn': item.status === 'rejected',
                        'pending-btn': item.status ==='pending'
                      }"
                      @tap="handlePass(item.note_id)"
                    >
                      <text class="btn-text"
                      >{{ item.status === 'approved' ? '已通过' : item.status === 'rejected' ? '已拒绝' : '正在审核' }}</text>
                    </button>
                    <button 
                      class="action-btn delete-btn" 
                      @tap="handleDelete(item.note_id)"
                    >
                      <text class="btn-text">删除</text>
                    </button>
                    <button 
                      class="action-btn edit-btn" 
                      @tap="handleEdit(item)"
                      v-if="item.status==='pending' || item.status==='rejected'"
                    >
                      <text class="btn-text">编辑</text>
                    </button>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref,onMounted,computed } from 'vue'
import Taro from '@tarojs/taro'
import { useTravelStore } from '../../stores/travelstores'

const scrollTop = ref(0)
const userInfo=Taro.getStorageSync('userinfo')

const myTravelStore = useTravelStore()
const list = computed(() =>myTravelStore.myTravellist)

const fetchMyNotes = () => {
  myTravelStore.fetchMyNotes()
}
Taro.useDidShow(() => {
  fetchMyNotes()
})
onMounted(() => {
    fetchMyNotes()
})
console.log(list.value)

const handlePass = (id) => {
  console.log(`通过项目: ${id}`)
  // 这里可以添加通过项目的逻辑
}

// 处理删除
const handleDelete = (id) => {
  console.log(`删除项目: ${id}`)
  // 显示确认对话框
  Taro.showModal({
    title: '确认删除',
    content: '确定要删除这个项目吗？',
    success: (res) => {
      // if (res.confirm) {
      //   // 从列表中删除项目
      //   listData.value = listData.value.filter(item => item.id !== id)
      // }
      Taro.showLoading({ title: '删除中...' })
        Taro.request({
          url: `https://localhost:3000/api/travel-notes/${id}`,
          method: 'DELETE',
          data: {
            user_id: userInfo.user_id
          },
          success: () => {
            Taro.hideLoading()
            Taro.showToast({ title: '删除成功', icon: 'success' })
            Taro.switchTab({ url: '/pages/my/index' })
          },
          fail: (err) => {
            Taro.hideLoading()
            console.error('删除失败:', err)
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        })
    }
  })
}

// 处理编辑
const handleEdit = (item) => {
  console.log(`编辑项目: ${item.id}`)
  // 跳转到编辑页面，并传递当前 item 的内容
  Taro.navigateTo({
    url: `/pages/new/index?item=${encodeURIComponent(JSON.stringify(item))}`,
    success: () => {
      console.log('跳转成功')
    },
    fail: (err) => {
      console.error('跳转失败:', err)
      Taro.showToast({
        title: '跳转失败，请重试',
        icon: 'none'
      })
    }
  })
}

// 滚动到顶部回调
const upper = (e) => {
  console.log('滚动到顶部:', e)
}

// 滚动过程回调
const scroll = (e) => {
  // 可以在这里添加滚动过程中的逻辑
}
</script>

<style>
/* 基础样式 */
.container {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-section-spacing {
  margin-top: 30rpx;
}

/* 滚动视图样式 */
.card-scroll-view {
  width: 100%;
}

/* 卡片列表包装器 */
.card-list-wrapper {
  padding: 24rpx;
}

/* 卡片列表样式 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-bottom: 40rpx;
}

/* 卡片项样式 */
.card-item {
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}



.card-item:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
}

/* 卡片内容样式 */
.card-content {
  display: flex;
  padding: 24rpx;
}

.card-image-container {
  width: 140rpx;
  height: 140rpx;
  border-radius: 8rpx;
  overflow: hidden;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
  margin-bottom: 10rpx;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 26rpx;
  color: #888;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 卡片操作按钮样式 */
.card-actions {
  display: flex;
  padding: 0 24rpx 24rpx 24rpx;
  gap: 16rpx;
  border-top: none;
  background: #fff;
}

.action-btn {
  flex: 1;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 26rpx;
  border-radius: 8rpx;
  margin: 0;
  border: 1rpx solid #e5e7eb;
  background: #fff;
  color: #2563eb;
  transition: background-color 0.2s;
  padding: 0;
  min-width: 120rpx;
}

.passed-btn {
  color: #fff;
  background-color: #10b981;
  border: none;
}
.reject-btn {
  color: #fff;
  background-color: #bf0c0c;
  border: none;
}
.pending-btn{
  color: #fff;
  background-color: #f6bb19;
  border: none;
}
.delete-btn,
.edit-btn {
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 26rpx;
  border-radius: 8rpx;
  border: 1rpx solid #ccc;
  background: #fff;
  color: #2563eb;
  padding: 0;
  min-width: 120rpx;
}

.btn-text {
  display: block;
  width: 100%;
  height: 100%;
}
</style>