const express = require('express');
const router = express.Router();
const Caller = require('../models/Caller');

/**
 * @route   POST /api/callers
 * @desc    Create a new caller
 */
router.post('/', async (req, res, next) => {
    try {
        const caller = new Caller(req.body);
        await caller.save();

        res.status(201).json({
            success: true,
            data: caller,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
});

/**
 * @route   GET /api/callers
 * @desc    Get all callers
 */
router.get('/', async (req, res, next) => {
    try {
        const callers = await Caller.find({});

        res.status(200).json({
            success: true,
            count: callers.length,
            data: callers,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/callers/:id
 * @desc    Update a caller by ID
 */
router.put('/:id', async (req, res, next) => {
    try {
        const caller = await Caller.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
        );

        if (!caller) {
            return res.status(404).json({
                success: false,
                message: 'Caller not found',
            });
        }

        res.status(200).json({
            success: true,
            data: caller,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
