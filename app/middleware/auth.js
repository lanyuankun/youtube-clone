module.exports = (option = { required: true }) => {
  return async (ctx, next) => {
    let token = ctx.headers['authorization'];
    token = token ? token.split('Bearer ')[1] : null;
    if (token) {
      try {
        const data = ctx.service.user.verifyToken(token)
        ctx.user = data;
      } catch (error) {
        ctx.throw(401)
      }
    } else if (option.required) {
      ctx.throw(401)
    }
    await next()
  }
}