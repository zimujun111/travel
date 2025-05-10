<template>
    <view class="login-signin">
        <view class="loginSignin-container">
            <view class="login-container" v-if="isLogin">
                <view class="login-group">
                    <image src="../../assets/images/username.png" alt="用户名" class="login-icon" />
                    <input type="text" v-model="username" placeholder="请输入用户名" />
                </view>
                <view class="login-group">
                    <image src="../../assets/images/lock1.png" alt="密码" class="login-icon" />
                    <input type="password" v-model="password" placeholder="请输入密码" />
                </view>
            </view>
            <view class="sign-container" v-else>
                <view class="login-group">
                    <image src="../../assets/images/username.png" alt="用户名" class="login-icon" />
                    <input type="text" v-model="username" placeholder="请输入用户名" />
                </view>
                <view class="login-group">
                    <image src="../../assets/images/lock1.png" alt="密码" class="login-icon" />
                    <input type="password" v-model="password" placeholder="请输入密码" />
                </view>
                <view class="login-group">
                    <image src="../../assets/images/email.png" alt="邮箱" class="login-icon" />
                    <input type="email" v-model="email" placeholder="请输入邮箱" />
                </view>
            </view>
            <button class="login-submit-btn" @tap="handleSubmit">{{ isLogin ? '登录' : '注册' }}</button>
            <view class="to-Signin" @tap="toSignin">
                {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
            </view>
        </view>
    </view>
</template>

<script>
import { ref } from 'vue'
import Taro from '@tarojs/taro'

export default {
    setup() {
        const username = ref('')
        const password = ref('')
        const email = ref('')
        const params = Taro.getCurrentInstance().router?.params || {}
        const isLogin = ref(params.isLogin !== 'false')

        const handleSubmit = async () => {
            if (!username.value || !password.value) {
                Taro.showToast({
                    title: '请填写完整信息',
                    icon: 'none'
                })
                return
            }

            if (!isLogin.value && !email.value) {
                Taro.showToast({
                    title: '请填写邮箱',
                    icon: 'none'
                })
                return
            }

            try {
                const url = isLogin.value ? '/api/users/login' : '/api/users/register'
                //如果是登录则需要传入用户名和密码，如果是注册则需要传入用户名、密码和邮箱
                const requestData = isLogin.value ? 
                    {
                        username: username.value,
                        password: password.value,
                        
                        }
                    : {
                        username: username.value,
                        password: password.value,
                        email: email.value,
                        }

                const res = await Taro.request({
                    url: `https://localhost:3000${url}`,
                    method: 'POST',
                    data: requestData,
                    header: {
                        'content-type': 'application/json'
                    }
                })
                

                if (res.statusCode >= 200 && res.statusCode < 300 && res.data.success) {
                    const userData={
                        user_name:res.data.user.user_name,
                        avatar_url:res.data.user.avatar_url || '../../assets/images/no_pic.png',
                        token:res.data.user.token
                    }
                    console.log(userData.token)
                    Taro.setStorageSync('userinfo', userData)
                    Taro.showToast({
                        title: isLogin.value ? '登录成功' : '注册成功',
                        icon: 'success'
                    })
                    
                    Taro.setStorageSync('userinfo', res.data.user)
                    setTimeout(() => {
                        Taro.switchTab({
                            url: '/pages/my/index'
                        })
                    }, 1500)
                } 
                else {
                    throw new Error(res.data.message || (isLogin.value ? '登录失败' : '注册失败'))
                }
            } 
            catch (error) {
                Taro.showToast({
                    title: error.message || '操作失败',
                    icon: 'none'
                })
            }
        }

        const toSignin = () => {
            isLogin.value = !isLogin.value
            username.value = ''
            password.value = ''
            email.value = ''
        }

        return {
            username,
            password,
            email,
            isLogin,
            handleSubmit,
            toSignin
        }
    }
}
</script>

<style>
.login-signin {
    padding: 30rpx 30rpx 10rpx 30rpx;
    min-height: 100vh;
    background-color: #f5f5f5;
}

.login-container {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx 30rpx 10rpx 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(143, 122, 122, 0.1);
}
.sign-container{
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx 30rpx 10rpx 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(143, 122, 122, 0.1);
}
.login-group {
    margin-bottom: 40rpx;
    display: flex;
    align-items: center;
}

.login-group input {
    width: 80%;
    height: 88rpx;
    padding: 0 20rpx;
    border: 2rpx solid #a50e0e;
    border-radius: 44rpx;
    font-size: 28rpx;
    box-sizing: border-box;
    margin-top: 20rpx;
}
.login-icon{
    width: 44rpx;
    height: 44rpx;
    margin-right: 30rpx;
}
.login-submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(to right, #ff2442, #ff6b81);
    color: #fff;
    font-size: 32rpx;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 4rpx 12rpx rgba(255, 36, 66, 0.3);
    margin-top: 40rpx;
}

.login-submit-btn::after {
    border: none;
}

.to-Signin {
    text-align: center;
    color: #666;
    font-size: 28rpx;
    margin-top: 30rpx;
}
</style>


