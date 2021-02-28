const defaultOptions = {
    cacheability: 'public',
    maxAge: 3600 * 24
};

export default ({
                    maxAge = 3600 * 24, // 24hours
                    cacheability = 'public'
                } = defaultOptions) => async (ctx, next) => {
    await next();
    if (ctx.body) {
        let directive = cacheability;
        if (maxAge) {
            directive += `, max-age=${maxAge}`;
        }
        ctx.set('Cache-Control', directive);
    }
}
