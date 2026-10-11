import { supabase } from '@/lib/supabase';
export const transactionService = {
    async getTransactions(userId, filters = {}) {
        try {
            if (!supabase)
                return [];
            let query = supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId);
            if (filters.accountId) {
                query = query.eq('account_id', filters.accountId);
            }
            if (filters.type) {
                query = query.eq('type', filters.type);
            }
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.startDate) {
                query = query.gte('created_at', filters.startDate.toISOString());
            }
            if (filters.endDate) {
                query = query.lte('created_at', filters.endDate.toISOString());
            }
            query = query.order('created_at', { ascending: false });
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            if (filters.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
            }
            const { data, error } = await query;
            if (error)
                throw error;
            return (data?.map((txn) => ({
                id: txn.id,
                accountId: txn.account_id,
                type: txn.type,
                amount: txn.amount,
                description: txn.description,
                status: txn.status,
                createdAt: txn.created_at,
                completedAt: txn.completed_at,
            })) || []);
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },
    async getTransactionById(transactionId, userId) {
        try {
            if (!supabase)
                return null;
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', transactionId)
                .eq('user_id', userId)
                .single();
            if (error)
                throw error;
            return data
                ? {
                    id: data.id,
                    accountId: data.account_id,
                    type: data.type,
                    amount: data.amount,
                    description: data.description,
                    status: data.status,
                    createdAt: data.created_at,
                    completedAt: data.completed_at,
                }
                : null;
        }
        catch (error) {
            console.error('Error fetching transaction:', error);
            throw error;
        }
    },
    async createTransfer(userId, sourceAccountId, recipientName, amount, description) {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        try {
            if (!supabase) {
                return {
                    id,
                    accountId: sourceAccountId,
                    type: 'debit',
                    amount,
                    description: `Transfer to ${recipientName}: ${description}`,
                    status: 'completed',
                    createdAt: now,
                    completedAt: now,
                };
            }
            const { error } = await supabase.from('transactions').insert([
                {
                    id,
                    user_id: userId,
                    account_id: sourceAccountId,
                    type: 'debit',
                    amount,
                    description: `Transfer to ${recipientName}: ${description}`,
                    status: 'completed',
                    created_at: now,
                    completed_at: now,
                },
            ]);
            if (error) {
                console.warn('Failed to create transfer in Supabase:', error);
            }
            return {
                id,
                accountId: sourceAccountId,
                type: 'debit',
                amount,
                description: `Transfer to ${recipientName}: ${description}`,
                status: 'completed',
                createdAt: now,
                completedAt: now,
            };
        }
        catch (error) {
            console.error('Error creating transfer:', error);
            throw new Error('Failed to create transfer');
        }
    },
};
