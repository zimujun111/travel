<template>
  <view class="index">
    <!-- 图片或视频预览区域 -->
    <scroll-view class="scroll-view_H" :scroll-x="true" style="width: 100%">
      <template v-if="images.length > 0">
        <view
          v-for="(img, index) in images"
          :key="index"
          class="scroll-view-item_H"
          @tap="openPreview(index)"
        >
          <image :src="img" mode="aspectFill" />
        </view>
      </template>
      <template v-else-if="video">
        <view class="scroll-view-item_H video-wrapper" @tap="showVideoPreview = true">
          <image :src="videoCover || video" class="video-cover" mode="aspectFill" />
          <view class="play-icon">▶</view>
        </view>
      </template>

      <!-- 添加按钮 -->
      <view
        class="scroll-view-item_H add-btn"
        v-if="images.length < 9 && !video"
        @tap="handleAddMedia"
      />
    </scroll-view>

    <!-- 图片预览弹窗 -->
    <view v-if="showPreview" class="preview-overlay">
      <swiper
        :current="previewIndex"
        @change="onPreviewChange"
        circular
        class="preview-swiper"
      >
        <swiper-item
          v-for="(img, index) in images"
          :key="index"
          class="preview-swiper-item"
        >
          <image :src="img" mode="aspectFit" class="preview-image" />
        </swiper-item>
      </swiper>
      <view class="close-btn" @tap="showPreview = false">×</view>
      <view class="delete-btn" @tap="deletePreviewImage">删除</view>
    </view>

    <!-- 视频预览弹窗 -->
    <view v-if="showVideoPreview" class="video-preview-overlay">
      <video
        :src="video"
        controls
        muted
        autoplay
        class="video-preview-player"
      />
      <view class="close-btn" @tap="showVideoPreview = false">×</view>
      <view class="delete-video-btn" @tap.stop="removeVideo">删除</view>
    </view>

    <!-- 表单输入 -->
    <view class="form-item">
      <input v-model="title" placeholder="给游记取个合适的标题吧" class="title-input" maxlength="20" />
    </view>

    <view class="form-item">
      <textarea v-model="content" placeholder="添加正文" class="content-textarea" rows="15" maxlength="800" />
    </view>

    <view class="submit-wrapper">
      <button @tap="submit" :class="isAllRequiredFilled() ? 'submit-btn active' : 'submit-btn disabled'" class="submit-btn">发布</button>
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'

export default defineComponent({
  name: 'TravelEdit',
  setup() {
    const title = ref('')
    const content = ref('')
    const images = ref([])
    const video = ref('')
    const videoCover = ref('')
    const showPreview = ref(false)
    const showVideoPreview = ref(false)
    const previewIndex = ref(0)
    const isPublished = ref(false) // 新增状态标记是否已经发布
    const userData = Taro.getStorageSync('userinfo')
    
    const isAllRequiredFilled = () => {
      return title.value.trim() && content.value.trim()
    }
    console.log(userData.user_id)
    const chooseImages = () => {
      Taro.chooseImage({
        count: 9 - images.value.length,
        success: res => {
          images.value.push(...res.tempFilePaths)
        }
      })
    }

    const chooseVideo = () => {
      Taro.chooseVideo({
        success: res => {
          video.value = res.tempFilePath
          videoCover.value = res.thumbTempFilePath // 获取首帧封面
        }
      })
    }

    const removeVideo = () => {
      video.value = ''
      videoCover.value = ''
      showVideoPreview.value = false
    }

    const openPreview = index => {
      previewIndex.value = index
      showPreview.value = true
    }

    const onPreviewChange = e => {
      previewIndex.value = e.detail.current
    }

    const deletePreviewImage = () => {
      images.value.splice(previewIndex.value, 1)
      if (images.value.length === 0) {
        showPreview.value = false
      } else {
        previewIndex.value = Math.max(0, previewIndex.value - 1)
      }
    }

    const handleAddMedia = () => {
      Taro.showActionSheet({
        itemList: ['选择图片', '选择视频'],
        success: res => {
          if (res.tapIndex === 0) {
            if (video.value) {
              return Taro.showToast({
                title: '已添加视频，不能再选图片',
                icon: 'none'
              })
            }
            chooseImages()
          } else if (res.tapIndex === 1) {
            if (video.value) {
              return Taro.showToast({
                title: '最多只能选择一个视频',
                icon: 'none'
              })
            }
            if (images.value.length > 0) {
              return Taro.showToast({
                title: '已添加图片',
                icon: 'none'
              })
            }
            chooseVideo()
          }
        }
      })
    }
    const upload_image_video= async () => {
      const uploadedMedia = {
        images: [],
        video: null,
        videoCover: null
      }
      
      try {
        
        // 上传图片
        if (images.value.length > 0) {
          
          const imageUploads = images.value.map(filePath => 
            Taro.uploadFile({
              url: 'https://localhost:3000/api/travel-notes/upload-images',
              filePath: filePath,
              name: 'images',
              
            }).catch(err => {
              console.error('图片上传失败:', filePath, err)
              throw err
            })
          )
          
          const imageResults = await Promise.all(imageUploads)
          
          uploadedMedia.images = imageResults.map(res => {
            try {
              return JSON.parse(res.data).data
            } catch (parseError) {
              console.error('解析图片上传响应失败:', res.data, parseError)
              throw parseError
            }
          })
          
          if (uploadedMedia.images.length > 0) {
            uploadedMedia.videoCover = uploadedMedia.images[0][0].path
            
          }
        }
        
        // 上传视频
        if (video.value) {
          const videoRes = await Taro.uploadFile({
            url: 'https://localhost:3000/api/travel-notes/upload-video',
            filePath: video.value,
            name: 'video',
          }).catch(err => {
            console.error('视频上传失败:', video.value, err)
            throw err
          })
          console.log(videoRes)
          try {
            const videoData = JSON.parse(videoRes.data).data
            uploadedMedia.video = videoData.path
            
            if (uploadedMedia.images.length === 0) {
              uploadedMedia.videoCover = false
            }
          } catch (parseError) {
            console.error('解析视频上传响应失败:', videoRes.data, parseError)
            throw parseError
          }
        }
        
        return uploadedMedia
      } catch (error) {
        console.error('上传失败:', {
          error,
          images: images.value,
          video: video.value,
          videoCover: videoCover.value
        })
        throw error
      }
    }
    const submit = async () => {
      if (!title.value.trim()) {
        return Taro.showToast({ title: '请输入标题', icon: 'none' })
      }
      if (!content.value.trim()) {
        return Taro.showToast({ title: '请输入内容', icon: 'none' })
      }
      if (images.value.length === 0 && !video.value) {
        return Taro.showToast({ title: '请上传图片或视频', icon: 'none' })
      }
      
      const uploadedMedia = await upload_image_video()
      console.log('上传的媒体文件:', uploadedMedia.images)
      const submitRes = await Taro.request({
        url: 'https://localhost:3000/api/travel-notes/new',
        method: 'POST',
        data: {
          user_id:userData.user_id,
          title: title.value,
          content: content.value,
          images: uploadedMedia.images.map(img => img[0].path),
          video: uploadedMedia.video,
          video_cover: uploadedMedia.videoCover
        }
      })
      isPublished.value = true // 标记为已发布
      Taro.showLoading({ title: '发布中...' })
      setTimeout(() => {
        Taro.hideLoading()
        Taro.showToast({ title: '发布成功', icon: 'success' })
        clearDraft()
        Taro.redirectTo({
          url: '/pages/myTravel/index'
        })
      }, 1000)
    }

    const saveDraft = () => {
      Taro.setStorageSync('travel_draft', {
        title: title.value,
        content: content.value,
        images: images.value,
        video: video.value,
        videoCover: videoCover.value
      })
    }

    const loadDraft = () => {
      const draft = Taro.getStorageSync('travel_draft')
      if (draft) {
        title.value = draft.title
        content.value = draft.content
        images.value = draft.images
        video.value = draft.video
        videoCover.value = draft.videoCover
      }
    }

    const clearDraft = () => {
      Taro.removeStorageSync('travel_draft')
    }

    const confirmSaveDraft = () => {
      if (!isPublished.value && (title.value.trim() || content.value.trim() || images.value.length > 0 || video.value)) {
        Taro.showModal({
          title: '提示',
          content: '是否保留已编辑内容？',
          success: res => {
            if (res.confirm) {
              saveDraft()
            } else if (res.cancel) {
              clearDraft()
            }
          }
        })
      }
    }

    onMounted(() => {
      loadDraft()
      Taro.setNavigationBarTitle({
        title: '编辑'
      })
    })

    onUnmounted(() => {
      confirmSaveDraft()
    })

    return {
      title,
      content,
      images,
      video,
      videoCover,
      showPreview,
      showVideoPreview,
      previewIndex,
      chooseImages,
      chooseVideo,
      removeVideo,
      openPreview,
      onPreviewChange,
      deletePreviewImage,
      handleAddMedia,
      submit,
      isAllRequiredFilled
    }
  }
})
</script>

<style src="./style.css"></style>