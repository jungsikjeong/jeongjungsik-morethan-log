import { useEffect, useState } from "react"

interface StarOrDot {
  left: number
  top: number
  color: string
  visible: boolean
  size: number
  life?: number
}

function throttle<F extends (...args: any[]) => any>(
  func: F,
  limit: number
): (...args: Parameters<F>) => void {
  let lastFunc: number
  let lastRan: number

  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = window.setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

const Sparkle = (): JSX.Element => {
  const sparkles = 50
  const [stars, setStars] = useState<StarOrDot[]>([])
  const [tinyDots, setTinyDots] = useState<StarOrDot[]>([])

  useEffect(() => {
    // 마우스 움직임 핸들러 : 화면에 최대 별 개수에 도달하지 않았을 때 새 별을 추가
    const moveHandler = throttle((e: MouseEvent) => {
      if (stars.length < sparkles) {
        setStars((prevStars) => [
          ...prevStars,
          {
            left: e.pageX,
            top: e.pageY,
            color: newColour(),
            visible: true,
            size: 5,
          },
        ])
      }
    }, 100)

    document.addEventListener("mousemove", moveHandler)
    return () => document.removeEventListener("mousemove", moveHandler)
  }, [stars.length])

  useEffect(() => {
    const update = () => {
      const [updatedStars, updatedTinyDots] = updateStarsAndDots(
        stars,
        tinyDots
      )
      setStars(updatedStars)
      setTinyDots(updatedTinyDots)
      requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
  }, [stars, tinyDots]) // 별과 작은 점 상태 업데이트에 따라 애니메이션 갱신

  return (
    <>
      {stars.map((star, i) => (
        <Star key={i} {...star} />
      ))}
      {tinyDots.map((dot, i) => (
        <TinyDot key={i} {...dot} />
      ))}
    </>
  )
}

// 초기 별 생성 및 상태 설정
const Star = ({ left, top, color, visible, size }: StarOrDot) => (
  <div
    style={{
      position: "absolute",
      left: `${left}px`,
      top: `${top}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      visibility: visible ? "visible" : "hidden",
      zIndex: 9999,
      // 별 모양을 위한 스타일
      clipPath:
        // "polygon(50% 0%, 50% 40%, 100% 40%, 100% 60%, 50% 60%, 50% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%, 40% 0%)"
        "polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)",
    }}
  />
)

// 작은 점 생성 및 상태 설정
const TinyDot = ({ left, top, color, visible }: StarOrDot) => (
  <div
    style={{
      position: "absolute",
      left: `${left}px`,
      top: `${top}px`,
      width: "2px",
      height: "2px",
      backgroundColor: color,
      visibility: visible ? "visible" : "hidden",
      zIndex: 9999,
    }}
  />
)

const updateStarsAndDots = (
  stars: StarOrDot[],
  tinyDots: StarOrDot[]
): [StarOrDot[], StarOrDot[]] => {
  // 별과 작은 점의 위치 및 가시성 업데이트
  const updatedStars = stars
    .map((star) => ({
      ...star,
      top: star.top + 1 + Math.random() * 3,
      left: star.left + (Math.random() - 0.5) * 2,
      visible: star.size > 2,
      size: star.size > 2 ? star.size - 0.05 : 2, // 별의 크기 감소 속도 조절
      life: star.size > 2 ? star.life : (star.life || 0) + 0.5, // 별의 수명 증가량 조절
    }))
    .filter((star) => star.size > 2 || (star.life && star.life < 100)) // life 조건도 조절해야 할 수 있음

  const updatedTinyDots = tinyDots
    .map((dot) => ({
      ...dot,
      life: (dot.life || 0) + 0.5, // 점의 수명 증가량 조절
    }))
    .filter((dot) => dot.life && dot.life < 100) // 점이 사라지는 조건 조절

  return [updatedStars, updatedTinyDots]
}

const newColour = (): string => {
  const c = [
    255,
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ].sort(() => 0.5 - Math.random())
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

export default Sparkle
