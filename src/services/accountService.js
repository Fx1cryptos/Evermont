import { supabase } from '@/lib/supabase';
export const accountService = {
    async getAccounts(userId) {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Failed to fetch accounts from Supabase:', error);
            throw new Error('Unable to load your accounts. Please try again.');
        }
        return (data ?? []).map((acc) => ({
            id: acc.id,
            userId: acc.user_id,
            accountNumber: acc.account_number,
            accountType: acc.account_type,
            balance: String(acc.balance ?? '0'),
            currency: acc.currency,
            status: acc.status,
            createdAt: acc.created_at,
            updatedAt: acc.updated_at,
        }));
    },
    async getAccountById(accountId, userId) {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .eq('user_id', userId)
            .maybeSingle();
        if (error) {
            console.error('Failed to fetch account from Supabase:', error);
            throw new Error('Unable to load this account. Please try again.');
        }
        if (!data)
            return null;
        return {
            id: data.id,
            userId: data.user_id,
            accountNumber: data.account_number,
            accountType: data.account_type,
            balance: String(data.balance ?? '0'),
            currency: data.currency,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    },
};
