import {CameraState, PoiData} from "./types.ts";
import {CameraProps} from "@react-three/fiber";

export const ROOM_WIDTH = 6;
export const ROOM_DEPTH = 16.5;
export const ROOM_HEIGHT = 3;
export const PLAYER_HEIGHT = 1.6;
export const CAMERA_ANIMATION_SPEED = 2.5;
export const POI_HITBOX_RADIUS = 0.3;

export const POINTS_OF_INTEREST: readonly Readonly<PoiData>[] = [
    {
        id: 'detail_1',
        name: 'Lady With Vase',
        position: [1, ROOM_HEIGHT + 1.1, 1],
        objUrl: '/details/LadyWithVase/ladywithvase2.obj',
        mtlUrl: '/details/LadyWithVase/ladywithvase2.mtl',
        cameraTarget: [0, 0, 0],
        cameraPositionOffset: [0, 0, 20],
        scale: 0.01,
        rotation: [0, 0, 0],
    },
    {
        id: 'detail_2',
        name: 'Shield',
        position: [-2, ROOM_HEIGHT + 1.1, -1.5],
        objUrl: '/details/Shield/shield3.obj',
        mtlUrl: '/details/Shield/shield3.mtl',
        cameraTarget: [0, 0, 0],
        cameraPositionOffset: [0, 0, 20],
        scale: 0.01,
        rotation: [0, 0, 0],
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
