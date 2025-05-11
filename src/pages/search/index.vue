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
        <view v-if="loading" class="loading">
          <text>搜索中...</text>
        </view>
        
        <view v-else-if="searchResults.length > 0" class="result-list">
          <view
            v-for="(item, index) in searchResults"
            :key="index"
            class="result-item"
            @tap="handleResultClick(item)"
          >
            <image class="result-image" :src="`https://localhost:3000${item.cover_image}` || '../../assets/images/default.jpg'" mode="aspectFill" />
            <view class="result-info">
              <text class="result-title">{{ item.title }}</text>
              <view class="result-meta">
                <text class="result-author">{{ item.username }}</text>
                <view class="result-views-content">
                  <image src="../../assets/images/see.png" class="eye-icon" />
                  <text class="result-likes">{{ item.view_count }}</text>
                </view>
                
              </view>
            </view>
          </view>
          
          <view v-if="hasMore" class="load-more" @tap="loadMore">
            <text>加载更多</text>
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
    const loading = ref(false)
    const currentPage = ref(1)
    const hasMore = ref(false)
    const pageSize = 10

    // 从本地存储加载搜索历史
    onMounted(() => {
      const history = Taro.getStorageSync('searchHistory')
      if (history) {
        searchHistory.value = JSON.parse(history)
      }
    })

    // 搜索API调用
    const fetchSearchResults = async (keyword, page = 1) => {
      console.log(keyword)
      try {
        loading.value = true
        const response = await Taro.request({
          url: 'https://localhost:3000/api/search',
          method: 'GET',
          data: {
            q: keyword,
            page,
            pageSize
          }
        })
      
        if (response.statusCode === 200) {
          return response.data
        } else {
          throw new Error(response.data.message || '搜索失败')
        }
      } catch (error) {
        Taro.showToast({
          title: error.message || '网络错误',
          icon: 'none'
        })
        return null
      } finally {
        loading.value = false
      }
    }

    // 处理搜索
    const handleSearch = async () => {
      if (!searchText.value.trim()) return
      
      // 保存搜索历史
      if (!searchHistory.value.includes(searchText.value)) {
        searchHistory.value.unshift(searchText.value)
        if (searchHistory.value.length > 10) {
          searchHistory.value.pop()
        }
        Taro.setStorageSync('searchHistory', JSON.stringify(searchHistory.value))
      }
      
      currentPage.value = 1
      const result = await fetchSearchResults(searchText.value, currentPage.value)
      console.log(result)
      if (result) {
        searchResults.value = result.data
        hasMore.value = result.pagination.totalPages > currentPage.value
      }
    }

    // 加载更多
    const loadMore = async () => {
      if (!hasMore.value || loading.value) return
      
      currentPage.value += 1
      const result = await fetchSearchResults(searchText.value, currentPage.value)
      
      if (result) {
        searchResults.value = [...searchResults.value, ...result.data]
        hasMore.value = result.pagination.totalPages > currentPage.value
      }
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
      Taro.navigateTo({
        url: `/pages/detail/index?note_id=${item.note_id}`
      })
    }

    return {
      searchText,
      searchHistory,
      searchResults,
      loading,
      hasMore,
      handleSearch,
      handleCancel,
      clearHistory,
      handleHistoryClick,
      handleResultClick,
      loadMore
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
.eye-icon {
  width: 30rpx;
  height: 30rpx;
  margin-right: 5rpx;
  justify-content: center;
  align-items: center;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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

.loading {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

.load-more {
  text-align: center;
  padding: 30rpx 0;
  color: #666;
  font-size: 28rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  margin-top: 20rpx;
}
.result-views-content{
  margin-right: 20rpx;
  display: flex;
}
</style>