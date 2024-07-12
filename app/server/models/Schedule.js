const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const ScheduleSchema = new Schema({
    podcast: {
        type: Mongoose.Types.ObjectId,
        ref: 'Podcast',
        required: true
    },
    channel:{
        type: Number,
        required: true
    },
    start_datetime: {
        type: Date,
        required: true
    },    
    end_datetime: {
        type: Date,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = Mongoose.model('Schedule', ScheduleSchema);