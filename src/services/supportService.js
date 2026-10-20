import { supabase } from '@/lib/supabase';
export const supportService = {
    async listConversations(userId) {
        const { data, error } = await supabase.from('support_conversations').select('id,subject,status,created_at,updated_at').eq('user_id', userId).order('updated_at', { ascending: false });
        return { data: (data || []), error };
    },
    async getConversation(userId, id) {
        const { data, error } = await supabase.from('support_conversations').select('id,subject,status,created_at,updated_at').eq('id', id).eq('user_id', userId).maybeSingle();
        return { data: data, error };
    },
    async listMessages(userId, conversationId) {
        const conversation = await this.getConversation(userId, conversationId);
        if (conversation.error || !conversation.data)
            return { data: [], error: conversation.error || new Error('Conversation not found') };
        const { data, error } = await supabase.from('support_messages').select('id,conversation_id,sender_role,body,created_at').eq('conversation_id', conversationId).eq('is_internal', false).order('created_at', { ascending: true });
        return { data: (data || []), error };
    },
    async createConversation(userId, subject, body) {
        const { data: conversation, error: conversationError } = await supabase.from('support_conversations').insert({ user_id: userId, subject: subject.trim(), status: 'open' }).select('id,subject,status,created_at,updated_at').single();
        if (conversationError || !conversation)
            return { data: null, error: conversationError || new Error('Conversation could not be created') };
        const { error: messageError } = await supabase.from('support_messages').insert({ conversation_id: conversation.id, sender_id: userId, sender_role: 'member', body: body.trim(), is_internal: false });
        return { data: conversation, error: messageError };
    },
    async sendMessage(userId, conversationId, body) {
        const conversation = await this.getConversation(userId, conversationId);
        if (conversation.error || !conversation.data)
            return { error: conversation.error || new Error('Conversation not found') };
        return supabase.from('support_messages').insert({ conversation_id: conversationId, sender_id: userId, sender_role: 'member', body: body.trim(), is_internal: false });
    },
};
