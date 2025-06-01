import {CameraState, PoiData} from "./types.ts";
import {CameraProps} from "@react-three/fiber";

export const ROOM_WIDTH = 5;
export const ROOM_DEPTH = 20;
export const ROOM_HEIGHT = 3;
export const PLAYER_HEIGHT = 1.6;
export const CAMERA_ANIMATION_SPEED = 2.5;
export const POI_HITBOX_RADIUS = 0.3;

export const POINTS_OF_INTEREST: readonly Readonly<PoiData>[] = [
    // {
    //     id: 'detail_1',
    //     name: 'Lady With Vase',
    //     position: [-2, ROOM_HEIGHT, -1.5],
    //     objUrl: '/details/LadyWithVase/ladywithvase2.obj',
    //     mtlUrl: '/details/LadyWithVase/ladywithvase2.mtl',
    //     cameraTarget: [0, 0, 0],
    //     cameraPositionOffset: [0, 0, 5],
    //     scale: 0.001,
    //     rotation: [degToRad(0), degToRad(0), degToRad(0)],
    // },
    {
        id: 'detail_2',
        name: 'Shield',
        position: [0,0,0],
        objUrl: '/details/Shield/shield3.obj',
        mtlUrl: '/details/Shield/shield3.mtl',
        cameraTarget: [-0.1, ROOM_HEIGHT * 1.22, 1.69],
        cameraPositionOffset: [0, -3, 5],
        scale: 1,
        rotation: [0,0,0],
    },
] as const;

export const INITIAL_ROOM_VIEW_STATE: Readonly<CameraState> = {
    target: [0, PLAYER_HEIGHT, 0],
    position: [0, PLAYER_HEIGHT, ROOM_DEPTH / 2 - 1],
} as const;

export const INITIAL_CAMERA: Readonly<CameraProps> = {
    fov: 75,
    near: 0.1,
    far: 100,
    position: INITIAL_ROOM_VIEW_STATE.position,
} as const;
