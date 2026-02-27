const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { assignLead } = require('../services/assignmentService');
const { getIO } = require('../socket');

/**
 * @route   POST /api/leads
 * @desc    Ingest a new lead, auto-assign to a caller, and emit via Socket.IO
 */
router.post('/', async (req, res, next) => {
    try {
        // 1. Run assignment logic
        const assignedCaller = await assignLead(req.body);

        // 2. Create and save the lead
        const lead = new Lead({
            ...req.body,
            assignedCallerId: assignedCaller._id,
            assignedAt: new Date(),
        });

        const savedLead = await lead.save();

        // 3. Populate caller name for the socket event
        const populatedLead = await Lead.findById(savedLead._id).populate(
            'assignedCallerId',
            'name',
        );

        // 4. Emit real-time event
        const io = getIO();
        io.emit('newLead', populatedLead);

        res.status(201).json({
            success: true,
            data: populatedLead,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
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
 * @route   GET /api/leads
 * @desc    Get all leads with assigned caller name populated
 */
router.get('/', async (req, res, next) => {
    try {
        const leads = await Lead.find({}).populate('assignedCallerId', 'name');

        res.status(200).json({
            success: true,
            count: leads.length,
            data: leads,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
