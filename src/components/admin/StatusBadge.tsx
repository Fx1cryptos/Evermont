import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

type StatusBadgeVariant = 'active' | 'pending' | 'suspended' | 'failed' | 'completed' | 'warning' | 'critical' | 'info'

const statusStyles: Record<StatusBadgeVariant, { bg: string; text: string; icon: React.ReactNode }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={14} /> },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <AlertTriangle size={14} /> },
  suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle size={14} /> },
  failed: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle size={14} /> },
  completed: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={14} /> },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <AlertTriangle size={14} /> },
  critical: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle size={14} /> },
  info: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Info size={14} /> },
}

interface StatusBadgeProps {
  status: StatusBadgeVariant
  label: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const style = statusStyles[status]

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
      {label}
    </span>
  )
}
