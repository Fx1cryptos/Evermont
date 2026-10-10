import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
export const Register = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const update = (field) => (event) => {
        setForm((current) => ({ ...current, [field]: event.target.value }));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        const firstName = form.firstName.trim();
        const lastName = form.lastName.trim();
        const email = form.email.trim().toLowerCase();
        if (!firstName || !lastName || !email || !form.password || !form.confirmPassword) {
            setError('Please complete all required fields.');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        try {
            setLoading(true);
            const result = await signUp(email, form.password, firstName, lastName);
            if (result.session) {
                navigate(ROUTES.DASHBOARD, { replace: true });
            }
            else {
                setMessage('Account created. Check your email to confirm your membership, then sign in.');
            }
        }
        catch (signupError) {
            setError(signupError instanceof Error ? signupError.message : 'We could not create your account. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("main", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8", children: _jsxs("div", { className: "w-full max-w-md rounded-lg border border-evermont-border bg-white p-8 shadow-md", children: [_jsxs("div", { className: "mb-7 text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-evermont-blue text-2xl font-bold text-white", children: "E" }), _jsx("h1", { className: "text-2xl font-bold text-evermont-blue", children: "EVERMONT" }), _jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Credit Union" })] }), _jsx("h2", { className: "mb-6 text-center text-xl font-semibold text-gray-900", children: "Create your member account" }), error && _jsx("div", { role: "alert", className: "mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700", children: error }), message && _jsx("div", { role: "status", className: "mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700", children: message }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", noValidate: true, children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "First name", value: form.firstName, onChange: update('firstName'), disabled: loading, required: true }), _jsx(Input, { label: "Last name", value: form.lastName, onChange: update('lastName'), disabled: loading, required: true })] }), _jsx(Input, { type: "email", label: "Email address", value: form.email, onChange: update('email'), disabled: loading, required: true }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: showPassword ? 'text' : 'password', label: "Password", value: form.password, onChange: update('password'), disabled: loading, minLength: 8, required: true }), _jsx("button", { type: "button", "aria-label": showPassword ? 'Hide password' : 'Show password', onClick: () => setShowPassword((visible) => !visible), className: "absolute right-3 top-10 text-gray-600 hover:text-gray-900", children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] }), _jsx(Input, { type: "password", label: "Confirm password", value: form.confirmPassword, onChange: update('confirmPassword'), disabled: loading, required: true }), _jsx(Button, { type: "submit", variant: "primary", size: "lg", className: "w-full", loading: loading, disabled: loading, children: loading ? 'Creating account...' : 'Create account' })] }), _jsx("a", { href: "https://evermont.builder.cloud", className: "mt-4 block w-full rounded-md border border-[#0504AA] px-4 py-3 text-center text-sm font-semibold text-[#0504AA] transition-colors hover:bg-[#0504AA] hover:text-white", children: "Visit the public site" }), _jsxs("p", { className: "mt-6 text-center text-sm text-gray-600", children: ["Already a member? ", _jsx(Link, { to: ROUTES.LOGIN, className: "font-medium text-evermont-blue hover:underline", children: "Sign in" })] })] }) }));
};
