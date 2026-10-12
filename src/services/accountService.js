import { supabase } from '@/lib/supabase';
export const accountService = {
    async getAccounts(userId) {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return (data?.map((acc) => ({
                id: acc.id,
                userId: acc.user_id,
                accountNumber: acc.account_number,
                accountType: acc.account_type,
                balance: acc.balance,
                currency: acc.currency,
                status: acc.status,
                createdAt: acc.created_at,
                updatedAt: acc.updated_at,
            })) || []);
        }
        catch (error) {
            console.error('Error fetching accounts:', error);
            throw error;
        }
    },
    async getAccountById(accountId, userId) {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('id', accountId)
                .eq('user_id', userId)
                .single();
            if (error) {
                console.warn('Failed to fetch account:', error);
                return null;
            }
            return data
                ? {
                    id: data.id,
                    userId: data.user_id,
                    accountNumber: data.account_number,
                    accountType: data.account_type,
                    balance: data.balance,
                    currency: data.currency,
                    status: data.status,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                }
                : null;
        }
        catch (error) {
            console.error('Error fetching account:', error);
            return null;
        }
    },
};
