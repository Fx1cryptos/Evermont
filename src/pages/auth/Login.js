import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
export const Login = () => {
    const navigate = useNavigate();
    const { signIn, error: authError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password');
            return;
        }
        try {
            setLoading(true);
            await signIn(email, password);
            navigate(ROUTES.DASHBOARD);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs("div", { className: "bg-white rounded-lg shadow-md border border-evermont-border p-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-16 h-16 rounded-lg bg-evermont-blue text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4", children: "E" }), _jsx("h1", { className: "text-2xl font-bold text-evermont-blue", children: "EVERMONT" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Credit Union" })] }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 text-center mb-6", children: "Sign In" }), (error || authError) && (_jsx("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg", children: error || authError })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsx(Input, { type: "email", placeholder: "Email address", value: email, onChange: (e) => setEmail(e.target.value), disabled: loading, label: "Email", required: true }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: showPassword ? 'text' : 'password', placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), disabled: loading, label: "Password", required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-10 text-gray-600 hover:text-gray-900", tabIndex: -1, children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] }), _jsx(Button, { type: "submit", variant: "primary", size: "lg", className: "w-full", loading: loading, disabled: loading, children: loading ? 'Signing in...' : 'Sign In' })] }), _jsx("a", { href: "https://evermont.builder.cloud", className: "mt-4 block w-full rounded-md border border-[#0504AA] px-4 py-3 text-center text-sm font-semibold text-[#0504AA] transition-colors hover:bg-[#0504AA] hover:text-white", children: "Visit the public site" }), _jsxs("div", { className: "mt-6 space-y-3 text-center text-sm", children: [_jsx(Link, { to: ROUTES.FORGOT_PASSWORD, className: "block text-evermont-blue hover:underline", children: "Forgot your password?" }), _jsxs("div", { className: "text-gray-600", children: ["Don't have an account?", ' ', _jsx(Link, { to: ROUTES.REGISTER, className: "text-evermont-blue hover:underline font-medium", children: "Sign Up" })] })] })] }) }) }));
};
