<template>
    <view class="tab-bar-container">
      <view class="tab-bar">
        <view 
          v-for="(item, index) in tabList" 
          :key="index"
          class="tab-item"
          @tap="switchTab(index, item.pagePath)"
        >
          <image 
            :src="currentTab === index ? item.selectedIconPath : item.iconPath"
            class="tab-icon"
          />
          <text 
            class="tab-text"
            :style="{ color: currentTab === index ? selectedColor : color }"
          >
            {{ item.text }}
          </text>
        </view>
      </view>
    </view>
  </template>

<script>
import Taro, { useDidShow } from '@tarojs/taro'
import { ref, onMounted } from 'vue'

export default {
  name: 'CustomTabBar',
  setup() {
    const currentTab = ref(0)
    const color = '#999'
    const selectedColor = '#1296db'

    const tabList = [
      {
        text: '首页',
        pagePath: '/pages/index/index',
        iconPath: '/assets/images/home.png',
        selectedIconPath: '/assets/images/home.png'
      },
      {
        text: '新建',
        pagePath: '/pages/new/index',
        iconPath: '/assets/images/home.png',
        selectedIconPath:'/assets/images/home.png'
      },
      {
        text: '我的',
        pagePath: '/pages/my/index',
        iconPath: '/assets/images/home.png',
        selectedIconPath: '/assets/images/home.png'
      }
    ]

    // 获取当前页面路径
    const getCurrentPagePath = () => {
      const pages = Taro.getCurrentPages()
      const currentPage = pages[pages.length - 1]
      return '/' + currentPage.route
    }

    // 根据当前页面路径设置选中状态
    const setSelectedTab = () => {
      const currentPath = getCurrentPagePath()
      const index = tabList.findIndex(item => item.pagePath === currentPath)
      if (index !== -1) {
        currentTab.value = index
      }
    }

    const switchTab = (index, url) => {
      if (currentTab.value === index) return
      currentTab.value = index
      Taro.switchTab({ 
        url,
        success: () => {
          setSelectedTab()
        }
      })
    }

    onMounted(() => {
      setSelectedTab()
    })

    // 使用 Taro 的 useDidShow 替代 Vue 的 onShow
    useDidShow(() => {
      setSelectedTab()
    })

    return { 
      currentTab, 
      color, 
      selectedColor, 
      tabList, 
      switchTab 
    }
  }
}
</script>

<style>
/* 添加 scoped 确保样式不会影响其他组件 */

</style>