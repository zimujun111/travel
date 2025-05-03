<template>
  <!-- 顶部状态栏 -->
  <privacy />
  <login :showlogin="showlogin" id="loginCom" @changelogin="changeLogin" />
  
  <!-- 个人信息 -->
  <view class="bar-box" :style="{ height: `${navBarHeight}px` }">
    <view class="level" :style="{ marginTop: `${barHeight}px` }">
      <view v-if="show" class="level bar" @tap="toedit">
        <image class="top-head" :src="userinfo.avaturl || require('../../images/nim.png')" mode="widthFix"></image>
        <view class="welcome">
          <text class="nick">{{ userinfo.nickname }}</text>
          <text class="acount">{{ userinfo.openidcopy }}</text>
        </view>
      </view>
      <view v-else class="bar-title">个人中心</view>
    </view>
  </view>

  <view class="head-box" :style="{ paddingTop: `${navBarHeight + 20}px` }">
    <view class="level">
      <image class="top-head" :src="userinfo.avaturl || require('../../images/nim.png')" mode="widthFix"></image>
      <view class="level head-right">
        <view class="welcome">
          <view class="nick">{{ userinfo.nickname }}</view>
          <view class="openid-wrapper">
            <view class="id-wrapper">ID</view>
            <view class="openid">{{ userinfo.openidcopy }}</view>
            <view class="copy" @tap="onCopy">复制</view>
          </view>
        </view>
        <view class="level set-center">已认证</view>
      </view>
    </view>
    <view class="level share-box" @tap="detailClick">
      <view>
        <view class="money">
          <text>开通会员</text>
          <text class="money-text">￥99</text>
        </view>
        <view class="share-text">开启通往成功的道路！</view>
      </view>
      <view class="share-btn">查看详情</view>
    </view>
  </view>

  <view class="level sign-box">
    <view 
      v-for="(item, index) in navlist" 
      :key="index" 
      class="tab" 
      :class="{ 'tabselect theme-color border-color': current === index }"
      :data-current="index"
      :id="`tab${index}`"
      @tap="checkCurrenttab"
    >
      <view>{{ item }}</view>
      <text>{{ staticlist[index] }}</text>
      <view class="tabline bg-color"></view>
    </view>
    <view class="tpye">
      <view class="type-name">短信剩余</view> 
      <view class="type-num">{{ freenum }}</view>
    </view>
  </view>

  <van-popup 
    :show="showPircePop" 
    position="bottom" 
    closeable 
    close-icon="close" 
    round 
    @close="onPriceClose"
  >
    <view class="pricetitle">信封购买</view>
    <view class="multi-tips">Tips：点击对应套餐即可购买，只支持微信支付！</view>
    <view class="pricelist flex flexwrap">
      <view 
        v-for="(item, index) in messlist" 
        :key="index"
        class="priceitem" 
        :class="{ 'border-color': priceIndex === index }"
        @tap="onPriceSelected"
        :data-index="index"
      >
        <image src="/images/envelope.png" class="priceitem-logo" mode=""/>
        <view class="price_t">{{ item.title }}/封</view>
        <view class="price_p">{{ item.price }}￥</view>
      </view>
    </view>
  </van-popup>

  <!-- 二级菜单 -->
  <view class="white-box">
    <button class="row" style="width: 100%;" @tap="toedit">
      <view class="left">
        <image :src="require('../../images/ocean.png')"></image>
        <text class="text">基本信息</text>
      </view>
      <image class="right" :src="require('../../images/right.png')" mode="widthFix"></image>
    </button>
    <button class="row" style="width: 100%;" @tap="tofabu">
      <view class="left">
        <image :src="require('../../images/ocean.png')"></image>
        <text class="text">我的烦恼</text>
      </view>
      <image class="right" :src="require('../../images/right.png')" mode="widthFix"></image>
    </button>
    <button class="row" style="width: 100%;" @tap="tostar">
      <view class="left">
        <image :src="require('../../images/star.png')"></image>
        <text class="text">我的点赞</text>
      </view>
      <image class="right" :src="require('../../images/right.png')" mode="widthFix"></image>
    </button>
    <button class="row" style="width: 100%;" @tap="toorder">
      <view class="left">
        <image :src="require('../../images/charge.png')"></image>
        <text class="text">充值记录</text>
      </view>
      <image class="right" :src="require('../../images/right.png')" mode="widthFix"></image>
    </button>
    <button class="row" style="width: 100%;" @tap="onPriceOpen">
      <view class="left">
        <image :src="require('../../images/order.png')"></image>
        <text class="text">信封购买</text>
      </view>
      <image class="right" :src="require('../../images/right.png')" mode="widthFix"></image>
    </button>
    <button class="row" style="width: 100%;" @tap="toqa">
      <view class="left">
        <image :src="require('../../images/qa.png')"></image>
        <text class="text">常见问题</text>
      </view>
      <image class="right" :src="require('../../images/right.png')" mode="widthFix"></image>
    </button>
    <button class="row" style="width: 100%;" @tap="toabout">
      <view class="left">
        <image :src="require('../../images/about.png')"></image>
        <text class="text">关于我们</text>
      </view>
      <image class="right" :src="require('../../images/right.png')" mode="widthFix"></image>
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
      <view style="text-align: center;">V2.0</view>
    </button>
  </view>
</template>