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
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }
        try {
            setLoading(true);
            await signIn(username, password);
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
    return (_jsx("main", { className: "min-h-screen bg-white text-[#101533]", children: _jsxs("div", { className: "mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]", children: [_jsxs("section", { className: "relative hidden overflow-hidden bg-[#0504AA] lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:p-12 xl:p-16", "aria-label": "Evermont private banking", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(201,162,39,0.22),transparent_32%),linear-gradient(145deg,#0504AA_0%,#07145c_100%)]" }), _jsxs("div", { className: "relative z-10", children: [_jsx("img", { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6322-tg87iWvXcAFbQxeY6odhRyl9qwRpt9.jpeg", alt: "Evermont Credit Union", className: "h-20 w-20 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20" }), _jsx("p", { className: "mt-10 max-w-lg text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-white xl:text-6xl", children: "Where private wealth is protected." }), _jsx("p", { className: "mt-6 max-w-md text-base leading-7 text-blue-100", children: "Secure access to your Evermont member relationship, accounts, and financial future." })] }), _jsx("div", { className: "relative z-10 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-sm", children: _jsx("img", { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6322-tg87iWvXcAFbQxeY6odhRyl9qwRpt9.jpeg", alt: "Evermont Credit Union private wealth visual", className: "h-56 w-full rounded-[1.5rem] object-cover opacity-90 xl:h-72" }) }), _jsx("p", { className: "relative z-10 text-xs uppercase tracking-[0.24em] text-[#e6ca75]", children: "Evermont Credit Union \u00B7 Secured Private Wealth Bank" })] }), _jsx("section", { className: "flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-14 xl:px-24", children: _jsxs("div", { className: "w-full max-w-[430px]", children: [_jsxs("div", { className: "mb-10 flex items-center gap-4 lg:hidden", children: [_jsx("img", { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6322-tg87iWvXcAFbQxeY6odhRyl9qwRpt9.jpeg", alt: "Evermont Credit Union", className: "h-14 w-14 rounded-xl object-cover shadow-md ring-1 ring-[#0504AA]/10" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-[#0504AA]", children: "Evermont Credit Union" }), _jsx("p", { className: "text-xs text-slate-500", children: "Secured Private Wealth Bank" })] })] }), _jsxs("div", { className: "mb-9", children: [_jsx("p", { className: "text-xs font-bold uppercase tracking-[0.24em] text-[#C9A227]", children: "Member portal" }), _jsx("h1", { className: "mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0504AA] sm:text-4xl", children: "Welcome back." }), _jsx("p", { className: "mt-3 text-sm leading-6 text-slate-500", children: "Sign in to continue to your secure Evermont account." })] }), (error || authError) && _jsx("div", { role: "alert", className: "mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700", children: error || authError }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsx(Input, { type: "text", placeholder: "Username", value: username, onChange: (e) => setUsername(e.target.value), disabled: loading, label: "Username", required: true }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: showPassword ? 'text' : 'password', placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), disabled: loading, label: "Password", required: true }), _jsx("button", { type: "button", "aria-label": showPassword ? 'Hide password' : 'Show password', onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-10 rounded-md text-slate-500 hover:text-[#0504AA]", disabled: loading, children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Link, { to: ROUTES.FORGOT_PASSWORD, className: "text-sm font-medium text-[#0504AA] hover:text-[#C9A227]", children: "Forgot password?" }) }), _jsx(Button, { type: "submit", variant: "primary", size: "lg", className: "w-full rounded-xl bg-[#0504AA] py-3.5 shadow-lg shadow-[#0504AA]/20 hover:bg-[#03037d]", loading: loading, disabled: loading, children: loading ? 'Signing in...' : 'Sign in securely' })] }), _jsxs("div", { className: "mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500", children: [_jsxs("p", { children: ["New to Evermont? ", _jsx(Link, { to: ROUTES.REGISTER, className: "font-semibold text-[#0504AA] hover:text-[#C9A227]", children: "Open an account" })] }), _jsxs("div", { className: "mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs", children: [_jsx("a", { href: "https://evermontcredit.online", target: "_blank", rel: "noreferrer", className: "font-medium text-[#0504AA] hover:text-[#C9A227]", children: "Visit Evermont Website" }), _jsx("a", { href: "mailto:support@evermontcredit.online", className: "hover:text-[#0504AA]", children: "Contact support" })] })] })] }) })] }) }));
};
