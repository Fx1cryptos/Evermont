import { ValidationError } from '@/types'

export const validateEmail = (email: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' })
  }
  
  return errors
}

export const validatePassword = (password: string): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' })
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' })
  }
  
  return errors
}

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' })
  }
  
  return errors
}

export const validateName = (name: string, fieldName: string = 'Name'): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (!name.trim()) {
    errors.push({ field: 'name', message: `${fieldName} is required` })
  } else if (name.trim().length < 2) {
    errors.push({ field: 'name', message: `${fieldName} must be at least 2 characters` })
  }
  
  return errors
}

export const validatePhone = (phone: string): ValidationError[] => {
  const errors: ValidationError[] = []
  if (phone && !/^[\d+\-\s()]+$/.test(phone)) {
    errors.push({ field: 'phone', message: 'Invalid phone number format' })
  }
  return errors
}

export const validateZipCode = (zipCode: string): ValidationError[] => {
  const errors: ValidationError[] = []
  if (zipCode && !/^[\d\-]+$/.test(zipCode)) {
    errors.push({ field: 'zipCode', message: 'Invalid ZIP code format' })
  }
  return errors
}

export const combineErrors = (...errorArrays: ValidationError[][]): ValidationError[] => {
  return errorArrays.flat().filter((error, index, self) =>
    index === self.findIndex(e => e.field === error.field)
  )
}
