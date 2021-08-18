'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const auth = app.middleware.auth();
  const { router, controller } = app;
  router.prefix('/api/v1')
  router.post('/user', controller.user.create)//创建用户
    .post('/login', controller.user.login)//登录
    .get('/', controller.home.index)
    .get('/user', auth, controller.user.getCurrentUser)//获取当前登录用户
    .get('/user/:userId', app.middleware.auth({ 'required': false }), controller.user.getUserById)//获取指定用户
    .patch('/user', auth, controller.user.update)//修改用户信息
    //用户订阅
    .post('/users/:userId/subscribe', auth, controller.user.subscribe)
    .delete('/users/:userId/subscribe', auth, controller.user.unSubscribe)
    .post('/users/:userId/subscriptions', controller.user.getSubscriptions)
    //阿里云上传
    .get('/vod/createUploadVideo', auth, controller.vod.createUploadVideo)
    .get('/vod/refreshUploadVideo', auth, controller.vod.refreshUploadVideo)
    .post('/videos', auth, controller.video.createVideo)//创建视频
    .get('/videos/:videoId', app.middleware.auth({ 'required': false }), controller.video.getVideo)//获取视频详情
    .patch('/videos/:videoId', auth, controller.video.updateVideo)//修改视频详情
    .delete('/videos/:videoId', auth, controller.video.deleteVideo)//删除视频详情
    .get('/videos', controller.video.getVideos)//获取视频列表
    .get('/users/:userId/videos', controller.video.getUserVideos)//获取用户发布的视频
    .get('/user/videos/feed', auth, controller.video.getUserFeedVideos)//获取用户关注频道的视频列表
    .post('/videos/:videoId/comments', auth, controller.video.createComment)//给视频添加评论
    .get('/videos/:videoId/comments', controller.video.getComment)//获取视频评论
    .delete('/videos/:videoId/comments/:commentId', auth, controller.video.deleteComment)//删除视频评论
};
