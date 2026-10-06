import { useEffect, useState } from 'react';
import { accountService } from '@/services/accountService';
export const useAccounts = (userId) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await accountService.getAccounts(userId);
                setAccounts(data);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load accounts');
            }
            finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [userId]);
    return { accounts, loading, error };
};
