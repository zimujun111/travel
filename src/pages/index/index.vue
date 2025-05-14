<template>
  <Navbar @height-change="handleHeightChange" />
  <view class="travel" :style="{ marginTop: navbarFullHeight + 'px' }" >
    <view class="travel-left">
      <template v-for="(item, index) in list" :key="index">
        <item-data v-if="index % 2 === 0" :data="item" />
      </template>
    </view>
    <view class="travel-right">
      <template v-for="(item, index) in list" :key="index">
        <item-data v-if="index % 2 === 1" :data="item" />
      </template>
    </view>
  </view>
  <custom-tab-bar />
</template>

<script>
import { ref, onMounted,computed } from 'vue'
import ItemData from './item.vue'

import Navbar from '../../components/navbar/index.vue'
import CustomTabBar from '../../custom-tab-bar/index.vue'
import Taro  from '@tarojs/taro'
import { useTravelStore } from '../../stores/travelstores'

export default {
  components: {
    ItemData,
    Navbar,
    CustomTabBar
  },
  props: {
    option: {
      type: Object,
      default: () => ({})
    }
  },
  setup() {
    const navbarFullHeight = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    let startTime = Date.now()
    
    
    const handleHeightChange = (height) => {
      navbarFullHeight.value = height
    }
      const detailsClick = () => {
        Taro.navigateTo({
          url: '/pages/detail/index'
        })
      }
    const travelStore = useTravelStore()
    const list= computed(() =>travelStore.list)
    const total = computed(() =>travelStore.total)
    const totalPages= computed(() =>travelStore.totalPages)
    const isLoading = computed(() => travelStore.isLoading)
    const hasMore = computed(() => travelStore.hasMore)
    const fetchNotes = async () => {
      await travelStore.fetchNotes(currentPage.value, pageSize.value)
    }
     // 初始化加载
     const initLoad = async () => {
      await travelStore.fetchNotes(1, pageSize.value)
    }
    
    // 加载更多
    const loadMore = async () => {
      if (!isLoading.value && hasMore.value) {
        await travelStore.fetchNotes(travelStore.currentPage + 1, pageSize.value)
      }
    }
    onMounted(() => {
      fetchNotes()
      initLoad()
      const loadTime = Date.now() - startTime
      console.log('首屏渲染时间(ms):', loadTime)
     
    })
    
    Taro.useReachBottom(() => {
        console.log('触底了') 
        loadMore()
      })
    return {
      list,
      handleHeightChange,
      navbarFullHeight,
      detailsClick,
      fetchNotes,
      isLoading,
      hasMore,
      loadMore
    }
  }
}
</script>

<style>

page {
  padding: 10rpx;
  box-sizing: border-box;
  
}

.travel {
  display: flex;
  justify-content: space-between;
  border-top: 1rpx solid #f0f0f0; 
  background-color: rgba(0,0,0,0.03);
}

.travel-left, .travel-right {
  width: 49%;
}

.travel-item {
  margin: 10rpx auto 20rpx;
  background: #fff;
  width: 98%;
  border-radius: 20rpx;
  overflow: hidden;
}

.travel-item-img {
  width: 100%;
}

.travel-item-box {
  font-size: 24rpx;
  color: #333;
  padding: 8rpx 20rpx 20rpx 20rpx;
  box-sizing: border-box;
  
}

.travel-item-title {
  /* 一行省略 */
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.travel-item-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  font-size: 22rpx;
}

.travel-item-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 15rpx;
}
.user-info {
  display: flex;
  align-items: center; 
  gap: 5rpx; 
}

.user-name {
  white-space: nowrap; 
  color: #767676;
  font-size: 22rpx;
}
.travel-item-see {
  color: #767676;
  
  font-size: 22rpx;
}
.see-container {
  display: flex;
  align-items: center;
  gap: 6rpx; /* 图标和数字之间的间距 */
}

.eye-icon {
  width: 30rpx;
  height: 30rpx;
}

</style>