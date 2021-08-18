module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const videoSchma = new Schema({
        title: { type: String, required: true },
        description: { type: String, required: true },
        cover: { type: String, required: true },
        vodVideoId: { type: String, required: true },
        user: { type: mongoose.ObjectId, ref: "User" },
        commentCount: { type: Number, default: 0 },
        createAt: {
            type: Date,
            default: Date.now
        },
        updateAt: {
            type: Date,
            default: Date.now
        },
    })
    return mongoose.model('Video', videoSchma)
}