import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'

export const useTravelStore = defineStore('travel', {
  state: () => ({
    list: [],
    total: 0,
    totalPages: 0
  }),
  actions: {
    async fetchNotes(page = 1, pageSize = 10) {
      try {
        const response = await Taro.request({
          url: 'https://localhost:3000/api/travel-notes/approved',
          method: 'GET',
          data: { page, pageSize }
        })
        
        if (response.data.success) {
          this.list = response.data.data.list
          this.total = response.data.data.total
          this.totalPages = Math.ceil(this.total / pageSize)
        }
      } catch (error) {
        console.error('获取游记失败:', error)
      }
    }
  }
})