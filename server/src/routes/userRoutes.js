const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 获取所有用户
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新用户
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 获取特定用户
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: '用户未找到' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新用户
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update(req.body);
      res.json(user);
    } else {
      res.status(404).json({ message: '用户未找到' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除用户
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: '用户已删除' });
    } else {
      res.status(404).json({ message: '用户未找到' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 