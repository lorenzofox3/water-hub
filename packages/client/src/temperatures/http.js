export const createService = (opts = {}) => {
    
    const {baseURL = 'http://localhost:9000'} = opts;
    
    return {
        async fetch({month}) {
            const url = new URL('/temperatures', baseURL);
            const searchParams = new URLSearchParams({
                month
            });
            url.search = searchParams.toString();
            
            const result = await fetch(url);
            
            if (!result.ok) {
                throw new Error(result.status);
            }
            
            return result.json();
        }
    };
};

export default createService();
