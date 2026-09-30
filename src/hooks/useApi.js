import { useState } from "react";

const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (...args) => {
        try {
            setLoading(true);
            setError(null);

            const result = await apiFunction(...args);

            setData(result);

            return result;
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Something went wrong";

            setError(message);

            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        execute,
    };
};

export default useApi;