import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { supabase } from '@/lib/supabase';
export const MemberDetailPage = () => {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async () => {
            if (!supabase || !id)
                return;
            try {
                const { data: memberData, error: memberError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (memberError || !memberData)
                    throw memberError ?? new Error('Member not found');
                const { data: accountData } = await supabase
                    .from('accounts')
                    .select('*')
                    .eq('user_id', id);
                setMember({
                    id: memberData.id,
                    email: memberData.email,
                    first_name: memberData.first_name,
                    last_name: memberData.last_name,
                    status: 'active',
                    created_at: memberData.created_at,
                    accounts: (accountData ?? []).map((account) => ({
                        id: account.id,
                        account_type: account.account_type,
                        account_number: account.account_number,
                        balance: account.balance,
                        status: account.status,
                        created_at: account.created_at,
                    })),
                });
            }
            catch (error) {
                console.error('Failed to load member detail:', error);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);
    if (loading) {
        return (_jsx(AdminLayout, { staffName: "Administrator", staffRole: "ADMIN", children: _jsx("div", { className: "p-6", children: "Loading member details..." }) }));
    }
    if (!member) {
        return (_jsx(AdminLayout, { staffName: "Administrator", staffRole: "ADMIN", children: _jsx("div", { className: "p-6", children: "Member not found." }) }));
    }
    return (_jsx(AdminLayout, { staffName: "Administrator", staffRole: "ADMIN", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "rounded-lg border border-evermont-border bg-white p-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Member Details" }), _jsxs("div", { className: "mt-4 grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: ["Name: ", member.first_name, " ", member.last_name] }), _jsxs("div", { children: ["Email: ", member.email] }), _jsxs("div", { children: ["Member ID: ", member.id] }), _jsxs("div", { children: ["Account status: ", _jsx(StatusBadge, { status: "active", label: member.status })] })] })] }), _jsxs("div", { className: "rounded-lg border border-evermont-border bg-white p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Accounts" }), _jsx("div", { className: "space-y-4", children: member.accounts.map((account) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: account.account_type }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Account ID: ", account.account_number] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-bold", children: ["$", Number(account.balance).toFixed(2)] }), _jsx(StatusBadge, { status: account.status === 'active' ? 'active' : 'pending', label: account.status })] })] }), _jsxs("div", { className: "mt-3 text-sm text-gray-600", children: ["Opened: ", new Date(account.created_at).toLocaleString()] })] }, account.id))) })] })] }) }));
};
