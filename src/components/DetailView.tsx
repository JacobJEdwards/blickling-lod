import {PoiData} from "../types.ts";
import {FC, Suspense} from "react";
import Loader from "./Loader.tsx";
import ObjDetailViewer from "./ObjDetailViewer.tsx";
import BackButton from "./BackButton.tsx";

interface DetailViewProps {
    isVisible: boolean;
    activePoi: PoiData | null;
    isTransitioning: boolean;
    onBackClick: () => void;
}

export const DetailView: FC<DetailViewProps> = ({ isVisible, activePoi, isTransitioning, onBackClick }) => {
    if (!isVisible || !activePoi) return null;

    return (
        <Suspense fallback={<Loader message={`Loading ${activePoi.name}...`}/>}>
            <ObjDetailViewer
                key={activePoi.id}
                objUrl={activePoi.objUrl}
                mtlUrl={activePoi.mtlUrl}
                position={activePoi.position}
                scale={activePoi.scale}
                rotation={activePoi.rotation}
            />
            {!isTransitioning && <BackButton onClick={onBackClick}/>}
        </Suspense>
    );
};

export default DetailView;