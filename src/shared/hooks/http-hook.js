import { useCallback, useState, useRef, useEffect } from 'react';

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const activeHttpRequests = useRef([]);

    const sendRequest = useCallback( async (
        url, 
        method = 'GET', 
        body = null, 
        headers = {}
    ) => {
        setIsLoading(true);
        const httpAbortCrtl = new AbortController();
        activeHttpRequests.current.push(httpAbortCrtl);
        
        try {
            const response = await fetch(url, {
                method, 
                body,
                headers,
                signal: httpAbortCrtl.signal
            });
        
            const responseData = await response.json();
        
            activeHttpRequests.current = activeHttpRequests.current.filter(
                reqCtrl => reqCtrl !== httpAbortCrtl
            );
            
            if (!response.ok) {
            throw new Error(responseData.message)
            }
            setIsLoading(false);
            return responseData;
        } catch (err) {
            setError(err.message)
            throw err;
        }

    }, []);

    const clearError = () => {
        setError(null);
    };

    useEffect(() => {
        return () => {
            activeHttpRequests.current.forEach(AbortCtrl => AbortCtrl.abort())
        };
    },[])

    return { isLoading, error, sendRequest, clearError}
};