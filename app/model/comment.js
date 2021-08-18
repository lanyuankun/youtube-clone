module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const commentSchma = new Schema({
        content: { type: String, required: true },
        user: { type: mongoose.ObjectId, required: true, ref: "User" },
        video: { type: mongoose.ObjectId, ref: "Video", required: true },
        createAt: {
            type: Date,
            default: Date.now
        },
        updateAt: {
            type: Date,
            default: Date.now
        }
    })
    return mongoose.model('Comment', commentSchma)
}