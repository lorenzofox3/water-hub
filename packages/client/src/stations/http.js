export const createService = (opts = {}) => {
    
    const {baseURL = 'http://localhost:9000'} = opts;
    
    return {
        async fetchAll() {
            const url = new URL('/stations', baseURL);
            const result = await fetch(url);
            if(!result.ok){
                throw new Error(result.status);
            }
            
            return result.json();
        }
    };
};

export default createService();
