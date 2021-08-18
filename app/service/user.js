const Service = require('egg').Service;
const jwt = require('jsonwebtoken')

class UserService extends Service {
  get User() {
    return this.app.model.User
  }

  async findByEmail(email) {
    return this.User.findOne({
      email
    }).select("+password")
  }
  async findByUsername(username) {
    return this.User.findOne({
      username
    })
  }
  async createUser(data) {
    data.password = this.ctx.helper.md5(data.password)
    const user = new this.User(data);
    await user.save()
    return user
  }
  createToken(data) {
    return jwt.sign(data, this.app.config.jwt.secret, {
      expiresIn: this.app.config.jwt.expiresIn
    })
  }
  verifyToken(token) {
    return jwt.verify(token, this.app.config.jwt.secret)
  }
  updateUser(data) {
    return this.User.findByIdAndUpdate(this.ctx.user._id, data, {
      new: true
    })
  }
  async subscribe(userId, channelId) {
    const { Subscription, User } = this.app.model;
    const record = await Subscription.findOne({
      user: userId,
      channel: channelId
    })
    const user = await User.findById(channelId);
    console.log(record);
    if (!record) {
      await new Subscription({
        user: userId,
        channel: channelId
      }).save()
      user.subscribersCount++;
      user.save()
    }
    return user
  }
  async unSubscribe(userId, channelId) {
    const { Subscription, User } = this.app.model;
    const record = await Subscription.findOne({
      user: userId,
      channel: channelId
    })
    const user = await User.findById(channelId);
    if (record) {
      await record.remove()
      user.subscribersCount--;
      user.save()
    }
    return user
  }

}
module.exports = UserService