'use client'
import { useEffect } from 'react'

export default function RevealObserver() {
  useEffect(() => {
    document.documentElement.classList.add('js')
    const reveals = document.querySelectorAll<HTMLElement>('.reveal')
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
        { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
      )
      reveals.forEach(el => io.observe(el))
      // safety net
      setTimeout(() => {
        reveals.forEach(el => {
          if (!el.classList.contains('in')) {
            el.style.transition = 'none'
            el.style.opacity = '1'
            el.style.transform = 'none'
          }
        })
      }, 2600)
    } else {
      reveals.forEach(el => el.classList.add('in'))
    }
    return () => document.documentElement.classList.remove('js')
  }, [])
  return null
}
