import * as THREE from "three";
import {FC, ReactElement, useMemo} from "react";
import {useLoader} from "@react-three/fiber";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";

export interface ObjDetailProps {
    objUrl: string;
    mtlUrl: string;
    position: THREE.Vector3Tuple;
    scale?: number;
    rotation?: THREE.Vector3Tuple;
}

export const ObjDetailViewer: FC<ObjDetailProps> = ({
                                                        objUrl,
                                                        mtlUrl,
                                                        position,
                                                        scale = 1,
                                                        rotation = [0, 0, 0]
                                                    }: ObjDetailProps): ReactElement => {
    const materials = useLoader(MTLLoader, mtlUrl);
    const obj = useLoader(OBJLoader, objUrl, (loader: OBJLoader) => {
        materials.preload();
        loader.setMaterials(materials);
    });

    const objInstance = useMemo(() => {
        const cloned = obj.clone();
        cloned.position.set(...position);
        cloned.scale.set(scale, scale, scale);
        cloned.rotation.set(...(rotation || [0, 0, 0]));
        cloned.traverse((child) => {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        return cloned;
    }, [obj, position, scale, rotation]);

    return <primitive object={objInstance}/>;
};

export default ObjDetailViewer;