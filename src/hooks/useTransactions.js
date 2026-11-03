import { useEffect, useRef, useState } from 'react';
import { transactionService } from '@/services/transactionService';
export const useTransactions = (userId, filters) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const filtersRef = useRef(filters);
    filtersRef.current = filters;
    const start = filters?.startDate?.toISOString();
    const end = filters?.endDate?.toISOString();
    useEffect(() => {
        if (!userId) {
            setTransactions([]);
            setLoading(false);
            return;
        }
        let active = true;
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await transactionService.getTransactions(userId, filtersRef.current);
                if (active)
                    setTransactions(data);
            }
            catch (err) {
                if (active) {
                    setTransactions([]);
                    setError(err instanceof Error ? err.message : 'Failed to load transactions');
                }
            }
            finally {
                if (active)
                    setLoading(false);
            }
        };
        void fetchTransactions();
        return () => {
            active = false;
        };
    }, [userId, filters?.accountId, filters?.type, filters?.status, filters?.limit, filters?.offset, start, end]);
    return { transactions, loading, error };
};
