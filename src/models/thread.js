const mongoose = require('mongoose')

const threadSchema = new mongoose.Schema({
  title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tags: [{
        type: String,
        required: true
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Thread = mongoose.model('Thread', threadSchema)

module.exports = Thread
