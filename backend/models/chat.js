const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        text: {
            type: String,
            required: true
        },
        isBot: {
            type: Boolean,
            required: true
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema); 