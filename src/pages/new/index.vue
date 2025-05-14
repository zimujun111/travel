<template>

  <view class="index">

    <!-- 图片或视频预览区域 -->
    <scroll-view class="scroll-view_H" :scroll-x="true" style="width: 100%">
      <template v-if="images.length > 0">
        <view
          v-for="(img, index) in images"
          :key="index"
          class="scroll-view-item_H"
        >
          <image :src="img" mode="aspectFill" @tap="openPreview(index)" />
          
          <!-- 覆盖在图片上的"封面"标签 -->
          <view v-if="index === 0" class="cover-tag">封面</view>

          <!-- 删除按钮 -->
          <view class="delete-icon" @tap.stop="deleteImage(index)">×</view>
        </view>

      </template>
      <template v-else-if="video">
        <view class="scroll-view-item_H video-wrapper">
          <image :src="videoCover || video" class="video-cover" mode="aspectFill" @tap="showVideoPreview = true" />
          <view class="play-icon">▶</view>
          <!-- 删除按钮 -->
          <view class="delete-icon" @tap.stop="removeVideo">×</view>
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

    <view class="form-item topic-section">
      <view class="topic-row">
        <view class="topic-btn" @tap="selectTopic"># 话题</view>
        <view class="selected-topics-container">
          <view class="selected-topic" v-for="(topic, index) in selectedTopics" :key="index">
            <text>{{ topic }}</text>
            <text class="remove-icon" @tap="removeTopic(index)">×</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 新增社区规则勾选 -->
    <view class="rule-row">
      <view class="rule-checkbox" @tap="toggleRuleAgree">
        <view :class="['circle', ruleAgreed ? 'checked' : '']"></view>
      </view>
      <text class="rule-text">阅读并同意</text>
      <text class="rule-link" @tap="showRuleModal">《社区发布规则》</text>
    </view>

    <view v-if="showRule" class="rule-modal-overlay">
      <view class="rule-modal">
        <view class="rule-modal-title">社区发布规则</view>
        <scroll-view class="rule-modal-content" scroll-y>
          <view>1. 禁止发布违法违规内容；</view>
          <view>2. 禁止广告、刷屏、恶意引流；</view>
          <view>3. 尊重他人，禁止人身攻击、歧视等；</view>
          <view>4. 其他详细规则请见社区公告。</view>
        </scroll-view>
        <view class="rule-modal-btn" @tap="showRule = false">我知道了</view>
      </view>
    </view>

    <view class="submit-wrapper">
<!-- 
      <view class="icon-placeholder">
  <image src="../../assets/images/draft.png" class="icon-img" />
</view> -->
      <button @tap="submit" :class="isAllRequiredFilled() ? 'submit-btn active' : 'submit-btn disabled'" class="submit-btn">发布</button>
    </view>
  </view>
</template>


<script>
import Taro from '@tarojs/taro'
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue'

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
    const item = ref(null) // 新增的 item 变量，用于存储编辑的游记数据
    const selectedTopics = ref([])
    const searchKeyword = ref('')
    const ruleAgreed = ref(false)
    const showRule = ref(false)
    const allTopics = ['美食', '风景', '亲子', '自驾', '摄影', '历史', '人文','旅行','北京旅游','上海旅游']
    
    const filteredTopics = computed(() => {
      return allTopics.filter(topic => 
        !selectedTopics.value.includes(topic) && 
        topic.includes(searchKeyword.value)
      )
    })
    
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
    const upload_image_video = async () => {
      const uploadedMedia = {
        images: [], // 这里存储最终要提交给后端的图片路径数组
        video: null,
        videoCover: null
      }

  try {
    // 上传图片
    if (images.value.length > 0) {
      const imageUploads = images.value.map(async (filePath) => {
        console.log(filePath)
        if (filePath.startsWith('https://localhost')) {
          // 提取相对路径部分（去掉域名）
          const url = new URL(filePath);
          console.log(1)
          return url.pathname + (url.search || '') + (url.hash || '');
          
        } else {
          console.log(filePath)
          const uploadRes = await Taro.uploadFile({
            url: 'https://localhost:3000/api/travel-notes/upload-images',
            filePath: filePath,
            name: 'images',
          }).catch(err => {
            console.error('图片上传失败:', filePath, err);
            throw err;
          });
          
          try {
            const data = JSON.parse(uploadRes.data);
            return data.data[0]?.path || data.data?.path || data.path;
          } catch (parseError) {
            console.error('解析图片上传响应失败:', uploadRes.data, parseError);
            throw parseError;
          }
        }
      });

      uploadedMedia.images = await Promise.all(imageUploads);
      
      // 设置封面（取第一张图片）
      if (uploadedMedia.images.length > 0) {
        uploadedMedia.videoCover = uploadedMedia.images[0];
      }
    }

    // 上传视频（如果有）
    if (video.value) {
      // 如果是网络视频（已存在的视频），直接返回路径
      if (video.value.startsWith('https://localhost')) {
        const url = new URL(video.value);
        uploadedMedia.video = url.pathname + (url.search || '') + (url.hash || '');

        if (videoCover.value.startsWith('https://localhost')) {
          const coverUrl = new URL(videoCover.value);
          uploadedMedia.videoCover = coverUrl.pathname + (coverUrl.search || '') + (coverUrl.hash || '');

        return uploadedMedia
      } 
    
    
      } else {
        // 新视频需要上传
        const videoRes = await Taro.uploadFile({
          url: 'https://localhost:3000/api/travel-notes/upload-video',
          filePath: video.value,
          name: 'video',
        }).catch(err => {
          console.error('视频上传失败:', video.value, err);
          throw err;
        });

        try {
          const data = JSON.parse(videoRes.data);
          uploadedMedia.video = data.data?.path || data.path;
           
        } catch (parseError) {
          console.error('解析视频上传响应失败:', videoRes.data, parseError);
          throw parseError;
        }
          
         
      }
    }

    return uploadedMedia;
  } catch (error) {
    console.error('上传失败:', {
      error,
      images: images.value,
      video: video.value,
      videoCover: videoCover.value
    });
    throw error;
  }
}

const submit = async () => {
  // 获取路由参数判断是否为编辑模式
  const router = Taro.getCurrentInstance()?.router;
  const isEditMode = router?.params?.item ? true : false;
  
  if (!title.value.trim()) {
    return Taro.showToast({ title: '请输入标题', icon: 'none' });
  }
  if (!content.value.trim()) {
    return Taro.showToast({ title: '请输入内容', icon: 'none' });
  }
  if (images.value.length === 0 && !video.value) {
    return Taro.showToast({ title: '请上传图片或视频', icon: 'none' });
  }
  
  Taro.showLoading({ title: '处理中...' });
  
  try {
    const uploadedMedia = await upload_image_video();
    console.log('上传的媒体文件:', uploadedMedia);
    
    // 准备提交数据
    const submitData = isEditMode 
    ?{
      user_id: userData.user_id,
      title: title.value,
      content: content.value,
      images: uploadedMedia.images,
      video: uploadedMedia.video,
      video_cover: uploadedMedia.videoCover,
      note_id:item.value.note_id

    }: {
      user_id: userData.user_id,
      title: title.value,
      content: content.value,
      images: uploadedMedia.images,
      video: uploadedMedia.video,
      video_cover: uploadedMedia.videoCover
    }
    ;
    
    // 根据编辑/发布模式选择不同API
    const apiUrl = isEditMode 
      ? 'https://localhost:3000/api/travel-notes/new_edit' 
      : 'https://localhost:3000/api/travel-notes/new';
    
    const submitRes = await Taro.request({
      url: apiUrl,
      method: 'POST',
      data: submitData
    });
    
    isPublished.value = true;
    Taro.hideLoading();
    
    Taro.showToast({ 
      title: isEditMode ? '保存成功' : '发布成功', 
      icon: 'success',
      duration: 1500,
      success: () => {
        setTimeout(() => {
          clearDraft();
          Taro.navigateBack({
            delta: 1,
            success: () => console.log('返回成功'),
            fail: (err) => {
              console.error('返回失败:', err);
              Taro.switchTab({ url: '/pages/myTravel/index' });
            }
          });
        }, 500);
      }
    });
  } catch (error) {
    Taro.hideLoading();
    Taro.showToast({
      title: error.message || '操作失败',
      icon: 'none',
      duration: 3000
    });
    console.error('提交失败:', error);
  }
};

    const saveDraft = () => {
      Taro.setStorageSync('travel_draft', {
        title: title.value,
        content: content.value,
        images: images.value,
        video: video.value,
        videoCover: videoCover.value,
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

    const deleteImage = (index) => {
      images.value.splice(index, 1)
    }

    const selectTopic = () => {
      // 过滤掉已选话题
      const availableTopics = allTopics.filter(t => !selectedTopics.value.includes(t))
      
      if (availableTopics.length === 0) {
        Taro.showToast({
          title: '已选择所有话题',
          icon: 'none'
        })
        return
      }

      // 准备操作表选项：搜索 + 默认话题（最多显示5个）
      const actionSheetItems = ['搜索话题', ...availableTopics.slice(0, 5)]

      Taro.showActionSheet({
        itemList: actionSheetItems,
        success: res => {
          if (res.tapIndex === 0) {
            // 点击搜索话题
            Taro.showModal({
              title: '搜索话题',
              editable: true,
              placeholderText: '请输入话题关键词',
              success: modalRes => {
                if (modalRes.confirm) {
                  searchKeyword.value = modalRes.content
                  const filteredResults = filteredTopics.value
                  
                  if (filteredResults.length === 0) {
                    Taro.showToast({
                      title: '未找到相关话题',
                      icon: 'none'
                    })
                    return
                  }

                  // 显示搜索结果
                  Taro.showActionSheet({
                    itemList: filteredResults,
                    success: actionRes => {
                      if (actionRes.tapIndex >= 0) {
                        const selectedTopic = filteredResults[actionRes.tapIndex]
                        if (selectedTopic) {
                          selectedTopics.value.push(selectedTopic)
                        }
                      }
                    },
                    fail: (err) => {
                      console.error('未选择话题:', err)
                      
                    }
                  })
                }
              }
            })
          } else {
            // 点击默认话题
            const selectedTopic = availableTopics[res.tapIndex - 1]
            if (selectedTopic) {
              selectedTopics.value.push(selectedTopic)
            }
          }
        },
        fail: (err) => {
          console.error('选择话题失败:', err)
          Taro.showToast({
            title: '选择话题失败',
            icon: 'none'
          })
        }
      })
    }

    const removeTopic = (index) => {
      selectedTopics.value.splice(index, 1)
    }

    const toggleRuleAgree = () => {
      ruleAgreed.value = !ruleAgreed.value
    }

    const showRuleModal = () => {
      showRule.value = true
    }

    onMounted(() => {
      // 解析 url 参数，填充编辑内容
      const router = Taro.getCurrentInstance()?.router
      if (router && router.params && router.params.item) {
        try {
          item.value = JSON.parse(decodeURIComponent(router.params.item))
          title.value = item.value.title || ''
          content.value = item.value.content || ''
          //有bug
          if (item.value.images.length==1) {
            const firstMedia = item.value.images[0].url;
            const isVideo = /\.(mp4|mov|avi|mkv|webm|flv)$/i.test(firstMedia);

            if (isVideo) {
             // 单视频：设置视频和封面
              video.value = `https://localhost:3000${firstMedia}`;
              videoCover.value = item.value.cover_image 
                ? `https://localhost:3000${item.value.cover_image}` 
                : ''; // 如果没有封面，后续可以用默认图
            } else {
              images.value = item.value.images[0].url
            }
          }else if(item.value.images){
            images.value = item.value.images.map(img => `https://localhost:3000${img.url}`)
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
      isAllRequiredFilled,
      deleteImage,
      selectedTopics,
      selectTopic,
      removeTopic,
      ruleAgreed,
      showRule,
      toggleRuleAgree,
      showRuleModal
    }
  }
})
</script>

<style>
.topic-section {
  margin-top: 20px;
}
.topic-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.topic-btn {
  background: #e6f7ff;
  color: #333;
  border-radius: 28px;
  padding: 12px 28px;
  font-size: 20px;
  min-width: auto;
  width: auto;
  line-height: 1.5;
  height: auto;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
.selected-topics-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.selected-topic {
  display: flex;
  align-items: center;
  background: #e6f7ff;
  border-radius: 28px;
  padding: 12px 28px;
  font-size: 20px;
  line-height: 1.5;
  
}
.remove-icon {
  margin-left: 12px;
  font-weight: bold;
  cursor: pointer;
  font-size: 22px;
}
.rule-row {
  display: flex;
  align-items: center;
  margin-top: 18px;
  font-size: 20px;
  color: #bbb;
}
.rule-checkbox {
  width: 32px;
  height: 32px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #ddd;
  background: #fff;
  position: relative;
}
.circle.checked {
  border: 2px solid #1890ff;
  background: #1890ff;
}
.circle.checked::after {
  content: '';
  display: none;
}
.circle.checked::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 0px;
  width: 10px;
  height: 18px;
  border: solid #fff;
  border-width: 0 4px 4px 0;
  display: block;
  transform: rotate(45deg);
}
.rule-text {
  color: #bbb;
  font-size: 20px;
}
.rule-link {
  color: #1890ff;
  font-size: 20px;
  margin-left: 8px;
  text-decoration: none;
  cursor: pointer;
}
.rule-modal-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rule-modal {
  background: #fff;
  border-radius: 12px;
  width: 80vw;
  max-width: 400px;
  padding: 24px 18px 12px 18px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.rule-modal-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #222;
}
.rule-modal-content {
  max-height: 200px;
  font-size: 15px;
  color: #444;
  margin-bottom: 18px;
}
.rule-modal-btn {
  width: 100%;
  background: #319cd4;
  color: #fff;
  text-align: center;
  border-radius: 8px;
  padding: 10px 0;
  font-size: 16px;
  margin-top: 8px;
  cursor: pointer;
}

.icon-img {
  width: 40px;
  height: 40px;
  display: block;
  margin-left: 50px;
}
</style>

<style src="./style.css"></style>