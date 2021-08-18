'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async create() {
    const { ctx } = this;
    const body = ctx.request.body;
    const userServer = this.service.user;
    ctx.validate({
      username: { type: 'string' },
      email: { type: "email" },
      password: { type: 'string' }
    })
    if (await userServer.findByUsername(body.username)) {
      this.ctx.throw(422, '用户名已存在')
    }
    if (await userServer.findByEmail(body.email)) {
      this.ctx.throw(422, '邮箱已存在')
    }
    const user = await userServer.createUser(body)

    const token = userServer.createToken({
      _id: user._id
    })
    this.ctx.body = {
      user: {
        email: user.email,
        token,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar
      }
    }
  }
  async login() {
    const { ctx } = this;
    const body = ctx.request.body;
    const userServer = this.service.user;
    ctx.validate({
      email: { type: "email" },
      password: { type: 'string' }
    }, body)
    const user = await userServer.findByEmail(body.email);
    if (!user) {
      this.ctx.throw(422, '用户名不存在')
    }
    if (this.ctx.helper.md5(body.password) !== user.password) {
      this.ctx.throw(422, '密码错误')
    }
    const token = userServer.createToken({
      _id: user._id,
      email: user.email,
      username: user.username,
      channelDescription: user.channelDescription,
      avatar: user.avatar
    })
    this.ctx.body = {
      user: {
        email: user.email,
        token,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar
      }
    }
  }
  async getCurrentUser() {
    const user = this.ctx.user;
    this.ctx.body = {
      "user": {
        "email": user.email,
        "token": this.ctx.header['authorization'],
        "username": user.username,
        "channelDescription": user.channelDescription,
        "avatar": user.avatar
      }
    }
  }

  async update() {
    const { ctx } = this;
    const body = ctx.request.body;
    const userServer = this.service.user;
    ctx.validate({
      email: { type: "email", required: false },
      password: { type: 'string', required: false },
      username: { type: 'string', required: false },
      channelDescription: { type: 'string', required: false },
      avatar: { type: 'string', required: false }
    }, body)
    const userService = this.service.user;
    if (body.email) {
      if (body.email !== ctx.user.username && await userServer.findByEmail(body.email)) {
        this.ctx.throw(422, 'email已存在')
      }
    }
    if (body.username) {
      if (body.username !== ctx.user.username && await userServer.findByUsername(body.username)) {
        this.ctx.throw(422, 'username已存在')
      }
    }

    if (body.password) {
      body.password = this.ctx.helper.md5(body.password)
    }
    const user = await userServer.updateUser(body);
    let newTokenObj = this.ctx.helper._.pick(user, [
      '_id', 'email', 'username', 'channelDescription', 'avatar'
    ])
    const token = userServer.createToken(newTokenObj)
    this.ctx.body = {
      user: {
        "email": user.email,
        "token": token,
        "username": user.username,
        "channelDescription": user.channelDescription,
        "avatar": user.avatar
      }
    }
  }
  async subscribe() {
    const _id = this.ctx.user._id;
    const channelId = this.ctx.params.userId;
    if (_id === channelId) {
      this.ctx.throw(422, '用户不能订阅自己')
    }
    const user = await this.service.user.subscribe(_id, channelId);
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username', 'email', 'avatar', 'conver',
          'channelDescription', 'subscribersCount'
        ]),
        isSubscribed: true
      }
    }
  }
  async unSubscribe() {
    const _id = this.ctx.user._id;
    const channelId = this.ctx.params.userId;
    if (_id === channelId) {
      this.ctx.throw(422, '用户不能取消订阅自己')
    }
    const user = await this.service.user.unSubscribe(_id, channelId);
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username', 'email', 'avatar', 'conver',
          'channelDescription', 'subscribersCount'
        ]),
        isSubscribed: false
      }
    }
  }
  async getUserById() {
    const loginUserId = this.ctx.user._id;
    let isSubscribed = false;
    if (this.ctx.user) {
      const record = await this.app.model.Subscription.findOne({
        user: loginUserId,
        channel: this.ctx.params.userId
      })
      if (record) {
        isSubscribed = true;
      }
    }
    const user = await this.app.model.User.findById(this.ctx.params.userId)
    if (!user) {
      this.ctx.throw(422, '用户不存在')
    }
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username', 'email', 'avatar', 'conver',
          'channelDescription', 'subscribersCount'
        ]),
        isSubscribed: false
      }
    }
  }
  async getSubscriptions() {
    const Subscription = this.app.model.Subscription;
    let subscription = await Subscription.find({
      user: this.ctx.params.userId
    }).populate('channel')
    subscription = subscription.map(item => {
      return this.ctx.helper._.pick(item.channel, [
        '_id', 'username', 'avatar'
      ])
    })
    this.ctx.body = {
      subscription
    }
  }
}

module.exports = UserController;
