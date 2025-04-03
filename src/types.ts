import * as THREE from "three";

export interface PoiData {
    id: string;
    name: string;
    position: THREE.Vector3Tuple;
    objUrl: string;
    mtlUrl: string;
    cameraTarget: THREE.Vector3Tuple;
    cameraPositionOffset: THREE.Vector3Tuple;
    scale: number;
    rotation: THREE.Vector3Tuple;
}

export interface CameraState {
    position: THREE.Vector3Tuple;
    target: THREE.Vector3Tuple;
}
