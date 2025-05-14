const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();




app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));
app.use('/new', express.static(path.join(__dirname, '../new'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

//连接数据库
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
}

testConnection();

// 导入模型
const User = require('./models/User');
const UserToken = require('./models/User_token');
const TravelNote = require('./models/TravelNote');
const image = require('./models/image');
const RejectReason = require('./models/rejectReason');


// 设置模型关联
UserToken.belongsTo(User, { foreignKey: 'user_id' });
TravelNote.belongsTo(User, { foreignKey: 'user_id' });
TravelNote.hasMany(image, { foreignKey: 'note_id' });
image.belongsTo(TravelNote, { foreignKey: 'note_id' });
image.belongsTo(User, { foreignKey: 'user_id' });
RejectReason.belongsTo(TravelNote, { foreignKey: 'note_id' });
TravelNote.hasOne(RejectReason, { foreignKey: 'note_id' });
// 导入路由
const userRoutes = require('./routes/userRoutes');
const travelNoteRoutes = require('./routes/travelNoteRoutes');
const searchRoutes = require('./routes/searchRoutes');
const deepseek= require('./routes/deepseek');
// 使用路由
app.use('/api/users', userRoutes);
app.use('/api/travel-notes', travelNoteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/deepseek',deepseek);
// 路由
app.get('/', (req, res) => {
  res.json({ message: '欢迎使用 Taro Demo API' });
});

// HTTPS 配置
const sslPath = path.join(__dirname, '..', 'ssl');
const options = {
  key: fs.readFileSync(path.join(sslPath, 'private.key')),
  cert: fs.readFileSync(path.join(sslPath, 'certificate.crt'))
};

// 启动 HTTPS 服务器
const PORT = process.env.PORT || 3000;
https.createServer(options, app).listen(PORT, () => {
  console.log(`服务器运行在 https://localhost:${PORT}`);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

module.exports = app;