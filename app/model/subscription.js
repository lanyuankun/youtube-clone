module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const subscriptionSchma = new Schema({
        user: { type: mongoose.ObjectId, required: true, ref: "User" },
        video: { type: mongoose.ObjectId, ref: "Video" },
        channel: {
            type: mongoose.ObjectId,
            ref: 'User',
            required: true
        },
        createAt: {
            type: Date,
            default: Date.now
        },
        updateAt: {
            type: Date,
            default: Date.now
        }
    })
    return mongoose.model('Subscription', subscriptionSchma)
}