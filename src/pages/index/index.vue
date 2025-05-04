<template>
  
  <scroll-view
    scroll-y
    :show-scrollbar="false"
    :scroll-into-view="intoView"
    class="scroll-view"
    @scrolltolower="bindSrollToLower"
    :style="{ marginTop: `${menuTop}px` }"
   
  >
    <sticky-section :push-pinned-header="false">
      <sticky-header>
        <view class="sticky-header">
          <view
            class="search"
            :style="{
              height: `${menuHeight}px`,
              lineHeight: `${menuHeight}px`,
              marginRight: `${menuLeft}px`,
              padding:'5px 0px 0px 10px'
            }"
          >
            <input placeholder="搜索游记" />
          </view>
        </view>
      </sticky-header>
      
    </sticky-section>

    <sticky-section :push-pinned-header="false">
      <sticky-header>
        <view class="sticky-header">
          <view class="sticky-header-child">
            <view class="mini-head current">自然风景</view>
            <view class="mini-head">周边旅游</view>
            <view class="mini-head">温泉</view>
            <view class="mini-head">玩雪</view>
            <view class="mini-head">海边</view>
          </view>
        </view>
      </sticky-header>

      <grid-view
        type="masonry"
        :cross-axis-count="crossAxisCount"
        :cross-axis-gap="crossAxisGap"
        :main-axis-gap="mainAxisGap"
        class="masonry-grid"
      >
        <view v-for="(item, index) in bottomList" :key="index" class="grid-box">
          <image :src="item.image_url" mode="widthFix" />

          <view class="content-box">
            <text>这里的风景好美～</text>

            <view class="profile-text">
              <view class="left">
                <image
                  src="https://res.wx.qq.com/op_res/lS41C5Xp6y6mfUbelCW8PArEcMwWRuhSohPO46vAiELbhAf56_CwONEDgM2vIVxOlT5KDcSxCkV8xIJ6cg3x2Q"
                />
                <text>binnie</text>
              </view>
              <view class="right">
                <image
                  src="../../assets/images/like.png"
                />
                <text>666</text>
              </view>
            </view>
          </view>
        </view>
      </grid-view>
    </sticky-section>
  </scroll-view>
  <custom-tab-bar />
</template>
<script>
  import { reactive, onMounted ,toRefs} from 'vue'
import { getLandscapeImages } from './data'
import Taro from '@tarojs/taro'
import CustomTabBar from '../../custom-tab-bar/index.vue'
function getNewList() {
  const newList = new Array(20).fill(0)
  const imgUrlList = getLandscapeImages()
  let count = 0
  for (let i = 0; i < newList.length; i++) {
    newList[i] = {
      id: i + 1,
      title: `scroll-view`,
      desc: `默认只会渲染在屏节点，会根据直接子节点是否在屏来按需渲染`,
      time: `19:20`,
      like: 88,
      image_url: imgUrlList[count++ % imgUrlList.length]
    }
  }
  return newList
}

export default {
  components: {
    
    CustomTabBar
  },
  setup() {
    const state = reactive({
      // 顶部列表数据
      topList: new Array(15).fill(0),
      // 底部列表数据
      bottomList: getNewList(),

      // 网络布局参数
      crossAxisCount: 2,
      crossAxisGap: 8,
      mainAxisGap: 8,

      // 顶部布局参数
      menuTop: 0,
      menuHeight: 0,
      menuLeft: 0,
      intoView: ''
    })

    const bindSrollToLower = () => {
      state.bottomList = state.bottomList.concat(getNewList())
    }

    onMounted(() => {
      const res = Taro.getMenuButtonBoundingClientRect()
      state.menuTop = res.top
      state.menuHeight = res.height-5
      state.menuLeft = res.width - 25
    })

    return {
      ...toRefs(state),
      bindSrollToLower
    }
  }
}
</script>
<style>
  .scroll-view {
  width: 100%;
  height: 100%;
}

.search {
  border: rgb(228, 226, 226) solid 1px;
  border-radius: 20px;
  margin: 0 10px;
  line-height: 30px;
  height: 30px;
}

.search input {
  padding: 0 10px;
  line-height: 30px;
  height: 30px;
}

.top-list {
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  padding-top: 10px;
  flex-direction: column;
}

.top-list image {
  width: 15vw;
  height: 15vw;
  border-radius: 50%;
}

.top-list text {
  padding: 10px 0;
  font-size: 14px;
}

.sticky-header {
  background-color: #fff;
}

.sticky-header-child {
  display: flex;
  flex-direction: row;
  margin-left: 10px;
}

.mini-head {
  display: flex;
  background-color: #f5f5f5;
  margin: 8px 6px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 25rpx;
}

.current {
  background-color: #07c160;
  color: #fff;
}

.grid-box {
  
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
  padding-bottom: 10rpx;
  font-size: 28rpx;
}

.grid-box image {
  width: 100%;
  
}

.content-box {
  padding-left: 10rpx;
}

.profile-text {
  display: flex;
  flex-direction: row;
  padding-top: 4px;
  align-items: center;
  
}

.profile-text view {
  display: flex;
  color: #888;
  
  flex-direction: row;
  align-items: center;
}

.profile-text .left {
  width: 80%;
}

.left image {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 4px;
}

.profile-text .right {
  text-align: right;
  color: #888;
  font-size: 14px;
}

.right image {
  width: 30px;
  height: 30px;
  background-size: cover;
  opacity: 0.5;
  color: rgba(0, 0, 0, 0.7);
  margin: 0 3px;
}
.masonry-grid {
  padding: 0 15rpx;
}
</style>