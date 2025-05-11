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
            scroll-top="{{scrollTop}}"
          >
            <view class="card-list-wrapper">
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
                    <button class="action-btn passed-btn" @tap="handlePass(item.id)">
                      <text class="btn-text">已通过</text>
                    </button>
                    <button class="action-btn delete-btn" @tap="handleDelete(item.id)">
                      <text class="btn-text">删除</text>
                    </button>
                    <button class="action-btn edit-btn" @tap="handleEdit(item)">
                      <text class="btn-text">编辑</text>
                    </button>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'

export default {
  name: 'ListCard',
  data() {
    return {
      // 模拟数据
      listData: [
      {
        "id": 1,
        "title": "桂林漓江风情游",
        "description": "沿着桂林漓江顺流而下，两岸奇峰罗列，江水清澈见底，仿佛一幅天然的水墨画卷在眼前徐徐展开。竹筏飘荡在江上，渔夫悠然自得地撑着篙，时不时还能看到岸边的水牛在吃草，那种惬意的田园风光让人沉醉不已。",
        "imageUrl": "https://picsum.photos/seed/guilin1/200/200",
        "author": "小王",
        "createTime": "2025-05-01 09:30:00",
        "status": "pending"
    },
    {
        "id": 2,
        "title": "张家界奇峰探秘行",
        "description": "踏入张家界，就仿佛进入了一个奇幻的世界。那些高耸入云的奇峰异石，形态各异，有的像利剑直插苍穹，有的像仙女亭亭玉立，在云雾缭绕中若隐若现，每走一步都有不一样的景致，让人不禁感叹大自然的鬼斧神工。",
        "imageUrl": "https://picsum.photos/seed/zhangjiajie1/200/200",
        "author": "小李",
        "createTime": "2025-04-30 14:15:00",
        "status": "approved"
    },
    {
        "id": 3,
        "title": "三亚海滨浪漫之旅",
        "description": "三亚的海滩简直是人间天堂呀！金色的沙滩细腻柔软，踩上去就像踩在棉花上一样。湛蓝的大海一望无际，海浪一波接着一波地涌来，在沙滩上留下一片片白色的泡沫。傍晚时分，看着夕阳慢慢沉入海平面，整个天空被染成了橙红色，美不胜收，太适合情侣来享受浪漫时光啦。",
        "imageUrl": "https://picsum.photos/seed/sanya1/200/200",
        "author": "小张",
        "createTime": "2025-04-28 16:40:00",
        "status": "rejected"
    },
    {
        "id": 4,
        "title": "杭州西湖春日漫步",
        "description": "春日的西湖别有一番韵味，湖边垂柳依依，嫩绿的柳枝随风飘舞，仿佛是大自然垂下的绿色丝绦。桃花、杏花竞相绽放，红的像火，粉的像霞，白的像雪，与波光粼粼的湖面相互映衬。租一艘小船，划行在湖面上，感受着微风拂面，惬意极了。",
        "imageUrl": "https://picsum.photos/seed/hangzhou1/200/200",
        "author": "小赵",
        "createTime": "2025-04-26 13:20:00",
        "status": "pending"
    },
    {
        "id": 5,
        "title": "西安古城历史游",
        "description": "漫步在西安古城的大街小巷，仿佛穿越回了古代。那古老而厚重的城墙，见证了无数的历史变迁，城墙上的每一块砖石都似乎在诉说着过去的故事。钟鼓楼庄严肃穆，站在楼上俯瞰，古城的风貌尽收眼底，古色古香的建筑鳞次栉比，让人沉浸在浓厚的历史氛围之中。",
        "imageUrl": "https://picsum.photos/seed/xian1/200/200",
        "author": "小孙",
        "createTime": "2025-04-25 11:50:00",
        "status": "approved"
    },
    {
        "id": 6,
        "title": "成都美食探索之旅",
        "description": "成都是一座来了就不想走的美食之都呀！大街小巷遍布着各种各样的美食小吃，从麻辣鲜香的火锅，到外酥里嫩的串串，再到软糯香甜的糖油果子，每一口都让人回味无穷。而且成都的美食店氛围都特别好，充满了人间烟火气，边吃边感受这座城市的热情。",
        "imageUrl": "https://picsum.photos/seed/chengdu1/200/200",
        "author": "小陈",
        "createTime": "2025-04-24 15:30:00",
        "status": "rejected"
    }
      ],
      
      // 滚动控制
      scrollTop: 0
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
    handleEdit(item) {
      console.log(`编辑项目: ${item.id}`);
      // 跳转到编辑页面，并传递当前 item 的内容
      Taro.navigateTo({
        url: `/pages/new/index?item=${encodeURIComponent(JSON.stringify(item))}`,
        success: () => {
          console.log('跳转成功');
        },
        fail: (err) => {
          console.error('跳转失败:', err);
          Taro.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          });
        }
      });
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
}

.page-section-spacing {
  margin-top: 30rpx;
}

/* 滚动视图样式 */
.card-scroll-view {
  width: 100%;
}

/* 卡片列表包装器 */
.card-list-wrapper {
  padding: 24rpx;
}

/* 卡片列表样式 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-bottom: 40rpx;
}

/* 卡片项样式 */
.card-item {
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-item:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
}

/* 卡片内容样式 */
.card-content {
  display: flex;
  padding: 24rpx;
}

.card-image-container {
  width: 140rpx;
  height: 140rpx;
  border-radius: 8rpx;
  overflow: hidden;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  color: #222;
  margin-bottom: 10rpx;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 26rpx;
  color: #888;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 卡片操作按钮样式 */
.card-actions {
  display: flex;
  padding: 0 24rpx 24rpx 24rpx;
  gap: 16rpx;
  border-top: none;
  background: #fff;
}

.action-btn {
  flex: 1;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 26rpx;
  border-radius: 8rpx;
  margin: 0;
  border: 1rpx solid #e5e7eb;
  background: #fff;
  color: #2563eb;
  transition: background-color 0.2s;
  padding: 0;
  min-width: 120rpx;
}

.passed-btn {
  color: #fff;
  background-color: #10b981;
  border: none;
}

.delete-btn,
.edit-btn {
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 26rpx;
  border-radius: 8rpx;
  border: 1rpx solid #ccc;
  background: #fff;
  color: #2563eb;
  padding: 0;
  min-width: 120rpx;
}

.btn-text {
  display: block;
  width: 100%;
  height: 100%;
}
</style>  