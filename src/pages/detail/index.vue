<template>
    <view class="detail-container">
      <!-- 媒体展示区 -->
      <view class="media-container">
        <!-- 图片/视频展示 -->
        <swiper 
          class="media-swiper" 
          :autoplay="false" 
          :circular="true"
          :current="currentMediaIndex"
          @change="handleSwiperChange"
          :style="{ height: swiperHeight + 'px' }"
        >
          <swiper-item v-for="(item, index) in post.media" :key="index">
            <image 
              v-if="item.type === 'image'" 
              :src="item.url" 
              mode="widthFix"
              class="media-image"
              @load="onImageLoad"
              @click="previewImage(index)"
            />
            <video 
              v-else
              :src="item.url"
              controls
              class="media-video"
              :poster="item.poster"
            />
          </swiper-item>
        </swiper>
        <!-- 媒体指示器 -->
        <view class="media-indicator">
          {{ currentMediaIndex + 1 }}/{{ post.media.length }}
        </view>
      </view>

      <!-- 用户信息 -->
      <view class="user-section">
        <view class="user-info">
          <image class="avatar" :src="post.user.avatar" />
          <view class="user-meta">
            <text class="username">{{ post.user.name }}</text>
            <text class="fans-count">{{ post.user.fans }}粉丝</text>
          </view>
        </view>
        <button class="follow-btn">关注</button>
      </view>

      <!-- 正文内容 -->
      <view class="content-section">
        <text class="title">{{ post.title }}</text>
        <text class="desc">{{ post.content }}</text>
        <view class="tags">
          <text 
            v-for="(tag, index) in post.tags" 
            :key="index" 
            class="tag"
          >#{{ tag }}</text>
        </view>
      </view>

      <!-- 位置 -->
      <view class="location-section" v-if="post.location">
        <image src="../../assets/images/location.png" class="location-icon" />
        <text class="location-text">{{ post.location }}</text>
      </view>

      <!-- 互动 -->
      <view class="stats-section">
        <text class="stat-item">{{ post.likes }}点赞</text>
        <text class="stat-item">{{ post.collects }}收藏</text>
        <text class="stat-item">{{ post.comments }}评论</text>
        <text class="time">{{ post.time }}前发布</text>
      </view>

      <!-- bottom -->
      <view class="action-bar">
        <view class="input-placeholder" @tap="focusCommentInput">
          <text>说点什么...</text>
        </view>
        <view class="action-buttons">
          <view class="action-item" @tap="toggleLike">
            <image 
              src= "../../assets/images/common_like2.png" 
              class="action-icon"
            />
            <text>{{ post.likes }}</text>
          </view>
          
          <view class="action-item" @tap="toggleCollect">
            <image 
              src="../../assets/images/save.png" 
              class="action-icon"
            />
            <text>{{ post.collects }}</text>
          </view>
          <view class="action-item" @tap="showComment">
            <image src="../../assets/images/comment.png" class="action-icon" />
            <text>{{ post.comments }}</text>
          </view>
          
            <view class="action-item" @tap="handleShare">
                <image src="../../assets/images/share.png" class="action-icon" />
                <text>分享</text>
            </view>
          
        </view>
      </view>

      <!-- 评论 -->
      <view class="comment-input" v-if="showInput">
        <input 
          type="text" 
          placeholder="写下你的评论..." 
          v-model="commentText"
          focus
        />
        <text class="send-btn" @tap="sendComment">发送</text>
      </view>
    </view>
  </template>
  
  <script>
  import {ref} from 'vue'
  import Taro , {
    useLoad,
    useShareAppMessage,
    useShareTimeline,
  }from '@tarojs/taro'
  
  export default {
  setup() {
    // 响应式数据
    const currentMediaIndex = ref(0)
    const swiperHeight = ref(0)
    const isLiked = ref(false)
    const isCollected = ref(false)
    const showInput = ref(false)
    const commentText = ref('')
    const post = ref({
      id: 1,
      title: '周末探店 | 藏在胡同里的宝藏咖啡厅',
      content: '偶然发现这家超有氛围感的咖啡店，工业风装修搭配复古家具，招牌脏脏咖啡口感层次丰富，甜品也不会太甜腻，拍照超级出片！',
      media: [
        { type: 'image', url: '../../assets/images/home.png' },
        { type: 'image', url: '../../assets/images/home.png' },
        { type: 'video', url: '../../assets/images/home.png', poster: '../../assets/images/home.png' }
      ],
      user: {
        name: '咖啡探索家',
        avatar: '../../assets/images/home.png',
        fans: '1.2万'
      },
      tags: ['咖啡探店', '北京美食', '周末去哪儿'],
      location: '北京·胡同咖啡',
      likes: 2453,
      comments: 328,
      collects: 512,
      time: '2小时'
    })

    // 方法
    const onImageLoad = (e) => {
      const { width, height } = e.detail
      const systemInfo = Taro.getSystemInfoSync()
      const screenWidth = systemInfo.windowWidth
      swiperHeight.value = (height * screenWidth) / width
    }

    const handleSwiperChange = (e) => {
      currentMediaIndex.value = e.detail.current
    }

    const previewImage = (index) => {
      Taro.previewImage({
        current: post.value.media[index].url,
        urls: post.value.media.filter(m => m.type === 'image').map(m => m.url)
      })
    }

    const toggleLike = () => {
      isLiked.value = !isLiked.value
      post.value.likes += isLiked.value ? 1 : -1
    }

    const toggleCollect = () => {
      isCollected.value = !isCollected.value
      post.value.collects += isCollected.value ? 1 : -1
    }

    const showComment = () => {
      showInput.value = true
    }

    const focusCommentInput = () => {
      showInput.value = true
    }

    const sendComment = () => {
        
      if (commentText.value.trim()) {
        post.value.comments++
        commentText.value = ''
        showInput.value = false
        Taro.showToast({ title: '评论成功', icon: 'success' })
      }
    }
    useShareAppMessage(() => {
      return {
        title: post.value.title,
        path: `/pages/detail/index?id=${post.value.id}`, 
        imageUrl: post.value.media[0].url 
      }
    })
    const handleShare = () => {
        try {
            useShareAppMessage({
            title: post.value.title,
            path: `/pages/detail/index?id=${post.value.id}`,
            imageUrl: post.value.media[0].type === 'image' ? post.value.media[0].url : post.value.media[0].poster
            })
        } catch (error) {
            Taro.showToast({
            title: '分享失败',
            icon: 'none'
            })
            console.error('分享错误:', error)
        }
    }
  
    return {
      currentMediaIndex,
      swiperHeight,
      isLiked,
      isCollected,
      showInput,
      commentText,
      post,
      onImageLoad,
      handleSwiperChange,
      previewImage,
      toggleLike,
      toggleCollect,
      showComment,
      focusCommentInput,
      sendComment,
      handleShare
    }
  }
}
  </script>
  
  <style>
  .detail-container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 100px;
  }

  .media-container {
    position: relative;
    width: 100%;
    background: #fff;
  }

  .media-swiper {
    width: 100%;
  }

  .media-image {
    width: 100%;
  }

  .media-video {
    width: 100%;
    height: 100%;
  }

  .media-indicator {
    position: absolute;
    right: 20px;
    bottom: 20px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 24px;
  }

  .user-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    background: white;
    border-bottom: 1rpx solid #f0f0f0;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 48rpx;
    margin-right: 24rpx;
  }

  .username {
    font-size: 32rpx;
    font-weight: bold;
    display: block;
  }

  .fans-count {
    font-size: 24rpx;
    color: #999;
  }

  .follow-btn {
    background: #ff2442;
    color: white;
    border-radius: 32rpx;
    padding: 0 32rpx;
    height: 64rpx;
    line-height: 64rpx;
    font-size: 28rpx;
    margin-right: 20rpx;
  }

  .content-section {
    padding: 32rpx;
    background: white;
    margin-bottom: 20rpx;
  }

  .title {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
    display: block;
  }

  .desc {
    font-size: 32rpx;
    line-height: 1.6;
    display: block;
    margin-bottom: 24rpx;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
  }

  .tag {
    color: #ff2442;
    font-size: 28rpx;
    margin-right: 20rpx;
    margin-bottom: 12rpx;
  }

  .location-section {
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx;
    background: white;
    margin-bottom: 20rpx;
  }

  .location-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 12rpx;
  }

  .location-text {
    font-size: 28rpx;
    color: #666;
  }

  .stats-section {
    display: flex;
    padding: 24rpx 32rpx;
    background: white;
    margin-bottom: 20rpx;
  }

  .stat-item {
    font-size: 28rpx;
    color: #666;
    margin-right: 32rpx;
  }

  .time {
    font-size: 28rpx;
    color: #999;
    margin-left: auto;
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100rpx;
    background: white;
    display: flex;
    align-items: center;
    padding: 0 32rpx;
    border-top: 1rpx solid #f0f0f0;
    z-index: 100;
  }

  .input-placeholder {
    flex: 1;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 32rpx;
    display: flex;
    align-items: center;
    color: #999;
    font-size: 28rpx;
    margin-right: 32rpx;
  }

  .action-buttons {
    display: flex;
  }

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 40rpx;
    font-size: 24rpx;
  }

  .action-icon {
    width: 48rpx;
    height: 48rpx;
    margin-bottom: 4rpx;
  }

  .comment-input {
    position: fixed;
    bottom: 100rpx;
    left: 0;
    right: 0;
    height: 100rpx;
    background: white;
    display: flex;
    align-items: center;
    padding: 0 32rpx;
    border-top: 1rpx solid #f0f0f0;
    z-index: 100;
  }

  .comment-input input {
    flex: 1;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 25rpx;
    padding: 0 32rpx;
    font-size: 28rpx;
  }

  .send-btn {
    color: #ff2442;
    font-size: 32rpx;
    margin-left: 50rpx;
    font-weight: bold;
  }
  </style>