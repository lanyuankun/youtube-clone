module.exports = () => {
    return async function errorHandler(ctx, next) {
        try {
            await next()
        } catch (err) {
            ctx.app.emit('error', err, ctx)//错误日志
            const status = err.status || 500
            const errs =
                status === 500 && ctx.app.config.env === 'prod' ? 'server error' : err.message;
            ctx.body = { errs }
            if (status === 422) {
                ctx.body.detail = err.errors
            }
            ctx.status = status;
        }
    }
}