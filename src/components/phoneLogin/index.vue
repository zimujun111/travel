<template>
  <view class="phone-login">
    <button class="login-btn" @tap="handleLogin">登录</button>
    <button class="signin-btn" @tap="handleSignin">注册</button>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
export default {
    setup(){
        const handleLogin=()=>{
            Taro.navigateTo({
                    url: '/pages/loginSignin/index?isLogin=true'
                })
            
        }
        const handleSignin=()=>{
            Taro.navigateTo({
                url: '/pages/loginSignin/index?isLogin=false'
            })
        }
        return {
            handleLogin,
            handleSignin
        }
    }
}
</script>

<style>
.phone-login {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.login-btn {
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(to right, #ff2442, #ff6b81);
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(255, 36, 66, 0.3);
}

.signin-btn {
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(to right, #ff2442, #ff6b81);
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(255, 36, 66, 0.3);
}

.login-btn::after,
.signin-btn::after {
  border: none;
}
</style>
