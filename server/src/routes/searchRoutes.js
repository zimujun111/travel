const express = require('express');
const router = express.Router();
const { searchTravelNotes } = require('../controllers/searchController');

router.get('/', async (req, res) => {
  try {
    const { q, page = 1, pageSize = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search keyword is required' });
    }
    
    const result = await searchTravelNotes(q, parseInt(page), parseInt(pageSize));
    res.json(result);
  } catch (error) {
    console.error('Search route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;