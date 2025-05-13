const express = require('express');
const router = express.Router();
const TravelNote = require('../models/TravelNote');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const image = require('../models/image');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

function getVideoCover(videoPath, outputDir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filename = path.basename(videoPath, path.extname(videoPath));
    const coverPath = path.join(outputDir, `${filename}-cover.jpg`);

    ffmpeg(videoPath)
      .on('end', () => {
        console.log('封面生成完成:', coverPath);
        resolve(coverPath);
      })
      .on('error', (err) => {
        console.error('生成封面失败:', err);
        reject(err);
      })
      .screenshots({
        count: 1,             // 截取1帧
        folder: outputDir,    // 输出目录
        filename: `${filename}-cover.jpg`, // 文件名
        size: '360x640'       // 封面尺寸
      });
  });
}
 

// 获取所有已审核的游记
router.get('/approved', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    
    const notes = await TravelNote.findAndCountAll({
      where: {
        status: 'approved'
      },
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [
        {
          model: User,
          attributes: ['username', 'avatar_url']
        },
        {
          model: image,
          attributes: ['url']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        total: notes.count,
        list: notes.rows,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取已审核游记列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取游记列表失败'
    });
  }
});
// 获取图片
router.get('/getNoteImages/:note_id', async (req, res) => {
  try {
    const { note_id } = req.params;
    const images = await image.findAll({
      where: {
        note_id: note_id
      }
    });

    if (!images || images.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到相关图片'
      });
    }

    res.json({
      success: true,
      data: {
        total: images.length,
        list: images
      }
    });
  } catch (error) {
    console.error('获取我的失败:', error);
    res.status(500).json({
      success: false,
      message: '获取我的失败'
    });
  }
});
// 获取我的游记
router.get('/myTravel/:user_id', async (req, res) => {
  try {
    
    const { user_id } = req.params;
    const notes = await TravelNote.findAndCountAll({
      where: {
        user_id: user_id,
      },
      order: [['created_at', 'DESC']],
     
      include: [
        {
          model: User,
          attributes: ['username', 'avatar_url']
        },
        {
          model: image,
          attributes: ['url']
        },
        {
          model: require('../models/rejectReason'),
          as: 'reject_reason',
          attributes: ['reason'],
          required: false
        }
      ]
    });

    // 处理返回数据，添加拒绝原因
    const processedNotes = notes.rows.map(note => {
      const noteData = note.get({ plain: true });
      if (noteData.status === 'rejected' && noteData.RejectReason) {
        noteData.rejectReason = noteData.RejectReason.reason;
      }
      return noteData;
    });

    res.json({
      success: true,
      data: {
        total: notes.count,
        list: processedNotes
      }
    });
  } catch (error) {
    console.error('获取我的游记失败:', error);
    res.status(500).json({
      success: false,
      message: '获取我的游记失败'
    });
  }
});

// 图片存储配置
const imageStorage =  multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../new/image');
    // 确保上传目录存在
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
      }
      console.log('上传目录路径:', uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      console.error('创建上传目录失败:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // 生成唯一的文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});


// 视频存储配置
const videoStorage =  multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../new/video');
    // 确保上传目录存在
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
      }
      console.log('上传目录路径:', uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      console.error('创建上传目录失败:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // 生成唯一的文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});


// 文件类型过滤
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('只允许上传图片(jpg, png, gif)和视频(mp4, mov)'));
  }
  cb(null, true);
};

// 创建上传中间件
const uploadImage = multer({ 
  storage: imageStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).array('images', 9); // 最多9张图片

const uploadVideo = multer({ 
  storage: videoStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
}).single('video');

// 上传图片接口
router.post('/upload-images', (req, res) => {
  uploadImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
    
    const files = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: `/new/image/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));
    console.log(files);
    res.json({
      success: true,
      data: files
    });
  });
});

// 上传视频接口
router.post('/upload-video', (req, res) => {
  uploadVideo(req, res, (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
    
    const file = req.file;
    const result = {
      originalName: file.originalname,
      filename: file.filename,
      path: `/new/video/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    };
    
    res.json({
      success: true,
      data: result
    });
  });
});

router.post('/new',  async (req, res) => {
  try {
    const { title, content, images = [], video = null,user_id} = req.body;
    let { video_cover= null } = req.body; 
    // 验证数据
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      });
    }
    
    if (images.length === 0 && !video) {
      return res.status(400).json({
        success: false,
        message: '至少需要上传一张图片或一个视频'
      });
    }
    const baseDir = path.join(__dirname, '../../../');
    if(!video_cover){
      const videoPath = path.join(baseDir,'server', video);
      const coverDir = path.join(baseDir, 'server/new/image');
      let coverPath = await getVideoCover(videoPath, coverDir)
      video_cover = `/new/image/${path.basename(coverPath)}`;
    }
    console.log(video_cover); // 输出封面路径，用于调试或后续使用
    
    // 创建游记
    const note = await TravelNote.create({
      title,
      content,
      cover_image:video_cover,
      user_id,
      status: 'pending',
      view_count: 0,
      like_count: 0,
      comment_count: 0
    });
    // 保存图片到image表
    if (images.length > 0) {
      const imageRecords = images.map(imgUrl => ({
        note_id: note.note_id,
        user_id: user_id,
        url: imgUrl
      }));
      await image.bulkCreate(imageRecords);
    }

    // 如果有视频，也保存到image表
    if (video) {
      await image.create({
        note_id: note.note_id,
        user_id: user_id,
        url: video
      });}
    
    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('创建游记错误:', error);
    res.status(500).json({ 
      success: false,
      message: '创建游记失败' 
    });
  }
});


// 删除游记
router.delete('/:note_id', async (req, res) => {
  try {
    const { note_id } = req.params;
    const { user_id } = req.body;

    // 验证用户权限
    const note = await TravelNote.findOne({
      where: { note_id }
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: '游记不存在'
      });
    }

    if (note.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: '无权删除该游记'
      });
    }

    // 获取关联的图片和视频
    const mediaFiles = await image.findAll({
      where: { note_id }
    });

    // 删除文件系统中的文件
    const baseDir = path.join(__dirname, '../../../');
    for (const file of mediaFiles) {
      const filePath = path.join(baseDir, 'server', file.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 删除封面图片
    if (note.cover_image) {
      const coverPath = path.join(baseDir, 'server', note.cover_image);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    // 删除数据库记录
    await image.destroy({ where: { note_id } });
    await TravelNote.destroy({ where: { note_id } });

    res.json({
      success: true,
      message: '游记删除成功'
    });
  } catch (error) {
    console.error('删除游记失败:', error);
    res.status(500).json({
      success: false,
      message: '删除游记失败'
    });
  }
});

module.exports = router;