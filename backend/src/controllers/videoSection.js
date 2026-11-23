const mongoose = require('mongoose');
const Problem = require('../models/problem');
const SolutionVideo = require('../models/solutionVideo');
const { cloudinary, configureCloudinary, getVideoUploadUrl } = require('../services/cloudinary.service');

const getVideoDuration = (cloudinaryDuration, fallbackDuration) => {
    const duration = Number(cloudinaryDuration);
    return Number.isFinite(duration) && duration > 0 ? duration : fallbackDuration;
};

const createUploadSignature = async (req, res) => {
    const { problemId } = req.params;
    if (!mongoose.isValidObjectId(problemId)) {
        return res.status(400).json({ message: 'Invalid problem id' });
    }

    try {
        const problem = await Problem.exists({ _id: problemId });
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const { cloudName, apiKey, apiSecret, apiBaseUrl } = configureCloudinary();
        const timestamp = Math.floor(Date.now() / 1000);
        const publicId = `leetcode-solutions/${problemId}/${req.result._id}_${timestamp}`;
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, public_id: publicId },
            apiSecret
        );

        return res.status(200).json({
            signature,
            timestamp,
            public_id: publicId,
            api_key: apiKey,
            cloud_name: cloudName,
            upload_url: getVideoUploadUrl(cloudName, apiBaseUrl)
        });
    } catch (error) {
        console.error('Cloudinary upload signature error:', error);
        return res.status(500).json({ message: 'Unable to create upload signature' });
    }
};

const saveVideo = async (req, res) => {
    const { problemId, cloudinaryPublicId, secureUrl, duration } = req.body || {};
    if (
        !mongoose.isValidObjectId(problemId)
        || typeof cloudinaryPublicId !== 'string'
        || !cloudinaryPublicId
        || typeof secureUrl !== 'string'
        || !secureUrl
        || typeof duration !== 'number'
        || !Number.isFinite(duration)
        || duration <= 0
    ) {
        return res.status(400).json({ message: 'Valid problemId, cloudinaryPublicId, secureUrl, and duration are required' });
    }

    try {
        const problem = await Problem.exists({ _id: problemId });
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        if (await SolutionVideo.exists({ cloudinaryPublicId })) {
            return res.status(409).json({ message: 'This Cloudinary asset is already saved' });
        }

        configureCloudinary();
        const resource = await cloudinary.api.resource(cloudinaryPublicId, {
            resource_type: 'video'
        });
        if (resource.resource_type !== 'video' || !resource.secure_url) {
            return res.status(400).json({ message: 'Cloudinary asset is not a valid video' });
        }

        const verifiedDuration = getVideoDuration(resource.duration, duration);
        const thumbnailUrl = cloudinary.url(cloudinaryPublicId, {
            resource_type: 'video',
            format: 'jpg',
            transformation: [{ width: 640, height: 360, crop: 'fill' }],
            secure: true
        });

        const video = await SolutionVideo.create({
            problemId,
            userId: req.result._id,
            cloudinaryPublicId,
            secureUrl: resource.secure_url,
            thumbnailUrl,
            duration: verifiedDuration
        });
        return res.status(201).json({
            id: video._id,
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'This Cloudinary asset is already saved' });
        }
        console.error('Cloudinary video save error:', error);
        return res.status(502).json({ message: 'Unable to verify or save Cloudinary video' });
    }
};

const deleteVideo = async (req, res) => {
    const { problemId } = req.params;
    if (!mongoose.isValidObjectId(problemId)) {
        return res.status(400).json({ message: 'Invalid problem id' });
    }

    try {
        const video = await SolutionVideo.findOne({ problemId });
        if (!video) {
            return res.status(404).json({ message: 'Solution video not found' });
        }

        configureCloudinary();
        const result = await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
            resource_type: 'video',
            invalidate: true
        });
        if (!['ok', 'not found'].includes(result.result)) {
            return res.status(502).json({ message: 'Unable to delete Cloudinary video' });
        }

        await SolutionVideo.deleteOne({ _id: video._id });
        return res.status(200).json({ message: 'Solution video deleted successfully' });
    } catch (error) {
        console.error('Cloudinary video delete error:', error);
        return res.status(502).json({ message: 'Unable to delete Cloudinary video' });
    }
};

module.exports = { createUploadSignature, saveVideo, deleteVideo, getVideoDuration };
