export default ({
                    stationsDB
                }) => async (ctx, next) => {
    const {state: {navigation: {URL: currentURL}}} = ctx;
    const url = new URL(currentURL);
    const {pathname, searchParams} = url;
    
    const code = searchParams.get('station');
    
    const [year, month] = pathname
        .split('/')
        .filter(Boolean)
        .map(Number);
    
    await stationsDB.useSamples({
        year,
        month,
        code
    });
    return next();
}
