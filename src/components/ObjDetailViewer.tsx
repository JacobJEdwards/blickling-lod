import * as THREE from "three";
import {FC, ReactElement, useMemo} from "react";
import {useLoader} from "@react-three/fiber";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {Object3D} from "three";

export interface ObjDetailProps {
    objUrl: string;
    mtlUrl: string;
    position: THREE.Vector3Tuple;
    scale: number;
    rotation: THREE.Vector3Tuple;
}

export const ObjDetailViewer: FC<ObjDetailProps> = ({
                                                        objUrl,
                                                        mtlUrl,
                                                        position,
                                                        scale,
                                                        rotation
                                                    }: ObjDetailProps): ReactElement => {
    const materials = useLoader(MTLLoader, mtlUrl);
    const obj = useLoader(OBJLoader, objUrl, (loader: OBJLoader): void => {
        materials.preload();
        loader.setMaterials(materials);
    });

    const objInstance = useMemo(() => {
        const cloned = obj.clone();
        cloned.position.set(...position);
        cloned.scale.set(scale, scale, scale);
        cloned.rotation.set(...rotation);
        cloned.traverse((child: Object3D): void => {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        return cloned;
    }, [obj, position, rotation, scale]);

    return <primitive object={objInstance}/>;
};

export default ObjDetailViewer;