const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const ArtistSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: false,
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = Mongoose.model('Artist', ArtistSchema);