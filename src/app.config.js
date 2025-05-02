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
        selectedIconPath: 'assets/images/home.png'
      },
 
      {
        pagePath: 'pages/new/index',
        text: '新建',
        iconPath: 'assets/images/home.png',
        selectedIconPath: 'assets/images/home.png'
      },

      {
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: 'assets/images/home.png',
        selectedIconPath: 'assets/images/home.png'
      }
    ]
  }
}