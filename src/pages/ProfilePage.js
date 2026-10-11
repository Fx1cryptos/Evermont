import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { PortalShell } from '@/components/member/PortalShell';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
export const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    useEffect(() => { if (user)
        void profileService.getProfile(user.id).then(setProfile); }, [user]);
    if (!profile)
        return _jsx(PortalShell, { title: "Your profile", children: _jsx("p", { className: "mt-8 text-slate-500", children: "Loading your profile..." }) });
    const save = async (event) => { event.preventDefault(); if (!user)
        return; setSaving(true); setMessage(''); const form = new FormData(event.currentTarget); try {
        const next = await profileService.updateProfile(user.id, { firstName: String(form.get('firstName') || ''), lastName: String(form.get('lastName') || ''), phone: String(form.get('phone') || ''), street: String(form.get('street') || ''), city: String(form.get('city') || ''), state: String(form.get('state') || ''), zipCode: String(form.get('zipCode') || ''), country: String(form.get('country') || '') });
        setProfile(next);
        setMessage('Profile updated successfully.');
    }
    catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to update your profile.');
    }
    finally {
        setSaving(false);
    } };
    const fields = [['firstName', 'First name', profile.firstName], ['lastName', 'Last name', profile.lastName], ['phone', 'Phone', profile.phone || ''], ['street', 'Street address', profile.street || ''], ['city', 'City', profile.city || ''], ['state', 'State', profile.state || ''], ['zipCode', 'ZIP code', profile.zipCode || ''], ['country', 'Country', profile.country || '']];
    return _jsx(PortalShell, { title: "Member profile", eyebrow: "Personal information", children: _jsxs("form", { onSubmit: save, className: "mt-8 max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8", children: [_jsx("div", { className: "grid gap-5 sm:grid-cols-2", children: fields.map(([name, label, value]) => _jsxs("label", { className: "text-sm font-semibold text-slate-700", children: [label, _jsx("input", { name: name, defaultValue: value, className: "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#0504AA]" })] }, name)) }), _jsxs("label", { className: "mt-5 block text-sm font-semibold text-slate-700", children: ["Email address", _jsx("input", { value: profile.email, readOnly: true, className: "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-500" })] }), message && _jsx("p", { className: "mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700", role: "status", children: message }), _jsxs("button", { disabled: saving, className: "mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0504AA] px-5 py-3 font-semibold text-white disabled:opacity-60", children: [_jsx(Save, { className: "size-4" }), saving ? 'Saving...' : 'Save changes'] })] }) });
};
