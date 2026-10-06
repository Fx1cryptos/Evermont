import { supabase } from '@/lib/supabase';
export const ledgerService = {
    async createLedgerEntry(params) {
        if (!supabase) {
            const now = new Date().toISOString();
            return {
                id: crypto.randomUUID(),
                accountId: params.accountId,
                memberId: params.memberId,
                referenceId: params.referenceId,
                entryType: params.entryType,
                amount: params.amount,
                debit: params.debit,
                credit: params.credit,
                description: params.description,
                category: params.category,
                status: params.status ?? 'completed',
                balanceAfter: params.amount,
                createdAt: now,
                updatedAt: now,
            };
        }
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('ledger_entries')
            .insert([
            {
                account_id: params.accountId,
                member_id: params.memberId,
                reference_id: params.referenceId,
                entry_type: params.entryType,
                amount: params.amount,
                debit: params.debit ?? null,
                credit: params.credit ?? null,
                description: params.description,
                category: params.category,
                status: params.status ?? 'completed',
                balance_after: params.amount,
                created_at: now,
                updated_at: now,
            },
        ])
            .select('*')
            .single();
        if (error)
            throw error;
        return {
            id: data.id,
            accountId: data.account_id,
            memberId: data.member_id,
            referenceId: data.reference_id,
            entryType: data.entry_type,
            amount: data.amount,
            debit: data.debit,
            credit: data.credit,
            description: data.description,
            category: data.category,
            status: data.status,
            balanceAfter: data.balance_after,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    },
    async getAccountHistory(accountId) {
        if (!supabase)
            return [];
        const { data, error } = await supabase
            .from('ledger_entries')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return (data ?? []).map((entry) => ({
            id: entry.id,
            accountId: entry.account_id,
            memberId: entry.member_id,
            referenceId: entry.reference_id,
            entryType: entry.entry_type,
            amount: entry.amount,
            debit: entry.debit,
            credit: entry.credit,
            description: entry.description,
            category: entry.category,
            status: entry.status,
            balanceAfter: entry.balance_after,
            createdAt: entry.created_at,
            updatedAt: entry.updated_at,
        }));
    },
};
