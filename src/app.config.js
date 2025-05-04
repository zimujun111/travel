export default {
  pages: [
    'pages/index/index',
    'pages/new/index',
    'pages/my/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'Taro Vue Demo',
    navigationBarTextStyle: 'black'
  },

  tabBar: {
    color: '#999',
    custom: true,
    selectedColor: '#1296db',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/images/home.png',
        selectedIconPath: 'assets/images/home_active.png'
      },
      {
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: 'assets/images/my.png',
        selectedIconPath: 'assets/images/my_active.png'
      }
    ]
  }
}    