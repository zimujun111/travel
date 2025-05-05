<template>
  <view class="search-page">
    <view class="search-header">
      <view class="search-input-wrap">
        <image class="search-icon" src="../../assets/images/search.png" />
        <input
          class="search-input"
          type="text"
          v-model="searchText"
          placeholder="搜索游记"
          confirm-type="search"
          @confirm="handleSearch"
        />
      </view>
      <view class="cancel-btn" @tap="handleCancel">取消</view>
    </view>

    <view class="search-content">
      <view v-if="!searchText" class="search-history">
        <view class="history-header">
          <text class="history-title">搜索历史</text>
          <image class="delete-icon" src="../../assets/images/history.png" @tap="clearHistory" />
        </view>
        <view class="history-list">
          <view
            v-for="(item, index) in searchHistory"
            :key="index"
            class="history-item"
            @tap="handleHistoryClick(item)"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <view v-else class="search-results">
        <view v-if="searchResults.length > 0" class="result-list">
          <view
            v-for="(item, index) in searchResults"
            :key="index"
            class="result-item"
            @tap="handleResultClick(item)"
          >
            <image class="result-image" :src="item.image_url" mode="aspectFill" />
            <view class="result-info">
              <text class="result-title">{{ item.title }}</text>
              <view class="result-meta">
                <text class="result-author">{{ item.username }}</text>
                <text class="result-likes">{{ item.likes }} 赞</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="no-result">
          <text>暂无搜索结果</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'

export default {
  name: 'SearchPage',
  config: {
    navigationBarTitleText: '搜索'
  },
  setup() {
    const searchText = ref('')
    const searchHistory = ref([])
    const searchResults = ref([])

    // 从本地存储加载搜索历史
    onMounted(() => {
      const history = Taro.getStorageSync('searchHistory')
      if (history) {
        searchHistory.value = JSON.parse(history)
      }
    })

    // 处理搜索
    const handleSearch = () => {
      if (!searchText.value.trim()) return
      
      // 保存搜索历史
      if (!searchHistory.value.includes(searchText.value)) {
        searchHistory.value.unshift(searchText.value)
        if (searchHistory.value.length > 10) {
          searchHistory.value.pop()
        }
        Taro.setStorageSync('searchHistory', JSON.stringify(searchHistory.value))
      }

      // TODO: 实现搜索逻辑
      searchResults.value = []
    }

    // 处理取消
    const handleCancel = () => {
      Taro.navigateBack()
    }

    // 清空历史记录
    const clearHistory = () => {
      searchHistory.value = []
      Taro.removeStorageSync('searchHistory')
    }

    // 点击历史记录
    const handleHistoryClick = (item) => {
      searchText.value = item
      handleSearch()
    }

    // 点击搜索结果
    const handleResultClick = (item) => {
      // TODO: 跳转到详情页
      console.log('点击搜索结果:', item)
    }

    return {
      searchText,
      searchHistory,
      searchResults,
      handleSearch,
      handleCancel,
      clearHistory,
      handleHistoryClick,
      handleResultClick
    }
  }
}
</script>

<style>
.search-page {
  min-height: 100vh;
  background-color: #fff;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 72rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 20rpx;
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
}

.cancel-btn {
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #666;
}

.search-content {
  padding: 20rpx;
}

.search-history {
  margin-top: 20rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.history-title {
  font-size: 28rpx;
  color: #333;
}

.delete-icon {
  width: 32rpx;
  height: 32rpx;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
}

.history-item {
  padding: 10rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #666;
  margin: 0 20rpx 20rpx 0;
}

.search-results {
  margin-top: 20rpx;
}

.result-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.result-image {
  width: 200rpx;
  height: 150rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.result-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.result-meta {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
}

.no-result {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>