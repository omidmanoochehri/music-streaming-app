const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const PodcastSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    genre: [{
        type: Mongoose.Types.ObjectId,
        ref: "Category",
        required: true
    }],
    artist: {
        type: Mongoose.Types.ObjectId,
        ref: "Artist",
        required: true
    },
    podcastFile: {
        type: String,
        required: false,
    },
    cover: {
        type: String,
        required: false,
    },
    duration: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    was_lived: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = Mongoose.model('Podcast', PodcastSchema);