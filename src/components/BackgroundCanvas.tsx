import { useEffect, useRef } from 'react'
import { useZenStore } from '@/store'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
}

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const motion = useZenStore((state) => state.backgroundMotion)
  const sceneId = useZenStore((state) => state.currentSceneId)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let frame = 0
    let animation = 0
    let width = 0
    let height = 0
    let particles: Particle[] = []
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      particles = Array.from({ length: reduced ? 18 : 52 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.18,
        radius: 80 + Math.random() * 180,
        alpha: 0.015 + Math.random() * 0.035,
      }))
    }

    const tone =
      sceneId === 'deep-night'
        ? '74, 89, 118'
        : sceneId === 'rain-study'
          ? '133, 107, 76'
          : sceneId === 'morning-temple'
            ? '83, 112, 106'
            : sceneId === 'sunny-cafe'
              ? '154, 104, 68'
              : '74, 124, 89'

    const draw = () => {
      if (document.hidden) {
        animation = window.requestAnimationFrame(draw)
        return
      }

      frame += 1
      context.clearRect(0, 0, width, height)
      const strength = reduced ? 0.12 : motion / 100

      particles.forEach((particle, index) => {
        const drift = Math.sin((frame + index * 13) / 220)
        particle.x += particle.vx * strength + drift * 0.025
        particle.y += particle.vy * strength + Math.cos((frame + index * 7) / 280) * 0.018

        if (particle.x < -particle.radius) particle.x = width + particle.radius
        if (particle.x > width + particle.radius) particle.x = -particle.radius
        if (particle.y < -particle.radius) particle.y = height + particle.radius
        if (particle.y > height + particle.radius) particle.y = -particle.radius

        const gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius,
        )
        gradient.addColorStop(0, `rgba(${tone}, ${particle.alpha * strength})`)
        gradient.addColorStop(1, `rgba(${tone}, 0)`)
        context.fillStyle = gradient
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      })

      animation = window.requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(animation)
    }
  }, [motion, sceneId])

  return <canvas className="ink-canvas" ref={canvasRef} aria-hidden="true" />
}
