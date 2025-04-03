import {RefObject, useEffect, useRef} from "react";
import * as THREE from "three";
import {useFrame, useThree} from "@react-three/fiber";
import {PointerLockControls as PointerLockControlsImpl} from "three-stdlib";
import {OrbitControls as OrbitControlsImpl} from "three-stdlib";
import {PLAYER_HEIGHT, ROOM_DEPTH, ROOM_WIDTH} from "../constants.ts";

export const usePreventClickPropagation = (ref: RefObject<HTMLElement | null>) => {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const stopPropagation = (e: Event) => e.stopPropagation();
        const events = ['pointerdown', 'pointerup', 'click', 'mousedown', 'mouseup'];
        events.forEach(event => el.addEventListener(event, stopPropagation));
        return () => {
            events.forEach(event => el.removeEventListener(event, stopPropagation));
        };
    }, [ref]);
};

export const usePlayerMovement = (isLocked: boolean) => {
    const moveForward = useRef(false);
    const moveBackward = useRef(false);
    const moveLeft = useRef(false);
    const moveRight = useRef(false);
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const { camera } = useThree();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp': case 'KeyW': moveForward.current = true; break;
                case 'ArrowLeft': case 'KeyA': moveLeft.current = true; break;
                case 'ArrowDown': case 'KeyS': moveBackward.current = true; break;
                case 'ArrowRight': case 'KeyD': moveRight.current = true; break;
            }
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp': case 'KeyW': moveForward.current = false; break;
                case 'ArrowLeft': case 'KeyA': moveLeft.current = false; break;
                case 'ArrowDown': case 'KeyS': moveBackward.current = false; break;
                case 'ArrowRight': case 'KeyD': moveRight.current = false; break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame((state, delta) => {
        const currentControls = state.controls as PointerLockControlsImpl | OrbitControlsImpl | null;

        console.log(`useFrame - isLocked: ${isLocked}, controls: ${currentControls?.constructor.name}, controlsLocked: ${currentControls && 'isLocked' in currentControls ? currentControls.isLocked : 'N/A'}`);

        // if (!isLocked || !(currentControls instanceof PointerLockControlsImpl) || !currentControls.isLocked) {
        //     velocity.current.lerp(new THREE.Vector3(0,0,0), 0.1);
        //     return;
        // }

        velocity.current.lerp(new THREE.Vector3(0, velocity.current.y, 0), delta * 10.0);

        direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
        direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
        direction.current.normalize();

        const speed = 40.0;
        if (moveForward.current || moveBackward.current) velocity.current.z -= direction.current.z * speed * delta;
        if (moveLeft.current || moveRight.current) velocity.current.x -= direction.current.x * speed * delta;

        if (currentControls instanceof PointerLockControlsImpl) {
            console.log("is good")
            currentControls.moveRight(-velocity.current.x * delta);
            currentControls.moveForward(-velocity.current.z * delta);
        }

        const camPos = camera.position;
        camPos.x = THREE.MathUtils.clamp(camPos.x, -ROOM_WIDTH / 2 + 0.5, ROOM_WIDTH / 2 - 0.5);
        camPos.z = THREE.MathUtils.clamp(camPos.z, -ROOM_DEPTH / 2 + 0.5, ROOM_DEPTH / 2 - 0.5);
        camPos.y = PLAYER_HEIGHT;
    });
};
