const mongoose=require('mongoose');
const {Schema}=mongoose;
const Submission = require('./submission');

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 25
    },
    lastName: {
        type: String,
        trim: true,
        maxLength: 25
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true,
    },
    age: {
        type: Number,
        min: 6,
        max: 100,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    problemSolved: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'problem',
        }],
        default: [],
    },
    password:{
        type: String,
        required: true,
        minlength: 8,
    }
}, {
    timestamps: true,
});

userSchema.post('findOneAndDelete', async (user) => {
    if (user) {
        await Submission.deleteMany({ userId: user._id });
    }
});

const User = mongoose.model('user', userSchema);
module.exports = User;