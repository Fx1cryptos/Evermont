import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { LEDGER_ENTRY_COLUMNS, mapLedgerRow } from '@/utils/ledgerMapping';
const toActivity = (entry) => ({
    id: entry.id,
    accountId: entry.accountId,
    memberId: entry.memberId,
    type: entry.direction,
    direction: entry.direction,
    amount: entry.amount,
    displayAmount: entry.displayAmount,
    description: entry.description,
    status: entry.status,
    createdAt: entry.createdAt,
    completedAt: entry.status === 'completed' ? entry.createdAt : null,
    referenceId: entry.referenceId,
    entryType: entry.entryType,
    category: entry.category,
    debit: entry.debit,
    credit: entry.credit,
    balanceAfter: entry.balanceAfter,
});
const applyWindow = (rows, filters) => {
    if (!filters.limit || filters.limit < 1)
        return rows;
    const offset = filters.offset && filters.offset > 0 ? filters.offset : 0;
    return rows.slice(offset, offset + filters.limit);
};
export const transactionService = {
    /**
     * Member activity is read from public.ledger_entries.
     * There is no demo transaction list: an empty ledger stays empty.
     */
    async getTransactions(userId, filters = {}) {
        if (!userId || !isSupabaseConfigured)
            return [];
        try {
            let query = supabase
                .from('ledger_entries')
                .select(LEDGER_ENTRY_COLUMNS)
                .eq('member_id', userId)
                .order('created_at', { ascending: false })
                .order('id', { ascending: false });
            if (filters.accountId)
                query = query.eq('account_id', filters.accountId);
            if (filters.status)
                query = query.eq('status', filters.status);
            if (filters.startDate)
                query = query.gte('created_at', filters.startDate.toISOString());
            if (filters.endDate)
                query = query.lte('created_at', filters.endDate.toISOString());
            // Direction depends on entry_type and the posted columns, so a type
            // filter is applied after mapping. Unfiltered pages can be windowed in SQL.
            if (!filters.type && filters.limit && filters.limit > 0) {
                const offset = filters.offset && filters.offset > 0 ? filters.offset : 0;
                query = query.range(offset, offset + filters.limit - 1);
            }
            const { data, error } = await query;
            if (error) {
                console.error('Failed to fetch ledger entries');
                throw new Error('Unable to load transaction history.');
            }
            let rows = (data || []).map((row) => toActivity(mapLedgerRow(row)));
            if (filters.type)
                rows = rows.filter((row) => row.direction === filters.type);
            return filters.type ? applyWindow(rows, filters) : rows;
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Unable to load transaction history.')
                throw error;
            console.error('Error fetching ledger entries');
            throw new Error('Unable to load transaction history.');
        }
    },
    async getTransactionById(transactionId, userId) {
        if (!transactionId || !userId || !isSupabaseConfigured)
            return null;
        const { data, error } = await supabase
            .from('ledger_entries')
            .select(LEDGER_ENTRY_COLUMNS)
            .eq('id', transactionId)
            .eq('member_id', userId)
            .maybeSingle();
        if (error) {
            console.error('Failed to fetch ledger entry');
            throw new Error('Unable to load transaction.');
        }
        return data ? toActivity(mapLedgerRow(data)) : null;
    },
    /**
     * Browser code must not insert a completed transfer or change a balance.
     * Posting belongs to the database function public.create_ledger_entry.
     */
    async createTransfer(userId, sourceAccountId, recipientName, amount, description) {
        void userId;
        void sourceAccountId;
        void recipientName;
        void amount;
        void description;
        throw new Error('Transfers are not posted from the browser. No ledger entry was created.');
    },
};
