import {FC, ReactElement, useRef, useState} from "react";
import {usePreventClickPropagation} from "../hooks/hooks.tsx";
import {Html} from "@react-three/drei";
import {PoiData} from "../types.ts";
import {POI_HITBOX_RADIUS} from "../constants.ts";

export const PoiHitbox: FC<PoiData> = (poi: PoiData): ReactElement => {
    return (
        <mesh
            userData={{isPoiHitbox: true, poi: poi}}
        >
            <sphereGeometry args={[POI_HITBOX_RADIUS, 16, 8]}/>
            <meshBasicMaterial visible={true} wireframe={true} color={"red"}/>
        </mesh>
    );
};


export type PoiProps = {
    onClick: () => void;
    isTargeted: boolean;
} & PoiData;

export const PointOfInterest: FC<PoiProps> = (data: PoiProps): ReactElement => {
    const {position, name, onClick, isTargeted} = data;
    const [mouseHovered, setMouseHovered] = useState(false);
    const htmlRef = useRef<HTMLDivElement>(null);
    usePreventClickPropagation(htmlRef);

    return (
        <group position={position}>
            <Html ref={htmlRef} center distanceFactor={10} zIndexRange={[100, 0]}>
                <div
                    style={{
                        cursor: 'pointer',
                        background: mouseHovered || isTargeted ? 'rgba(0, 150, 255, 0.9)' : 'rgba(0, 100, 200, 0.7)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.2s ease',
                        transform: 'translate(0, -50%)',
                        userSelect: 'none',
                    }}
                    onClick={(e): void => {
                        e.stopPropagation();
                        onClick();
                    }}
                    onPointerOver={(e): void => {
                        e.stopPropagation();
                        setMouseHovered(true);
                    }}
                    onPointerOut={(e): void => {
                        e.stopPropagation();
                        setMouseHovered(false);
                    }}
                >
                    {name}
                </div>
            </Html>
            <PoiHitbox
                {...data}
            ></PoiHitbox>
        </group>

    );
};

export default PointOfInterest;