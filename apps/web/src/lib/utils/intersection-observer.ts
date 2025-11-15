// ============================================
// FILE: app/home/_utils/intersection-observer.ts
// ============================================

export const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
}

export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options = observerOptions
) => {
  if (typeof window === 'undefined') return null
  
  return new IntersectionObserver(callback, options)
}