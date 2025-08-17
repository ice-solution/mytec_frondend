const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Favorite = require('../models/Favorite');
const Event = require('../models/Event');

// @route   GET /api/favorites
// @desc    Get user's favorite events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('event', 'title date location event_img category description')
      .sort({ createdAt: -1 });

    const favoriteEvents = favorites.map(fav => fav.event);
    
    res.json({
      success: true,
      count: favoriteEvents.length,
      data: favoriteEvents
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/favorites/check/:eventId
// @desc    Check if user has favorited an event
// @access  Private
router.get('/check/:eventId', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user.id,
      event: req.params.eventId
    });

    res.json({
      success: true,
      isFavorited: !!favorite
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/favorites/:eventId
// @desc    Add event to favorites
// @access  Private
router.post('/:eventId', auth, async (req, res) => {
  try {
    // Check if event exists
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      event: req.params.eventId
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Event already in favorites' });
    }

    // Create new favorite
    const favorite = new Favorite({
      user: req.user.id,
      event: req.params.eventId
    });

    await favorite.save();

    res.json({
      success: true,
      message: 'Event added to favorites',
      data: favorite
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/favorites/:eventId
// @desc    Remove event from favorites
// @access  Private
router.delete('/:eventId', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      event: req.params.eventId
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({
      success: true,
      message: 'Event removed from favorites'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
