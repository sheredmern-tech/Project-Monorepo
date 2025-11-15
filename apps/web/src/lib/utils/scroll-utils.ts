// ============================================
// FILE: app/home/_utils/scroll-utils.ts
// ============================================

export const scrollToSection = (href: string) => {
  const element = document.querySelector(href)
  if (element) {
    const offset = 80 // navbar height
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

export const getScrollProgress = () => {
  const winScroll = document.documentElement.scrollTop
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
  return (winScroll / height) * 100
}