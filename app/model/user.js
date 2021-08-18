module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const UserSchma = new Schema({
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true, select: false },
        avatar: { type: String, default: null },
        cover: { type: String, default: null },
        channelDescription: { type: String, default: null },//频道
        subscribersCount: { type: Number, default: 0 },//被订阅
        createAt: {
            type: Date,
            default: Date.now
        },
        updateAt: {
            type: Date,
            default: Date.now
        }
    })
    return mongoose.model('User', UserSchma)
}