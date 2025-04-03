import {FC, ReactElement, useRef} from "react";
import {usePreventClickPropagation} from "../hooks/hooks.tsx";
import {Html} from "@react-three/drei";

interface BackButtonProps {
    onClick: () => void;
}

export const BackButton: FC<BackButtonProps> = ({ onClick }: BackButtonProps): ReactElement => {
    const htmlRef = useRef<HTMLButtonElement>(null);

    usePreventClickPropagation(htmlRef);

    return (
        <Html position={[0, 1.5, -2]} center zIndexRange={[100, 0]} transform>
            <button
                ref={htmlRef}
                onClick={(e): void => { e.stopPropagation(); onClick(); }}
                style={{
                    padding: '8px 15px',
                    background: 'rgba(200, 50, 50, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                }}
            >
                Back to Room
            </button>
        </Html>
    );
};

export default BackButton;