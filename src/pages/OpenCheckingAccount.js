import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // adjust path to your client
export default function OpenCheckingAccount() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        dob: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        ssn: '',
        email: '',
        password: '',
    });
    const [idFile, setIdFile] = useState(null);
    const [addressFile, setAddressFile] = useState(null);
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
        });
        if (authError || !authData.user) {
            setMessage(authError?.message || 'Signup failed');
            setLoading(false);
            return;
        }
        const userId = authData.user.id;
        // 2. Insert profile
        const { error: profileError } = await supabase.from('profiles').insert({
            id: userId,
            full_name: form.fullName,
            phone_number: form.phone,
            date_of_birth: form.dob || null,
            address: form.address,
            city: form.city,
            state: form.state,
            zip_code: form.zip,
            ssn: form.ssn,
            account_type: 'checking',
        });
        if (profileError) {
            setMessage(profileError.message);
            setLoading(false);
            return;
        }
        // 3. Upload documents (if provided)
        const uploads = [
            { file: idFile, type: 'government_id' },
            { file: addressFile, type: 'proof_of_address' },
        ];
        for (const item of uploads) {
            if (!item.file)
                continue;
            const path = `${userId}/${item.type}-${Date.now()}-${item.file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('verification-documents')
                .upload(path, item.file);
            if (!uploadError) {
                await supabase.from('verification_documents').insert({
                    user_id: userId,
                    document_type: item.type,
                    file_path: path,
                });
            }
        }
        setMessage('Application submitted. Please check your email to confirm your account.');
        setLoading(false);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "max-w-lg mx-auto p-6 space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold text-[#0504AA]", children: "Open a Checking Account" }), _jsx("input", { name: "fullName", placeholder: "Full legal name", required: true, value: form.fullName, onChange: handleChange, className: "w-full border p-2 rounded" }), _jsx("input", { name: "phone", placeholder: "Phone number", required: true, value: form.phone, onChange: handleChange, className: "w-full border p-2 rounded" }), _jsx("input", { name: "dob", type: "date", placeholder: "Date of birth", required: true, value: form.dob, onChange: handleChange, className: "w-full border p-2 rounded" }), _jsx("input", { name: "address", placeholder: "Street address", required: true, value: form.address, onChange: handleChange, className: "w-full border p-2 rounded" }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsx("input", { name: "city", placeholder: "City", required: true, value: form.city, onChange: handleChange, className: "border p-2 rounded" }), _jsx("input", { name: "state", placeholder: "State", required: true, value: form.state, onChange: handleChange, className: "border p-2 rounded" }), _jsx("input", { name: "zip", placeholder: "ZIP", required: true, value: form.zip, onChange: handleChange, className: "border p-2 rounded" })] }), _jsx("input", { name: "ssn", placeholder: "SSN", required: true, value: form.ssn, onChange: handleChange, className: "w-full border p-2 rounded" }), _jsx("input", { name: "email", type: "email", placeholder: "Email", required: true, value: form.email, onChange: handleChange, className: "w-full border p-2 rounded" }), _jsx("input", { name: "password", type: "password", placeholder: "Password", required: true, value: form.password, onChange: handleChange, className: "w-full border p-2 rounded" }), _jsx("label", { className: "block text-sm", children: "Government ID" }), _jsx("input", { type: "file", accept: "image/*,.pdf", onChange: (e) => setIdFile(e.target.files?.[0] || null) }), _jsx("label", { className: "block text-sm", children: "Proof of address" }), _jsx("input", { type: "file", accept: "image/*,.pdf", onChange: (e) => setAddressFile(e.target.files?.[0] || null) }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-[#0504AA] text-white py-2 rounded font-semibold", children: loading ? 'Submitting…' : 'Submit Application' }), message && _jsx("p", { className: "text-sm text-center", children: message })] }));
}
