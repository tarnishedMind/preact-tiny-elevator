import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface IconProps {
    icon: IconDefinition
}

// Minimal replacement for @fortawesome/react-fontawesome: renders the icon's SVG path directly.
export function Icon({ icon }: IconProps) {
    const [width, height, , , path] = icon.icon;
    const paths = Array.isArray(path) ? path : [path];

    return (
        <svg
            class="icon"
            aria-hidden="true"
            focusable="false"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${width} ${height}`}
        >
            {paths.map((d, i) => <path key={i} fill="currentColor" d={d} />)}
        </svg>
    );
}
