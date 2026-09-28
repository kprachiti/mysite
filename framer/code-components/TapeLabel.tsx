// Framer code component: yellow "duct-tape" section label with a peeled corner.
// Port of .featured-tag in source/css/style.css ("featured projects", "get to know me!", "contact me").
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function TapeLabel({ text, rotation, tape, peel, color, font }) {
    return (
        <div
            style={{
                position: "relative",
                display: "inline-block",
                background: tape,
                color,
                padding: "12px 30px 12px 22px",
                transform: `rotate(${rotation}deg)`,
                boxShadow: "0 10px 18px rgba(24, 36, 73, 0.14)",
                whiteSpace: "nowrap",
                ...font,
            }}
        >
            {text}
            <span
                aria-hidden
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 22,
                    height: 22,
                    background: `linear-gradient(135deg, ${peel} 46%, ${tape} 47%)`,
                    clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                    boxShadow: "-2px 2px 5px rgba(24, 36, 73, 0.18)",
                }}
            />
        </div>
    )
}

TapeLabel.defaultProps = {
    text: "featured projects",
    rotation: -2,
    tape: "#F7ECAB",
    peel: "#FFFDF2",
    color: "#182449",
    font: { fontFamily: "'Sometype Mono', monospace", fontWeight: 700, fontSize: 15 },
}

addPropertyControls(TapeLabel, {
    text: { type: ControlType.String },
    rotation: { type: ControlType.Number, min: -10, max: 10, step: 0.5, unit: "°" },
    tape: { type: ControlType.Color },
    peel: { type: ControlType.Color },
    color: { type: ControlType.Color, title: "Text" },
    font: { type: ControlType.Font, controls: "extended", defaultFontType: "monospace" },
})
