module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const viewSchma = new Schema({
        user: { type: mongoose.ObjectId, ref: "User", required: true },
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
    return mongoose.model('View', viewSchma)
}