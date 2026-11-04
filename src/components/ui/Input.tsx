import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || React.useId()
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        id={inputId}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-evermont-gold focus:border-transparent ${error ? 'border-red-500' : 'border-evermont-border'} ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helpText && <p className="text-gray-500 text-sm mt-1">{helpText}</p>}
    </div>
  )
}
