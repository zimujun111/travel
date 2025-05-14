<template>

  <privacy />
  <login :showlogin="showlogin" id="loginCom" @changelogin="changeLogin" />
  

  <view class="head-box">
    <view class="level">
      <view class="avatar-wrapper">
        <image class="top-head" :src="avatarUrl || 'https://localhost:3000/uploads/avatars/default.png'" mode="widthFix" id="avatarImage"></image>
        <view class="upload-badge" @tap="uploadAvatar">+</view>
      </view>
      <view class="level head-right">
        <view class="welcome">
          
          <view class="openid-wrapper">
            <view class="id-wrapper">ID</view>
            <view class="nick" v-if="isLogin">{{ userinfo.username }}</view>
            <view class="nick" v-else>未登录</view>
            
          </view>
        </view>
        
      </view>
    </view>
    <view class="level tab-bottom-box" @tap="detailClick">
      
      
    </view>
  </view>

  <view class="white-box">
    <button class="row" style="width: 100%;" @tap="tomytravel">
      <view class="left">
        <image src="../../assets/images/travel_node.png"></image>
        <text class="text">我的游记</text>
      </view>
      <view class="right" mode="widthFix">{{ travel_num }}</view>
    </button>
    
  </view>
  <view class="white-box">
    <button open-type="contact" class="row" style="width: 100%;border-bottom: none;">
      <view class="left">
        <text class="text">在线客服</text>
      </view>
    </button>
    <button class="row" style="width: 100%;border-bottom: none;">
      <view class="left">
        <text class="text">当前版本</text>
      </view>
      <view style="text-align: center;">V1.0</view>
    </button>
  </view>
  <view v-if="!isLogin">
    <phoneLogin />
  </view>
  
  <custom-tab-bar />
</template>


<script>
import { ref, onMounted,computed } from 'vue'
import Taro from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import CustomTabBar from '../../custom-tab-bar/index.vue'
import phoneLogin from '../../components/phoneLogin/index.vue'
import { useTravelStore } from '../../stores/travelstores'
export default {
  components: {
    View,
    Button,
    CustomTabBar,
    phoneLogin
  },
  setup() {
    
    const avatarUrl = ref('')
    const barHeight = ref(30) // 顶部状态栏高度
    const navBarHeight = ref(66) // 顶部高度   
    
    const userinfo = ref({
      openid: '',
      
    })
    const isLogin=ref(false)
    
    const detailClick = () => {
      Taro.showToast({
        title: '暂未开发',
        icon: 'none'
      })
    }
    const myTravelStore = useTravelStore()
    const travel_num = computed(() =>myTravelStore.myTravelTotalNum)
    const fetchMyNotes = () => {
      myTravelStore.fetchMyNotes()
    }
  
    const tomytravel = () => {
      Taro.navigateTo({
        url: '/pages/myTravel/index'
      })
    }
    
    const getUserInfo=()=>{
      const userData = Taro.getStorageSync('userinfo') || {} 
      if(userData.token){
        isLogin.value = true
      }
      
      userinfo.value = {
        ...userData,
        openid: userData.user_id || '', 
      }
      if (userData.avatar_url) {
        if (userData.avatar_url.startsWith('/uploads')) {
          avatarUrl.value = `https://localhost:3000${userData.avatar_url}`
        } else {
          avatarUrl.value = userData.avatar_url
        }
      }
    }
    Taro.useDidShow(() => {
      getUserInfo()
      fetchMyNotes() 
    })
    onMounted(() => {
      getUserInfo()
      fetchMyNotes()
    })
    const uploadAvatar = () => {
      if (!isLogin.value) {
        Taro.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }

      Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths
          const filePath = tempFilePaths[0]
          
          Taro.showLoading({
            title: '上传中...',
            mask: true
          })
          
          const userData = Taro.getStorageSync('userinfo')
          Taro.uploadFile({
            url: 'https://localhost:3000/api/users/upload/avatar',
            filePath: filePath,
            name: 'avatar',
            formData: {
              token: userData.token
            },
            success: (uploadRes) => {
              Taro.hideLoading()
              
              try {
                const data = JSON.parse(uploadRes.data)
                if (data.success) {
                  Taro.showToast({
                    title: '头像上传成功',
                    icon: 'success',
                    duration: 2000
                  })
                  
                  // 直接使用服务器返回的URL路径
                  userData.avatar_url = data.url
                  avatarUrl.value = `https://localhost:3000${data.url}`
                  Taro.setStorageSync('userinfo', userData)
                 
                  userinfo.value = {
                    ...userData,
                    openid: userData.user_id || ''
                  }

                  // 更新头像图片的src
                  const query = Taro.createSelectorQuery()
                  query.select('#avatarImage')
                    .fields({
                      node: true,
                      size: true
                    })
                    .exec((res) => {
                      console.log('查询结果:', res)
                      const avatarNode = res[0]?.node
                      if (avatarNode) {
                        console.log('找到头像元素')
                        avatarNode.src = `https://localhost:3000${data.url}`
                        console.log('设置后的头像地址:', avatarNode.src)
                      } else {
                        console.log('未找到头像元素')
                      }
                    })
                } else {
                  throw new Error(data.message || '上传失败')
                }
              } catch (error) {
                Taro.showToast({
                  title: error.message || '上传失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail: (error) => {
              Taro.hideLoading()
              Taro.showToast({
                title: '上传失败，请重试',
                icon: 'none',
                duration: 2000
              })
              console.error('上传失败:', error)
            }
          })
        },
        fail: (error) => {
          console.error('选择图片失败:', error)
          Taro.showToast({
            title: '选择图片失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }



    return {
      barHeight,
      navBarHeight,
      userinfo,
      detailClick,
      tomytravel,
      travel_num,
      phoneLogin,
      uploadAvatar,
      isLogin,
      avatarUrl
    }
  }
}
</script>
<style>
page {
    background-color: #fdfdfd;
}
 
.level {
    display: flex;
    align-items: center;
    
}
 


.bar {
    width: 80%;
    margin-right: 30%;
    margin-top: 1.5%;
    margin-left: 20rpx;
}
 
.bar-title {
    margin-top: 1.5%;
    margin-left: 20rpx;
    text-align: center;
    font-size: 34rpx;
    color: white;
}
 
.top-head {
  width: 100%;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.8);
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
  border: 2rpx solid rgba(255,255,255,0.5);
  box-shadow: 
    0 4rpx 15rpx rgba(255, 45, 81, 0.2),
    inset 0 0 20rpx rgba(255,255,255,0.3);
  transition: all 0.3s ease;
}


.top-head:hover {
  transform: scale(1.05);
  backdrop-filter: blur(12rpx);
  box-shadow: 
    0 6rpx 25rpx rgba(255, 255, 255, 0.3),
    inset 0 0 25rpx rgba(255,255,255,0.4);
}


.top-head::before {
  content: '';
  position: absolute;
  top: -4rpx;
  left: -4rpx;
  right: -4rpx;
  bottom: -4rpx;
  border: 1rpx dashed rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  pointer-events: none;
}
 
.welcome {
    display: flex;
    flex-direction: column;
    margin-left: 20rpx;
    color: white;
}
 

 
.acount {
    font-size: 22rpx;
    margin-top: 5rpx;
}
 
.head-box {
  background: url('../../assets/images/background.png');
  
  padding: 30rpx 20rpx 0rpx 20rpx;
}
 
.head-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
 
.set-center {
    background-color: #19be6b;
    color: white;
    border-radius: 50rpx;
    font-size: 26rpx;
    padding: 5rpx 20rpx;
}
 
.tab-bottom-box {
    justify-content: space-between;
    margin-top: 8%;
    background-color: rgb(255, 255, 255);
    border-top-left-radius: 40rpx;
    border-top-right-radius: 40rpx;
    padding: 20rpx;
    width: 100%;
    margin-left: -20rpx;
}
 
.money {
    font-size: 30rpx;
    color: rgb(248, 201, 70);
}
 
.money-text {
    padding-left: 20rpx;
}
 
.share-text {
    padding-top: 10rpx;
    font-size: 24rpx;
    color: rgba(248, 212, 112, 0.479);
}
 
.share-btn {
    background-color: rgb(248, 201, 70);
    color: rgb(54, 54, 54);
    border-radius: 50rpx;
    font-size: 26rpx;
    padding: 5rpx 15rpx 8rpx 15rpx;
}
 
.sign-box {
    margin: 0 20rpx;
    padding: 30rpx 20rpx;
    font-size: 30rpx;
	color: gray;
	text-align: center;
    justify-content: space-around;
    border-bottom-left-radius: 20rpx;
    border-bottom-right-radius: 20rpx;
    background-color: white;
    
}
.tab-box {
    margin: 20rpx;
    background-color: white;
    box-shadow: 0 0 5rpx 5rpx #f1f1f1;
    padding: 30rpx 20rpx;
    border-radius: 20rpx;
}
 
.tab-list {
    flex: 1;
    text-align: center;
    color: gray;
}
 
.tab-img {
    width: 50%;
}
 

.white-box {
    background-color: white;
    margin: 20rpx;
    border-radius: 20rpx;
    padding: 0 20rpx;
}
 
.row {
    display: flex;
    align-items: center;
    padding: 36rpx 10rpx;
    font-size: 30rpx;
	font-weight: inherit;
	height: 120rpx;
    background-color: rgba(0, 0, 0, 0);
    border-bottom: 1rpx solid #f1f1f1;
}
 
.row::after {
    border: none;
}
 
.text {
    margin-left: 15rpx;
    color: #636262;
}
 
.left {
    width: 90%;
    text-align: left;
    display: flex;
    align-items: center;
    color: rgb(59, 59, 59);
}
.left image{
	align-self: center;
	width: 35rpx;
	height: 35rpx;
}
 
.right {
	width: 25rpx;
	height: 25rpx;
    text-align: right;
    color: rgb(148, 147, 147);
  margin-top: -30rpx;
}
 

.openid-wrapper{
    flex: 1;
    display: flex;
    align-items: center;
	  justify-content: space-between;
}
.id-wrapper {
  background: linear-gradient(145deg, #feb7e9, #fe86da);
  color: #000;
  padding: 4rpx 6rpx;
  margin-right: 10rpx;
  border-radius: 50%;
  box-shadow: 
    3rpx 3rpx 5rpx rgba(0,0,0,0.2),
    -1rpx -1rpx 4rpx rgba(255,255,255,0.5),
    inset 2rpx 2rpx 4rpx rgba(255,255,255,0.3),
    inset -2rpx -2rpx 4rpx rgba(0,0,0,0.1);
  border: 1rpx solid rgba(255,255,255,0.3);
  text-shadow: 0 1rpx 1rpx rgba(255,255,255,0.5);
  font-weight: bold;
  position: relative;
  overflow: hidden;
}

.id-wrapper::after {
  content: '';
  position: absolute;
  top: 2rpx;
  left: 2rpx;
  width: 30%;
  height: 30%;
  background: rgba(255,255,255,0.4);
  border-radius: 50%;
  filter: blur(1rpx);
}
.nick{
    color: rgb(255, 255, 255);
    font-weight: 600;
    font-size: 40rpx;
    margin-left: 10rpx;
}
.copy{
    color: #ffffff;
}
.pricetitle {
    text-align: center;
    padding: 20rpx;
}
 
.multi-tips{
	color: #999;
	font-size: 24rpx;
	text-align: center;
	position: relative; 
}
 
.pricelist {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 20rpx;
    padding: 30rpx;
    box-sizing: border-box;
}
 
 
.priceitem {
    display: flex;
    padding: 30rpx;
    box-sizing: border-box;
    border: 1px dashed #ececec;
}
 
.priceitem-logo {
  padding: 10rpx 0;
  width: 60rpx;
  height: 40rpx;
}
 
.price_t {
  position:relative;
  font-size: 28rpx;
  width: 40%;
  padding: 10rpx;
  text-align: left;
}
 
.price_p {
  position:relative; 
  width: 40%;
  padding: 10rpx;
  text-align: right;
  font-size: 28rpx;
  color: #999;
}
/* 头像容器 */
.avatar-wrapper {
  position: relative;
  width: 20%;
}


.upload-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #ff2442, #ff6b81);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  border: 2rpx solid white;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
  z-index: 10;
}


.upload-badge:active {
  transform: scale(0.9);
  opacity: 0.8;
}
</style>