import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { asLedgerDecimal, isPositiveLedgerAmount, LEDGER_ENTRY_COLUMNS, mapLedgerRow } from '@/utils/ledgerMapping';
export const ledgerService = {
    /**
     * Posts through public.create_ledger_entry so balance_after is the database
     * value. Caller-supplied debit, credit, and balance figures are not written.
     * This method does not rewrite existing rows.
     */
    async createLedgerEntry(params) {
        if (!isSupabaseConfigured) {
            throw new Error('Ledger entries cannot be created without the database. No balance was changed.');
        }
        const amount = asLedgerDecimal(params.amount);
        if (!amount || !isPositiveLedgerAmount(amount)) {
            throw new Error('Amount must be a positive ledger amount.');
        }
        const { error } = await supabase.rpc('create_ledger_entry', {
            p_account_id: params.accountId,
            p_member_id: params.memberId,
            p_reference_id: params.referenceId,
            p_entry_type: params.entryType,
            p_amount: amount,
            p_description: params.description,
            p_category: params.category || 'general',
            p_status: params.status ?? 'completed',
        });
        if (error)
            throw error;
        const { data, error: readError } = await supabase
            .from('ledger_entries')
            .select(LEDGER_ENTRY_COLUMNS)
            .eq('reference_id', params.referenceId)
            .eq('member_id', params.memberId)
            .maybeSingle();
        if (readError || !data) {
            throw new Error('The ledger entry was not returned. No client-side balance was saved.');
        }
        return mapLedgerRow(data);
    },
    async getAccountHistory(accountId) {
        if (!accountId || !isSupabaseConfigured)
            return [];
        const { data, error } = await supabase
            .from('ledger_entries')
            .select(LEDGER_ENTRY_COLUMNS)
            .eq('account_id', accountId)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false });
        if (error)
            throw error;
        return (data ?? []).map((entry) => mapLedgerRow(entry));
    },
};
