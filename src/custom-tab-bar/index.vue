<template>
  
  <view class="tab-bar-container">
    <view class="tab-bar">
  
      <view 
        class="tab-item"
        @tap="switchTab(0, tabList[0].pagePath)"
      >
        <image 
          :src="currentTab === 0 ? tabList[0].selectedIconPath : tabList[0].iconPath"
          class="tab-icon"
        />
        <text 
          class="tab-text"
          :style="{ color: currentTab === 0 ? selectedColor : color }"
        >
          首页
        </text>
      </view>

      
      <view 
        class="tab-item center-tab"
        @tap="switchTab(1, tabList[1].pagePath)"
      >
        <view class="tab-icon add-icon"></view>
      </view>


      <view 
        class="tab-item"
        @tap="switchTab(2, tabList[2].pagePath)"
      >
        <image 
          :src="currentTab === 2 ? tabList[2].selectedIconPath : tabList[2].iconPath"
          class="tab-icon"
        />
        <text 
          class="tab-text"
          :style="{ color: currentTab === 2 ? selectedColor : color }"
        >
          我的
        </text>
      </view>
    </view>
  </view>
  
</template>

<script>
import { View } from '@tarojs/components'
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
        selectedIconPath: '/assets/images/home_active.png'
      },
      {
        text: '新建',
        pagePath: '/pages/new/index'
      },
      {
        text: '我的',
        pagePath: '/pages/my/index',
        iconPath: '/assets/images/my.png',
        selectedIconPath: '/assets/images/my_active.png'
      }
    ]

    const getCurrentPagePath = () => {
      const pages = Taro.getCurrentPages()
      const currentPage = pages[pages.length - 1]
      return '/' + currentPage.route
    }

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

</style>