const mongoose = require('mongoose');
const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require('../models/submission');
const SolutionVideo = require('../models/solutionVideo');
const { validateReferenceSolutions } = require('../services/judge0.service');
const { cloudinary, configureCloudinary } = require('../services/cloudinary.service');
const { withRuntimeMs } = require('../utils/runtime');

const problemListFields = '_id title difficulty tags';
const problemDetailFields = '_id title description difficulty tags visibleTestCases startCode';

const validateProblemId = (id, res) => {
    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid problem id' });
        return false;
    }
    return true;
};

const validateProblemSolutions = async (body) => {
    try {
        await validateReferenceSolutions(body.referenceSolution, body.visibleTestCases);
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 400;
        }
        throw error;
    }
};

const createProblem = async (req, res) => {
    const body = req.body || {};
    await validateProblemSolutions(body);
    const problem = await Problem.create({
        ...body,
        problemCreator: req.result._id
    });
    return res.status(201).json({ problem, message: 'Problem created successfully' });
};

const updateProblem = async (req, res) => {
    if (!validateProblemId(req.params.id, res)) {
        return;
    }

    const body = req.body || {};
    await validateProblemSolutions(body);
    const { problemCreator, ...updates } = body;
    const problem = await Problem.findByIdAndUpdate(
        req.params.id,
        updates,
        { runValidators: true, new: true }
    );
    if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
    }
    return res.status(200).json({ problem, message: 'Problem updated successfully' });
};

const deleteProblem = async (req, res) => {
    if (!validateProblemId(req.params.id, res)) {
        return;
    }

    const problem = await Problem.findById(req.params.id);
    if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
    }

    const video = await SolutionVideo.findOne({ problemId: problem._id });
    if (video) {
        configureCloudinary();
        const result = await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
            resource_type: 'video',
            invalidate: true
        });
        if (!['ok', 'not found'].includes(result.result)) {
            throw new Error(`Cloudinary failed to delete the solution video: ${result.result}`);
        }
        await SolutionVideo.deleteOne({ _id: video._id });
    }

    await Problem.deleteOne({ _id: problem._id });
    return res.status(200).json({ message: 'Problem deleted successfully' });
};

const getProblemById = async (req, res) => {
    if (!validateProblemId(req.params.id, res)) {
        return;
    }

    const problem = await Problem.findById(req.params.id).select(problemDetailFields);
    if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
    }

    const [video, solvedProblem] = await Promise.all([
        SolutionVideo.findOne({ problemId: problem._id })
            .select('secureUrl thumbnailUrl duration'),
        User.exists({
            _id: req.result._id,
            problemSolved: problem._id
        })
    ]);
    const result = problem.toObject();
    delete result.referenceSolution;
    if (video) {
        result.secureUrl = video.secureUrl;
        result.thumbnailUrl = video.thumbnailUrl;
        result.duration = video.duration;
    }
    if (req.result.role === 'admin' || solvedProblem) {
        const referenceSolutions = await Problem.findById(problem._id)
            .select('referenceSolution');
        result.referenceSolution = referenceSolutions.referenceSolution;
    }

    return res.status(200).json(result);
};

const getAllProblem = async (req, res) => {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
        return res.status(400).json({ message: 'page and limit must be positive integers' });
    }
    if (['difficulty', 'tag', 'search'].some(
        (key) => req.query[key] !== undefined && typeof req.query[key] !== 'string'
    )) {
        return res.status(400).json({ message: 'difficulty, tag, and search must be strings' });
    }

    const safeLimit = Math.min(limit, 100);
    const filter = {};
    if (req.query.difficulty) {
        filter.difficulty = req.query.difficulty;
    }
    if (req.query.tag) {
        filter.tags = req.query.tag;
    }
    if (req.query.search) {
        const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.title = { $regex: escapedSearch, $options: 'i' };
    }

    const [problems, total] = await Promise.all([
        Problem.find(filter)
            .select(problemListFields)
            .sort({ createdAt: -1 })
            .skip((page - 1) * safeLimit)
            .limit(safeLimit),
        Problem.countDocuments(filter)
    ]);
    return res.status(200).json({
        problems,
        total,
        page,
        pages: Math.ceil(total / safeLimit)
    });
};

const getProblemSolvedByUser = async (req, res) => {
    const user = await User.findById(req.result._id)
        .populate('problemSolved', '_id title difficulty tags');
    return res.status(200).json({ problemSolved: user?.problemSolved || [] });
};

const getSubmittedProblem = async (req, res) => {
    if (!validateProblemId(req.params.pid, res)) {
        return;
    }

    const submissions = await Submission.find({
        userId: req.result._id,
        problemId: req.params.pid
    }).sort({ createdAt: -1 });
    return res.status(200).json(submissions.map(withRuntimeMs));
};

module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    getProblemSolvedByUser,
    getSubmittedProblem
};
