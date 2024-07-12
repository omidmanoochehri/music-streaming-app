const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    cover: {
        type: String,
        required: false,
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = Mongoose.model('Category', CategorySchema);