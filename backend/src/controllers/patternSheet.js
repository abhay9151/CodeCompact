const mongoose = require('mongoose');
const PatternQuestion = require('../models/patternQuestion');
const PatternProgress = require('../models/patternProgress');
const { pickForRevision } = require('../utils/revisionPicker');

const progressDefaults = {
    solved: false,
    solvedAt: null,
    markedForRevision: false,
    revisionCount: 0,
    lastRevisedAt: null,
};

const mergeQuestion = (question, progress = {}) => ({
    _id: question._id,
    title: question.title,
    platform: question.platform,
    url: question.url,
    solved: progress.solved ?? progressDefaults.solved,
    solvedAt: progress.solvedAt ?? progressDefaults.solvedAt,
    markedForRevision: progress.markedForRevision ?? progressDefaults.markedForRevision,
    revisionCount: progress.revisionCount ?? progressDefaults.revisionCount,
    lastRevisedAt: progress.lastRevisedAt ?? progressDefaults.lastRevisedAt,
});

const findQuestion = async (id, res) => {
    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid question id' });
        return null;
    }

    const question = await PatternQuestion.findById(id).lean();
    if (!question) {
        res.status(404).json({ message: 'Question not found' });
        return null;
    }
    return question;
};

const findProgress = (userId, questionId) => PatternProgress.findOne({
    userId,
    questionId,
}).lean();

const sheet = async (req, res) => {
    const userId = req.result._id;
    const [questions, progressRows] = await Promise.all([
        PatternQuestion.find().sort({ patternOrder: 1, order: 1 }).lean(),
        PatternProgress.find({ userId }).lean(),
    ]);
    const progressByQuestion = new Map(
        progressRows.map((progress) => [progress.questionId.toString(), progress])
    );
    const patternsByOrder = new Map();

    for (const question of questions) {
        if (!patternsByOrder.has(question.patternOrder)) {
            patternsByOrder.set(question.patternOrder, {
                pattern: question.pattern,
                patternOrder: question.patternOrder,
                questions: [],
            });
        }
        patternsByOrder.get(question.patternOrder).questions.push(
            mergeQuestion(question, progressByQuestion.get(question._id.toString()))
        );
    }

    const solved = progressRows.filter((progress) => progress.solved).length;
    const markedForRevision = progressRows.filter((progress) => progress.markedForRevision).length;

    return res.status(200).json({
        patterns: [...patternsByOrder.values()],
        stats: { total: questions.length, solved, markedForRevision },
    });
};

const setSolved = async (req, res) => {
    if (typeof req.body?.solved !== 'boolean') {
        return res.status(400).json({ message: 'solved must be a boolean' });
    }

    const question = await findQuestion(req.params.id, res);
    if (!question) {
        return;
    }

    await PatternProgress.updateOne(
        { userId: req.result._id, questionId: question._id },
        { $set: { solved: req.body.solved, solvedAt: req.body.solved ? new Date() : null } },
        { upsert: true, setDefaultsOnInsert: true }
    );
    const progress = await findProgress(req.result._id, question._id);
    return res.status(200).json(mergeQuestion(question, progress));
};

const setRevisionMark = async (req, res) => {
    if (typeof req.body?.marked !== 'boolean') {
        return res.status(400).json({ message: 'marked must be a boolean' });
    }

    const question = await findQuestion(req.params.id, res);
    if (!question) {
        return;
    }

    await PatternProgress.updateOne(
        { userId: req.result._id, questionId: question._id },
        { $set: { markedForRevision: req.body.marked } },
        { upsert: true, setDefaultsOnInsert: true }
    );
    const progress = await findProgress(req.result._id, question._id);
    return res.status(200).json(mergeQuestion(question, progress));
};

const markRevised = async (req, res) => {
    const question = await findQuestion(req.params.id, res);
    if (!question) {
        return;
    }

    const progress = await PatternProgress.findOneAndUpdate(
        { userId: req.result._id, questionId: question._id, solved: true },
        { $inc: { revisionCount: 1 }, $set: { lastRevisedAt: new Date() } },
        { new: true }
    ).lean();

    if (!progress) {
        return res.status(409).json({ message: 'Solve this question before revising it' });
    }

    return res.status(200).json(mergeQuestion(question, progress));
};

const pickRevision = async (req, res) => {
    const { count, mode, patterns } = req.body || {};
    if (!Number.isInteger(count) || count < 1 || count > 200) {
        return res.status(400).json({ message: 'count must be an integer from 1 to 200' });
    }
    if (!['smart', 'random'].includes(mode)) {
        return res.status(400).json({ message: "mode must be 'smart' or 'random'" });
    }
    if (patterns !== undefined
        && (!Array.isArray(patterns) || patterns.some((pattern) => typeof pattern !== 'string'))) {
        return res.status(400).json({ message: 'patterns must be an array of pattern names' });
    }

    const progressRows = await PatternProgress.find({
        userId: req.result._id,
        solved: true,
    }).lean();
    const questionIds = progressRows.map((progress) => progress.questionId);
    const questionQuery = { _id: { $in: questionIds } };
    if (patterns?.length) {
        questionQuery.pattern = { $in: patterns };
    }
    const questions = await PatternQuestion.find(questionQuery)
        .sort({ patternOrder: 1, order: 1 })
        .lean();
    const progressByQuestion = new Map(
        progressRows.map((progress) => [progress.questionId.toString(), progress])
    );
    const candidates = questions.map((question) => ({
        ...mergeQuestion(question, progressByQuestion.get(question._id.toString())),
        pattern: question.pattern,
    }));
    const selected = pickForRevision(candidates, count, mode);

    return res.status(200).json({ available: candidates.length, questions: selected });
};

module.exports = { sheet, setSolved, setRevisionMark, markRevised, pickRevision };
