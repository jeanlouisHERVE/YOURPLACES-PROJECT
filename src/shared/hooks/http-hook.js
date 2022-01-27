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
        const httpAbortCrtll = new AbortController();
        activeHttpRequests.current.push(httpAbortCrtll);
        
        try {
            const response = await fetch(url, {
                method, 
                body,
                headers,
                signal: httpAbortCrtll.signal
            });
        
            const responseData = await response.json();
        
            if (!response.ok) {
            throw new Error(responseData.message)
            }
            return responseData;

        } catch (err) {
            setError(err.message)
        }
        setIsLoading(false);
    }, []);

    const clearError = () => {
        setError(null);
    };

    useEffect(() => {
        return () => {
            activeHttpRequests.current.forEach(AbortCtrl => AbortCtrl.abort())
        };
    },[])

    return { isLoading, error, sendRequest}
};