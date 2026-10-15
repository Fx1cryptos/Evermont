import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EVERMONT_COLORS as C } from '@/constants/design';
import { ROUTES } from '@/constants/routes';
export const ActivationRequiredModal = ({ open, onClose }) => {
    const navigate = useNavigate();
    useEffect(() => {
        if (!open)
            return;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape')
                onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);
    return !open ? null : (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4", role: "dialog", "aria-modal": "true", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-6 shadow-xl", style: { borderTop: `4px solid ${C.gold}` }, children: [_jsxs("div", { className: "mb-4 flex items-center justify-center gap-2 text-[#C9A227]", "aria-hidden": "true", children: [_jsx("span", { className: "h-px w-16 bg-[#C9A227]" }), _jsx("span", { className: "size-2 rotate-45 bg-[#C9A227]" }), _jsx("span", { className: "h-px w-16 bg-[#C9A227]" })] }), _jsx("h2", { className: "text-center text-xl font-semibold", style: { color: C.blue }, children: "Account Activation Required" }), _jsx("p", { className: "mt-4 text-center text-sm leading-6 text-slate-700", children: "Please contact our support team to confirm your account activation requirements before using this feature." }), _jsx("a", { href: "mailto:support@evermontcredit.online", className: "mt-4 block text-center text-sm font-semibold text-[#0504AA] underline", children: "Contact Support" }), _jsx("button", { onClick: onClose, className: "mt-6 w-full rounded-xl px-4 py-2 font-semibold text-white", style: { background: C.blue }, children: "OK" }), _jsx("button", { type: "button", onClick: () => { onClose(); navigate(ROUTES.ACCOUNTS); }, className: "mt-3 w-full rounded-xl border border-[#C9A227] px-4 py-2 font-semibold text-[#0504AA] transition hover:bg-[#fffaf0]", children: "Activate Your Account" })] }) }));
};
export default ActivationRequiredModal;
