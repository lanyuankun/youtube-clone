module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const likeSchma = new Schema({
        like: { type: Number, enum: [1, -1], required: true },
        user: { type: mongoose.ObjectId, required: true, ref: "User" },
        video: { type: mongoose.ObjectId, ref: "Video" },
        createAt: {
            type: Date,
            default: Date.now
        },
        updateAt: {
            type: Date,
            default: Date.now
        }
    })
    return mongoose.model('VideoLike', likeSchma)
}