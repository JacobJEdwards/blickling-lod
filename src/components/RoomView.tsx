import {FC, Fragment, ReactElement, Suspense} from "react";
import Loader from "./Loader.tsx";
import Room from "./Room.tsx";
import {Splat} from "@react-three/drei";
import {POINTS_OF_INTEREST, ROOM_HEIGHT} from "../constants.ts";
import {PoiData} from "../types.ts";
import PointOfInterest from "./PointOfInterest.tsx";

export interface RoomViewProps {
    isVisible: boolean;
    targetedPoiId: string | null;
    onPoiClick: (poiData: PoiData) => void;
}

export const RoomView: FC<RoomViewProps> = ({isVisible, onPoiClick, targetedPoiId}) => {
    if (!isVisible) {
        return null;
    }

    return (
        <Suspense fallback={<Loader message={"Loading room..."} />}>
            <Room />
            <group position={[3, ROOM_HEIGHT - 1.5, 0]}>
                <Splat
                    src="/splat.splat"
                    rotation={[0, 15, 0]}
                    toneMapped={false}
                    scale={15}
                    castShadow={false}
                    alphaTest={0.1}
                />
            </group>

            {POINTS_OF_INTEREST.map((poi: PoiData): ReactElement => (
                <Fragment key={poi.id}>
                    <PointOfInterest
                        onClick={() => onPoiClick(poi)}
                        isTargeted={poi.id === targetedPoiId}
                        {...poi}
                    />
                </Fragment>
            ))}
        </Suspense>
    )

}