'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const PHRASES = ['Real Projects.', 'Real Results.'] as const
const TYPE_SPEED = 80
const ERASE_SPEED = 50
const PAUSE_AFTER_TYPE = 2000
const PAUSE_AFTER_ERASE = 400

type Phase = 'typing' | 'pausing' | 'erasing' | 'switching'

function getPhrase(index: number): string {
	return PHRASES[index % PHRASES.length] ?? PHRASES[0]
}

export function TypewriterText() {
	const [displayText, setDisplayText] = useState('')
	const [phraseIndex, setPhraseIndex] = useState(0)
	const [phase, setPhase] = useState<Phase>('typing')
	const charIndex = useRef(0)
	const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

	const currentPhrase = getPhrase(phraseIndex)

	const tick = useCallback(() => {
		switch (phase) {
			case 'typing': {
				if (charIndex.current < currentPhrase.length) {
					charIndex.current += 1
					setDisplayText(currentPhrase.slice(0, charIndex.current))
					timerRef.current = setTimeout(tick, TYPE_SPEED)
				} else {
					setPhase('pausing')
				}
				break
			}
			case 'pausing': {
				timerRef.current = setTimeout(() => {
					setPhase('erasing')
				}, PAUSE_AFTER_TYPE)
				break
			}
			case 'erasing': {
				if (charIndex.current > 0) {
					charIndex.current -= 1
					setDisplayText(currentPhrase.slice(0, charIndex.current))
					timerRef.current = setTimeout(tick, ERASE_SPEED)
				} else {
					setPhase('switching')
				}
				break
			}
			case 'switching': {
				timerRef.current = setTimeout(() => {
					setPhraseIndex(prev => (prev + 1) % PHRASES.length)
					setPhase('typing')
				}, PAUSE_AFTER_ERASE)
				break
			}
		}
	}, [phase, currentPhrase])

	useEffect(() => {
		timerRef.current = setTimeout(
			tick,
			phase === 'typing' && charIndex.current === 0 ? PAUSE_AFTER_ERASE : 0
		)

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current)
			}
		}
	}, [tick, phase])

	return (
		<>
			<span className="sr-only">Real Projects. Real Results.</span>
			<span className="inline-block" aria-hidden="true">
				<span>{displayText}</span>
				<span className="inline-block w-[3px] h-[0.85em] bg-accent ml-0.5 align-baseline animate-blink" />
			</span>
		</>
	)
}
