'use strict';

const Controller = require('egg').Controller;


class videoController extends Controller {
    async createVideo(accessKeyId, accessKeySecret) {
        const { ctx } = this;
        const body = ctx.request.body;
        const { Video } = this.app.model;
        ctx.validate({ "title": "string", "description": "string", "cover": "string", "vodVideoId": "string" }, body)
        body.user = ctx.user._id;
        const video = await new Video(body).save();
        ctx.status = 201;
        ctx.body = {
            video
        }
    }
    async getVideo(accessKeyId, accessKeySecret) {
        const { Video, VideoLike, Subscription } = this.app.model;
        const { videoId } = this.ctx.params;
        let video = await Video.findById(videoId).populate('user', '_id username avatar subscribersCount');
        if (!video) {
            this.ctx.throw(404, '视频不存在')
        }
        video = video.toJSON();
        video.isLikeed = false;
        video.isDisLiked = false;
        video.user.isSubscriberd = false;//是否订阅
        if (this.ctx.user) {
            //是否登录
            const uid = this.ctx.user._id;
            if (VideoLike) {
                if (await VideoLike.findOne({ user: uid, video: videoId, like: 1 })) {
                    video.isLikeed = true;
                }
                if (await VideoLike.findOne({ user: uid, video: videoId, like: -1 })) {
                    video.isDisLiked = true;
                }
            }
            if (Subscription) {
                if (await Subscription.findOne({ user: uid, channnel: video.user._id })) {
                    video.user.isSubscriberd = true;
                }
            }
        }
        this.ctx.body = {
            video
        }
    }
    async getVideos(accessKeyId, accessKeySecret) {
        const query = this.ctx.query;
        const { Video } = this.app.model;
        let { pageNum = 1, pageSize = 10 } = this.ctx.query;
        pageNum = Number.parseInt(pageNum)
        pageSize = Number.parseInt(pageSize)
        const vedios = await Video.find()
            .populate()
            .sort({
                createAt: -1
            })
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize)
        const videoCount = await Video.countDocuments();
        this.ctx.body = {
            vedios,
            videoCount
        }
    }
    async getUserVideos(accessKeyId, accessKeySecret) {
        const { userId } = this.ctx.params;
        const { Video } = this.app.model;
        let { pageNum = 1, pageSize = 10 } = this.ctx.query;
        pageNum = Number.parseInt(pageNum)
        pageSize = Number.parseInt(pageSize)
        const vedios = await Video.find({
            user: userId
        })
            .populate()
            .sort({
                createAt: -1
            })
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize)
        const videoCount = await Video.countDocuments({
            user: userId
        });
        this.ctx.body = {
            vedios,
            videoCount
        }
    }
    async getUserFeedVideos(accessKeyId, accessKeySecret) {
        const { Video, Subscription } = this.app.model;
        const userId = this.ctx.user._id;
        let { pageNum = 1, pageSize = 10 } = this.ctx.query;
        pageNum = Number.parseInt(pageNum)
        pageSize = Number.parseInt(pageSize)
        const channels = await Subscription.find({ user: userId }).populate('channel')
        const vedios = await Video.find({
            user: {
                $in: channels.map(item => item.channel._id)
            }
        })
            .populate('user')
            .sort({
                createAt: -1
            })
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize)
        const videoCount = await Video.countDocuments({
            user: userId
        });
        this.ctx.body = {
            vedios,
            videoCount
        }
    }
    async updateVideo() {
        const { Video } = this.app.model;
        const { body } = this.ctx.request;
        const { videoId } = this.ctx.params;
        const userId = this.ctx.user._id;
        this.ctx.validate({
            title: { type: 'string', required: false },
            description: { type: 'string', required: false },
            vodVideoId: { type: 'string', required: false },
            cover: { type: 'string', required: false },
        })
        const video = await Video.findById(videoId)
        if (!video) {
            this.ctx.throw(404, '视频不存在')
        }
        if (video.user.toString() !== userId) {
            this.ctx.throw(403)
        }
        Object.assign(video, this.ctx.helper._.pick(body, ['title', 'description', 'vodVideoId', 'cover']))
        await video.save()
        this.ctx.body = {
            video
        }
    }
    async deleteVideo() {
        const { Video } = this.app.model;
        const { videoId } = this.ctx.params;
        const userId = this.ctx.user._id;
        const video = await Video.findById(videoId)
        console.log(video);
        if (!video) {
            this.ctx.throw(404, '视频不存在')
        }
        if (video.user.toString() !== userId) {
            this.ctx.throw(403)
        }
        await video.remove()
        this.ctx.status = 204
    }
    async createComment() {
        const { Video, Comment } = this.app.model;
        const { videoId } = this.ctx.params;
        const body = this.ctx.request.body;
        const userId = this.ctx.user._id;
        this.ctx.validate({
            content: 'string'
        }, body)
        const video = await Video.findById(videoId)
        if (!video) {
            this.ctx.throw(404, '视频不存在')
        }
        const comment = await new Comment({
            content: body.content,
            user: userId,
            video: videoId
        }).save()

        video.commentCount = await Comment.countDocuments({
            video: videoId
        })
        await video.save()

        await comment.populate('user').populate('video').execPopulate()

        this.ctx.body = {
            comment
        }
    }
    async getComment() {
        const { Video, Comment } = this.app.model;
        let { pageNum = 1, pageSize = 10 } = this.ctx.query;
        pageNum = Number.parseInt(pageNum)
        pageSize = Number.parseInt(pageSize)
        const { videoId } = this.ctx.params;

        const getComment = Comment.find({
            video: videoId
        })
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize)
            .populate('user')
            .populate('video')
        const getCommentCount = Comment.countDocuments({
            video: videoId
        })
        const [comments, commentsCount] = await Promise.all([getComment, getCommentCount])
        this.ctx.body = {
            comments,
            commentsCount
        }
    }
    async deleteComment() {
        const { Video, Comment } = this.app.model;
        let { videoId, commentId } = this.ctx.params;

        //检查视频是否存在
        const video = await Video.findById(videoId);
        if (!video) {
            this.ctx.throw(404, '视频不存在33')
        }

        const comment = await Comment.findById(commentId)

        if (!comment) {
            this.ctx.throw(404, '评论不存在4442')
        }

        //检测评论作者是否为当前登录用户
        if (!this.ctx.helper.isSame(this.ctx.user._id, comment.user)) {
            this.ctx.throw(403)
        }

        await comment.remove()

        video.commentCount = await Comment.countDocuments({
            video: videoId
        })
        console.log(video);
        await video.save()

        this.ctx.status = 204
    }

}

module.exports = videoController;
