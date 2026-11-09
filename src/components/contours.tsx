// Hand-authored topographic contours — the department's terrain, drawn light.
export function Contours({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 600" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const s = 1 + i * 0.16
          return (
            <g key={i} transform={`translate(400 320) scale(${s}) translate(-400 -320)`}>
              <path d="M120 340 C 180 250, 300 240, 340 300 C 380 360, 300 420, 240 400 C 180 380, 90 420, 120 340 Z" />
              <path d="M170 330 C 215 280, 295 280, 320 315 C 345 350, 290 385, 250 372 C 210 360, 140 385, 170 330 Z" />
              <path d="M215 325 C 245 300, 290 302, 305 320 C 320 338, 285 355, 258 348 C 231 341, 195 344, 215 325 Z" />
              <path d="M355 190 C 420 150, 520 165, 545 215 C 570 265, 500 300, 445 282 C 400 268, 330 240, 355 190 Z" />
              <path d="M395 200 C 440 172, 505 182, 520 212 C 535 242, 490 262, 455 250 C 425 240, 372 220, 395 200 Z" />
              <path d="M520 380 C 570 350, 650 360, 668 400 C 686 440, 630 465, 588 450 C 555 438, 490 405, 520 380 Z" />
              <path d="M555 388 C 590 368, 640 374, 650 398 C 660 422, 625 437, 597 428 C 575 421, 535 403, 555 388 Z" />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
