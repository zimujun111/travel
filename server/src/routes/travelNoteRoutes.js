const express = require('express');
const router = express.Router();
const TravelNote = require('../models/TravelNote');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const image = require('../models/image');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/travel_notes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('只允许上传图片文件！'), false);
    }
    cb(null, true);
  }
}).single('cover_image');

// 获取用户的游记列表
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, pageSize = 10 } = req.query;
    
    const where = { user_id: userId };
    if (status) {
      where.status = status;
    }

    const notes = await TravelNote.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [{
        model: User,
        attributes: ['username', 'avatar_url']
      }]
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
    console.error('获取游记列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取游记列表失败'
    });
  }
});

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
      include: [{
        model: User,
        attributes: ['username', 'avatar_url']
      }]
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
        imageInfo: {
          avatar: images
        }
      }
    });
  } catch (error) {
    console.error('获取游记图片失败:', error);
    res.status(500).json({
      success: false,
      message: '获取游记图片失败'
    });
  }
});

// 创建游记
router.post('/', async (req, res) => {
  upload(req, res, async function(err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const { user_id, title, content, location } = req.body;
      
      if (!user_id || !title || !content) {
        return res.status(400).json({
          success: false,
          message: '请填写必要信息'
        });
      }

      const noteData = {
        user_id,
        title,
        content,
        location,
        status: 'draft'
      };

      if (req.file) {
        noteData.cover_image = `/uploads/travel_notes/${req.file.filename}`;
      }

      const note = await TravelNote.create(noteData);

      res.status(201).json({
        success: true,
        message: '游记创建成功',
        data: note
      });
    } catch (error) {
      console.error('创建游记失败:', error);
      res.status(500).json({
        success: false,
        message: '创建游记失败'
      });
    }
  });
});

// 更新游记
router.put('/:noteId', async (req, res) => {
  upload(req, res, async function(err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const { noteId } = req.params;
      const { title, content, location, status } = req.body;

      const note = await TravelNote.findByPk(noteId);
      if (!note) {
        return res.status(404).json({
          success: false,
          message: '游记不存在'
        });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (location) updateData.location = location;
      if (status) updateData.status = status;
      if (req.file) {
        updateData.cover_image = `/uploads/travel_notes/${req.file.filename}`;
      }

      await note.update(updateData);

      res.json({
        success: true,
        message: '游记更新成功',
        data: note
      });
    } catch (error) {
      console.error('更新游记失败:', error);
      res.status(500).json({
        success: false,
        message: '更新游记失败'
      });
    }
  });
});

// 删除游记
router.delete('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const note = await TravelNote.findByPk(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '游记不存在'
      });
    }

    await note.update({ status: 'deleted' });

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

// 获取游记详情
router.get('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const note = await TravelNote.findByPk(noteId, {
      include: [{
        model: User,
        attributes: ['username', 'avatar_url']
      }]
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: '游记不存在'
      });
    }

    // 增加浏览次数
    await note.increment('view_count');

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('获取游记详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取游记详情失败'
    });
  }
});

module.exports = router; 