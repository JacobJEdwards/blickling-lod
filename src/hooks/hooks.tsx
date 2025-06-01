import {RefObject, useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {useFrame, useThree} from "@react-three/fiber";
import {PointerLockControls as PointerLockControlsImpl} from "three-stdlib";
import {OrbitControls as OrbitControlsImpl} from "three-stdlib";
import {PLAYER_HEIGHT, ROOM_DEPTH, ROOM_WIDTH} from "../constants.ts";
import {PoiData} from "../types.ts";

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

        if (!isLocked || !(currentControls instanceof PointerLockControlsImpl) || !currentControls.isLocked) {
            velocity.current.lerp(new THREE.Vector3(0,0,0), 0.1);
            return;
        }

        velocity.current.lerp(new THREE.Vector3(0, velocity.current.y, 0), delta * 10.0);

        direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
        direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
        direction.current.normalize();

        const speed = 40.0;
        if (moveForward.current || moveBackward.current) velocity.current.z -= direction.current.z * speed * delta;
        if (moveLeft.current || moveRight.current) velocity.current.x -= direction.current.x * speed * delta;

        currentControls.moveRight(-velocity.current.x * delta);
        currentControls.moveForward(-velocity.current.z * delta);

        const camPos = camera.position;
        // camPos.x = THREE.MathUtils.clamp(camPos.x, -ROOM_WIDTH / 2 + 0.5, ROOM_WIDTH / 2 - 0.5);
        // camPos.z = THREE.MathUtils.clamp(camPos.z, -ROOM_DEPTH / 2 + 0.5, ROOM_DEPTH / 2 - 0.5);
        camPos.y = PLAYER_HEIGHT;
    });
};

export const usePoiTargeting = (
    isExploring: boolean,
    isLocked: boolean,
    isTransitioning: boolean,
    isInit: boolean,
): string | null => {
    const {camera, scene} = useThree();
    const [targetedPoiId, setTargetedPoiId] = useState<string | null>(null);
    const targetingRaycaster = useRef(new THREE.Raycaster());
    const poiHitboxesRef = useRef<THREE.Object3D[]>([]);

    useEffect(() => {
        if (isExploring && !isTransitioning) {
            const hitboxes: THREE.Object3D[] = [];
            scene.traverse((object) => {
                if (object.userData.isPoiHitbox) {
                    hitboxes.push(object);
                }
            });
            poiHitboxesRef.current = hitboxes;
        } else {
            poiHitboxesRef.current = [];
        }
    }, [isExploring, isTransitioning, scene, isInit, isLocked]);

    console.log(poiHitboxesRef.current);

    useFrame((): void => {
        if (isExploring && isLocked && !isTransitioning && poiHitboxesRef.current.length > 0) {
            targetingRaycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
            const intersects = targetingRaycaster.current.intersectObjects(poiHitboxesRef.current, false);

            if (intersects.length > 0) {
                const firstHit = intersects[0];
                const hitPoi = firstHit.object.userData?.poi as PoiData | undefined;
                const currentTargetId = hitPoi?.id ?? null;

                if (currentTargetId !== targetedPoiId) {
                    setTargetedPoiId(currentTargetId);
                }
            } else {
                if (targetedPoiId !== null) {
                    setTargetedPoiId(null);
                }
            }
        } else {
            if (targetedPoiId !== null) {
                setTargetedPoiId(null);
            }
        }
    });

    useEffect(() => {
        if (!isExploring) {
            setTargetedPoiId(null);
        }
    }, [isExploring, isLocked, isTransitioning]);

    return targetedPoiId;
}