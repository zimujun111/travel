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

    const isAllRequiredFilled = () => {
      return title.value.trim() && content.value.trim()
    }

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

    const submit = () => {
      if (!title.value.trim()) {
        return Taro.showToast({ title: '请输入标题', icon: 'none' })
      }
      if (!content.value.trim()) {
        return Taro.showToast({ title: '请输入内容', icon: 'none' })
      }
      if (images.value.length === 0 && !video.value) {
        return Taro.showToast({ title: '请上传图片或视频', icon: 'none' })
      }

      isPublished.value = true // 标记为已发布
      Taro.showLoading({ title: '保存中...' })
      
      // 获取路由参数判断是否为编辑模式
      const router = Taro.getCurrentInstance()?.router
      const isEditMode = router?.params?.item ? true : false
      
      setTimeout(() => {
        Taro.hideLoading()
        Taro.showToast({ 
          title: isEditMode ? '保存成功' : '发布成功', 
          icon: 'success',
          duration: 1500,
          success: () => {
            setTimeout(() => {
              clearDraft()
              Taro.navigateBack({
                delta: 1,
                success: () => {
                  console.log('返回成功');
                },
                fail: (err) => {
                  console.error('返回失败:', err);
                  // 如果返回失败，尝试使用switchTab
                  Taro.switchTab({
                    url: '/pages/myTravel/index'
                  });
                }
              });
            }, 500);
          }
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
      // 解析 url 参数，填充编辑内容
      const router = Taro.getCurrentInstance()?.router
      if (router && router.params && router.params.item) {
        try {
          const item = JSON.parse(decodeURIComponent(router.params.item))
          title.value = item.title || ''
          content.value = item.description || ''
          if (item.imageUrl) {
            images.value = [item.imageUrl]
          }
          // 设置页面标题为编辑模式
          Taro.setNavigationBarTitle({
            title: '编辑游记'
          })
        } catch (e) {
          console.error('解析编辑数据失败:', e)
          Taro.showToast({
            title: '加载数据失败',
            icon: 'none'
          })
        }
      } else {
        loadDraft()
        Taro.setNavigationBarTitle({
          title: '发布游记'
        })
      }
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