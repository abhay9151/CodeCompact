const mongoose = require('mongoose');
const { Schema } = mongoose;

const patternQuestionSchema = new Schema({
    pattern: {
        type: String,
        required: true,
        trim: true,
    },
    patternOrder: {
        type: Number,
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    platform: {
        type: String,
        enum: ['leetcode', 'gfg', 'other'],
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    key: {
        type: String,
        required: true,
        unique: true,
    },
});

patternQuestionSchema.index({ patternOrder: 1, order: 1 });

module.exports = mongoose.model('patternQuestion', patternQuestionSchema);
