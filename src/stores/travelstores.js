import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'
const userInfo=Taro.getStorageSync('userinfo')
export const useTravelStore = defineStore('travel', {
  state: () => ({
    list: [],
    total: 0,
    totalPages: 0,
    currentPage: 1, 
    isLoading: false, // 添加加载状态
    hasMore: true ,
    myTravellist: [],
    myTravelTotalNum: 0,
  }),
  actions: {
    async fetchNotes(page = 1, pageSize = 10) {
      if (this.isLoading) return;
      
      this.isLoading = true;
      try {
        const response = await Taro.request({
          url: 'https://localhost:3000/api/travel-notes/approved',
          method: 'GET',
          data: { page, pageSize }
        })
        
        if (response.data.success) {
          // 如果是第一页，重置列表；否则追加数据
          if (page === 1) {
            this.list = response.data.data.list;
          } else {
            this.list = [...this.list, ...response.data.data.list];
          }
          this.total = response.data.data.total;
          this.totalPages = Math.ceil(this.total / pageSize);
          this.currentPage = page;
          this.hasMore = page < this.totalPages;
        }
      } catch (error) {
        console.error('获取游记失败:', error);
      } finally {
        this.isLoading = false;
      }
    },
  
    async  fetchMyNotes() {
      try{
        const response=await Taro.request({
        url: `https://localhost:3000/api/travel-notes/myTravel/${userInfo.user_id}`,
        method: 'GET',  
      })
        if (response.data.success) {
          this.myTravellist = response.data.data.list
          this.myTravelTotalNum= response.data.data.list.length
        }
      } catch (error) {
          console.error('获取我的游记失败:', error)
      }
    }
  }
})