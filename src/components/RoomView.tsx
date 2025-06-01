import {FC, Fragment, ReactElement, Suspense} from "react";
import Loader from "./Loader.tsx";
import Room from "./Room.tsx";
import {Splat} from "@react-three/drei";
import {POINTS_OF_INTEREST, ROOM_HEIGHT} from "../constants.ts";
import {PoiData} from "../types.ts";
import PointOfInterest from "./PointOfInterest.tsx";
import {degToRad} from "three/src/math/MathUtils.js";
import DetailView from "./DetailView.tsx";

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
            <group position={[0, 1.5, 0]}>
            <Room />
            {/*<group position={[7.5, ROOM_HEIGHT, 0]}>*/}
            <group>
                <Splat
                    src="full_cleaned.splat"
                    toneMapped={false}
                    scale={1}
                    castShadow={false}
                    alphaTest={0.1}
                />
            </group>

            {POINTS_OF_INTEREST.map((poi: PoiData): ReactElement => (
                <Fragment key={poi.id}>
                    {/*<PointOfInterest*/}
                    {/*    onClick={() => onPoiClick(poi)}*/}
                    {/*    isTargeted={poi.id === targetedPoiId}*/}
                    {/*    {...poi}*/}
                    {/*/>*/}
                    <DetailView isVisible={true} activePoi={poi} isTransitioning={false} onBackClick={(): void => {}} />
                </Fragment>
            ))}
            </group>
        </Suspense>
    )

}