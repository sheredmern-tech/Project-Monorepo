// ============================================
// FILE: app/home/_utils/format-helpers.ts
// ============================================

export const formatPhoneNumber = (phone: string) => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format: +62 812 3456 7890
  if (cleaned.startsWith('62')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9)}`
  }
  
  return phone
}

export const formatWhatsAppLink = (phone: string, message = '') => {
  const cleaned = phone.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleaned}${message ? `?text=${encodedMessage}` : ''}`
}

export const formatEmail = (email: string) => {
  return `mailto:${email}`
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(date)
}

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}