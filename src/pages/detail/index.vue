<template>
    <view class="detail-container">
      <view class="media-container">
        <!-- 轮播图 -->
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
              :style="imageStyles[index] || {}"
              @load="onImageLoad"
              @tap="previewImage(index)"
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
        
        <view class="media-indicator">
          {{ currentMediaIndex + 1 }}/{{ post.media.length }}
        </view>
      </view>

      <!-- 用户信息 -->
      <view class="user-section">
        <view class="user-info">
          <image class="avatar" :src="post.avatar" />
          <view class="user-meta">
            <text class="username">{{ post.name }}</text>
            <!-- <text class="fans-count">{{ post.user.fans }}粉丝</text> -->
          </view>
        </view>
        <button class="follow-btn">关注</button>
      </view>
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
        <text class="time">{{ post.time }}发布</text>
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
  import {onMounted, ref} from 'vue'
  import Taro , {
    useLoad,
    useShareAppMessage,
    useShareTimeline,
    
  }from '@tarojs/taro'
  import { useTravelStore } from '../../stores/travelStores'
  import {computed} from 'vue'
  import { formatRelativeTime } from '../../utils/date'
  export default {
  setup() {    
    const currentMediaIndex = ref(0)
    const swiperHeight = ref(0)
    const isLiked = ref(false)
    const isCollected = ref(false)
    const showInput = ref(false)
    const commentText = ref('')
    const imageStyles = ref([]);
    const post = ref({
      media: [], // 确保初始化为数组
      title: '',
      content: '',
      avatar: '',
      name: '',
      // 其他字段...
    });
    const firstImageHeight = ref(0)
    const travelStore = useTravelStore()
    const list =  computed(() => travelStore.list)
    const fetchNotes = async () => {
      await travelStore.fetchNotes(currentPage.value, pageSize.value)
    }
    
    
    
    const fetchNoteImages = async (noteId) => {
      try {
        const response = await Taro.request({
          url: `https://localhost:3000/api/travel-notes/getNoteImages/${noteId}`,
          method: 'GET',
        });
        console.log(response.data)
        if (response.data.success) {
          return response.data.data.imageInfo.avatar || []; // 返回媒体数组
        }
        return [];
      } catch (error) {
        console.error('获取游记图片失败:', error);
        return [];
      }
    }
   

    onMounted(async () => {
      const note_id = Taro.getCurrentInstance().router.params.note_id;
      
      
      const found = list.value.find(item => item.note_id == note_id);
      
      if (found) {
        
        const media = await fetchNoteImages(note_id);
        let media_url = [];
        for(let i = 0; i < media.length; i++){
          media_url.push({
            type: 'image',
            url: `https://localhost:3000${media[i].url}`
          });
        }
        // 3. 合并数据
        post.value = {        
          title: found.title,
          content: found.content,
          media: media.length > 0 ? media_url : [{
            type: 'image',
            url: `https://localhost:3000${found.User.avatar_url}`
          }],
          avatar: `https://localhost:3000${found.User?.avatar_url}`,
          name: found.User?.username,
          location: found.location,
          likes: found.like_count,
          collects: 100,
          comments: found.comment_count,
          time: formatRelativeTime(found.created_at),
          
        };
        console.log(post.value)
      }
    });
    
    const onImageLoad = (e) => {
      const { width, height } = e.detail;
      const systemInfo = Taro.getSystemInfoSync();
      const screenWidth = systemInfo.windowWidth;
      const currentImageHeight = (height * screenWidth) / width;
      
      // 第一张图片：设置基准高度
      if (currentMediaIndex.value === 0 && firstImageHeight.value === 0) {
        firstImageHeight.value = currentImageHeight;
        swiperHeight.value = currentImageHeight;
      }
      console.log(currentMediaIndex.value)
      // 非第一张图片且高度超过基准：计算缩放比例
      if (currentMediaIndex.value > 0 && currentImageHeight > firstImageHeight.value) {
        const scaleRatio = firstImageHeight.value / currentImageHeight;
        imageStyles.value[currentMediaIndex.value] = {
          transform: `scale(${scaleRatio})`,
          transformOrigin: 'top center',
        };
        
      }
      console.log(imageStyles.value)
    };

    const handleSwiperChange = (e) => {
      console.log(e)
      const newIndex = e.detail.current;
      currentMediaIndex.value = newIndex;
      // 重置所有非当前页的图片样式（可选）
      const { width, height } = e.detail;
      const systemInfo = Taro.getSystemInfoSync();
      const screenWidth = systemInfo.windowWidth;
      const currentImageHeight = (height * screenWidth) / width;
      
      // 第一张图片：设置基准高度
      if (currentMediaIndex.value === 0 && firstImageHeight.value === 0) {
        firstImageHeight.value = currentImageHeight;
        swiperHeight.value = currentImageHeight;
      }
      console.log(currentMediaIndex.value)
      // 非第一张图片且高度超过基准：计算缩放比例
      if (currentMediaIndex.value > 0 && currentImageHeight > firstImageHeight.value) {
        const scaleRatio = firstImageHeight.value / currentImageHeight;
        imageStyles.value[currentMediaIndex.value] = {
          transform: `scale(${scaleRatio})`,
          transformOrigin: 'top center',
        };
        
      }
      console.log(imageStyles.value)
      
    };
    console.log(currentMediaIndex.value)

    const previewImage = (index) => {
      const imageUrls = post.value.media
        .filter(m => m.type === 'image')
        .map(m => m.url)
      Taro.previewImage({
        current: imageUrls[index],
        urls: imageUrls
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
      handleShare,
      firstImageHeight,
      imageStyles
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

  .media-swiper {
  width: 100%;
  overflow: hidden; /* 确保缩放图片不会溢出 */
}

.media-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease; /* 添加平滑过渡效果 */
}

.media-container {
  position: relative;
  width: 100%;
  background: #fff;
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