// Framer code component: first-visit "stamp" intro.
// Port of #intro-overlay + introStamp*/introMoveToCorner keyframes in source/css/style.css.
// Place once on the Home page, full-viewport, top of the layer stack.
import { useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const SESSION_KEY = "introShown"

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function IntroStamp({ stamp, background, ink, size, cornerX, cornerY, oncePerSession }) {
    const reduced = useReducedMotion()
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (reduced || RenderTarget.current() === RenderTarget.canvas) return
        try {
            if (oncePerSession && sessionStorage.getItem(SESSION_KEY)) return
            sessionStorage.setItem(SESSION_KEY, "1")
        } catch (e) {}
        setShow(true)
        const t = setTimeout(() => setShow(false), 1700)
        return () => clearTimeout(t)
    }, [])

    return (
        <AnimatePresence>
            {(show || RenderTarget.current() === RenderTarget.canvas) && (
                <motion.div
                    aria-hidden
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background,
                        pointerEvents: "none",
                    }}
                >
                    {/* ink ring on impact */}
                    <motion.span
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: [0.5, 0], scale: [0.3, 4.2] }}
                        transition={{ delay: 0.41, duration: 0.5, ease: "easeOut" }}
                        style={{ position: "absolute", width: 40, height: 40, borderRadius: "50%", border: `3px solid ${ink}` }}
                    />
                    {/* outer: travel to header logo slot */}
                    <motion.div
                        animate={{ x: `calc(-50vw + ${cornerX}px)`, y: `calc(-50vh + ${cornerY}px)` }}
                        transition={{ delay: 1.05, duration: 0.85, ease: [0.5, 0, 0.25, 1] }}
                    >
                        {/* inner: drop, squash-bounce, shrink */}
                        <motion.img
                            src={stamp?.src ?? stamp}
                            alt=""
                            initial={{ opacity: 0, y: "-32vh", rotate: -11, scale: 1.1 }}
                            animate={{
                                opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1],
                                y: ["-32vh", "0vh", "0.3vh", "-0.6vh", "0.2vh", "-0.1vh", "0vh", "0vh", "0vh"],
                                rotate: [-11, -4, -4, -4, -4, -4, -4, -4, -5],
                                scaleX: [1.1, 1.1, 1.22, 0.88, 1.06, 0.98, 1, 1, 0.24],
                                scaleY: [1.1, 1.1, 0.8, 1.16, 0.95, 1.02, 1, 1, 0.24],
                            }}
                            transition={{
                                duration: 1.9,
                                times: [0, 0.19, 0.29, 0.34, 0.39, 0.43, 0.48, 0.55, 1],
                                ease: "easeInOut",
                                delay: 0.05,
                            }}
                            style={{ width: size, height: "auto", filter: "drop-shadow(0 18px 26px rgba(24,36,73,0.35))" }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

IntroStamp.defaultProps = {
    background: "#F9F9F9",
    ink: "#182449",
    size: 150,
    cornerX: 42,
    cornerY: 50,
    oncePerSession: true,
}

addPropertyControls(IntroStamp, {
    stamp: { type: ControlType.ResponsiveImage, title: "Stamp" },
    background: { type: ControlType.Color },
    ink: { type: ControlType.Color, title: "Ink Ring" },
    size: { type: ControlType.Number, min: 60, max: 300, unit: "px" },
    cornerX: { type: ControlType.Number, title: "Logo X", min: 0, max: 200 },
    cornerY: { type: ControlType.Number, title: "Logo Y", min: 0, max: 200 },
    oncePerSession: { type: ControlType.Boolean, title: "Once/Session" },
})
