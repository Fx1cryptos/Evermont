import { supabase } from '@/lib/supabase';
export const activationService = {
    async listPaymentHistory(userId) {
        const { data, error } = await supabase
            .from('activation_payment_logs')
            .select('id,amount,currency,payment_method,payment_reference,status,fee_snapshot,metadata,created_at,updated_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return { data: (data || []), error };
    },
};
