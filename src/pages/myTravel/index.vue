<template>
  <view class="container">
    <view class="page-body">
      <view class="page-section">
        <view class="page-section-spacing">
          <!-- 列表区域 -->
          <scroll-view 
            :scroll-y="true" 
            style="height: 100vh;" 
            class="card-scroll-view"
            @scrolltolower="loadMore"
            scroll-top="{{scrollTop}}"
          >
            <view class="card-list">
              <view class="card-item" v-for="item in listData" :key="item.id">
                <!-- 卡片内容 -->
                <view class="card-content">
                  <!-- 左侧图片 -->
                  <view class="card-image-container">
                    <image :src="item.imageUrl" mode="aspectFill" class="card-image"></image>
                  </view>
                  
                  <!-- 右侧内容 -->
                  <view class="card-info">
                    <view class="card-title">{{ item.title }}</view>
                    <view class="card-desc">{{ item.description }}</view>
                  </view>
                </view>
                
                <!-- 底部按钮 -->
                <view class="card-actions">
                  <button class="action-btn passed-btn" @click="handlePass(item.id)">
                    <text class="btn-text">已通过</text>
                  </button>
                  <button class="action-btn delete-btn" @click="handleDelete(item.id)">
                    <text class="btn-text">删除</text>
                  </button>
                  <button class="action-btn edit-btn" @click="handleEdit(item.id)">
                    <text class="btn-text">编辑</text>
                  </button>
                </view>
              </view>
              
              <!-- 加载更多指示器 -->
              <view class="loading-indicator" v-if="isLoading">
                <text>加载更多...</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ListCard',
  data() {
    return {
      // 模拟数据
      listData: [
        {
          id: 1,
          title: '项目名称一',
          description: '这是一个关于项目一的详细描述，包含了项目的主要内容和特点...',
          imageUrl: 'https://picsum.photos/seed/item1/200/200'
        },
        {
          id: 2,
          title: '项目名称二',
          description: '这是项目二的详细介绍，展示了该项目的核心功能和优势...',
          imageUrl: 'https://picsum.photos/seed/item2/200/200'
        },
        {
          id: 3,
          title: '项目名称三',
          description: '项目三是一个创新型应用，专注于解决用户的特定需求...',
          imageUrl: 'https://picsum.photos/seed/item3/200/200'
        },
        {
          id: 4,
          title: '项目名称四',
          description: '项目四采用了最新的技术架构，提供高效稳定的服务体验...',
          imageUrl: 'https://picsum.photos/seed/item4/200/200'
        },
        {
          id: 5,
          title: '项目名称五',
          description: '这是一个综合性项目，涵盖了多个领域的功能和应用场景...',
          imageUrl: 'https://picsum.photos/seed/item5/200/200'
        },
        {
          id: 6,
          title: '项目名称六',
          description: '项目六致力于推动行业发展，提供创新性的解决方案...',
          imageUrl: 'https://picsum.photos/seed/item6/200/200'
        }
      ],
      
      // 滚动控制
      scrollTop: 0,
      isLoading: false, // 加载状态
      hasMore: true, // 是否还有更多数据
      page: 1 // 当前加载的页数
    }
  },
  
  methods: {
    // 处理通过
    handlePass(id) {
      console.log(`通过项目: ${id}`);
      // 这里可以添加通过项目的逻辑
    },
    
    // 处理删除
    handleDelete(id) {
      console.log(`删除项目: ${id}`);
      // 显示确认对话框
      Taro.showModal({
        title: '确认删除',
        content: '确定要删除这个项目吗？',
        success: (res) => {
          if (res.confirm) {
            // 从列表中删除项目
            this.listData = this.listData.filter(item => item.id !== id);
          }
        }
      });
    },
    
    // 处理编辑
    handleEdit(id) {
      console.log(`编辑项目: ${id}`);
      // 这里可以添加编辑项目的逻辑
      Taro.navigateTo({
        url: `/pages/edit?id=${id}`
      });
    },
    
    // 滚动到底部加载更多
    loadMore() {
      if (this.isLoading || !this.hasMore) return;
      
      this.isLoading = true;
      
      // 模拟加载更多数据
      setTimeout(() => {
        const newData = [
          {
            id: 7,
            title: '项目名称七',
            description: '项目七是一个跨平台应用，支持多种设备访问...',
            imageUrl: 'https://picsum.photos/seed/item7/200/200'
          },
          {
            id: 8,
            title: '项目名称八',
            description: '这是一个人工智能驱动的项目，提供智能推荐和预测功能...',
            imageUrl: 'https://picsum.photos/seed/item8/200/200'
          }
        ];
        
        this.listData = [...this.listData, ...newData];
        this.isLoading = false;
        this.page++;
        
        // 如果数据不足，则认为没有更多数据
        if (newData.length < 2) {
          this.hasMore = false;
        }
      }, 1500);
    },
    
    // 滚动到顶部回调
    upper(e) {
      console.log('滚动到顶部:', e);
    },
    
    // 滚动过程回调
    scroll(e) {
      // 可以在这里添加滚动过程中的逻辑
    }
  }
}
</script>

<style>
/* 基础样式 */
.container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 30rpx;
}

.page-section-spacing {
  margin-top: 30rpx;
}

/* 滚动视图样式 */
.card-scroll-view {
  width: 100%;
}

/* 卡片列表样式 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  padding-bottom: 100rpx; /* 底部留出空间 */
}

/* 卡片项样式 */
.card-item {
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card-item:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
}

/* 卡片内容样式 */
.card-content {
  display: flex;
  padding: 30rpx;
}

.card-image-container {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
  overflow: hidden;
  margin-right: 30rpx;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-image:hover {
  transform: scale(1.05);
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 15rpx;
  line-height: 1.3;
}

.card-desc {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 卡片操作按钮样式 */
.card-actions {
  display: flex;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  border-radius: 8rpx;
  margin: 0 10rpx;
  transition: background-color 0.2s;
}

.passed-btn {
  color: #10b981;
  border: 1rpx solid #10b981;
  background-color: #f0fdf4;
}

.passed-btn:hover {
  background-color: #dcfce7;
}

.delete-btn {
  color: #ef4444;
  border: 1rpx solid #ef4444;
  background-color: #fef2f2;
}

.delete-btn:hover {
  background-color: #fee2e2;
}

.edit-btn {
  color: #3b82f6;
  border: 1rpx solid #3b82f6;
  background-color: #eff6ff;
}

.edit-btn:hover {
  background-color: #dbeafe;
}

.btn-text {
  display: block;
}

/* 加载更多指示器样式 */
.loading-indicator {
  text-align: center;
  padding: 40rpx 0;
  color: #666;
  font-size: 28rpx;
}
</style>  