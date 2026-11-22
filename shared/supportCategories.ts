export const complaintCategories = [
  'Account Access', 'Transactions', 'Cards', 'Beneficiaries', 'Statements', 'Account Activation', 'General Enquiry',
] as const

export type ComplaintCategory = typeof complaintCategories[number]

// Store the category in the existing searchable ticket subject; historical subjects stay untouched.
export const complaintSubject = (category: ComplaintCategory, subject: string) => `${category}: ${subject.trim()}`

export function isHumanComplaint(subject: unknown): boolean {
  return typeof subject === 'string' && complaintCategories.some(category => subject.startsWith(category + ': '))
}
