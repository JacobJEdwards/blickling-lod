import {CameraState} from "../types.ts";
import React, {useEffect, useRef} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import {OrbitControls as OrbitControlsImpl} from "three-stdlib";
import {PointerLockControls as PointerLockControlsImpl} from "three-stdlib";
import * as THREE from "three";
import {CAMERA_ANIMATION_SPEED} from "../constants.ts";

export interface TransitionAnimatorProps {
    startState: CameraState | null;
    targetState: CameraState | null;
    onTransitionComplete: () => void;
    enabled: boolean;
}

export const TransitionAnimator: React.FC<TransitionAnimatorProps> = ({ startState, targetState, onTransitionComplete, enabled }) => {
    const { camera } = useThree();
    const controls = useThree((state) => state.controls) as OrbitControlsImpl | PointerLockControlsImpl | null;

    const targetPosRef = useRef(new THREE.Vector3());
    const targetLookAtRef = useRef(new THREE.Vector3());
    const startPosRef = useRef(new THREE.Vector3());
    const startLookAtRef = useRef(new THREE.Vector3());
    const animationProgress = useRef(0);
    const isAnimating = useRef(false);

    useEffect(() => {
        if (enabled && startState && targetState) {
            startPosRef.current.set(...startState.position);
            startLookAtRef.current.set(...startState.target);
            targetPosRef.current.set(...targetState.position);
            targetLookAtRef.current.set(...targetState.target);

            if (!isAnimating.current) {
                camera.position.copy(startPosRef.current);
                if (controls && controls instanceof OrbitControlsImpl && 'target' in controls) {
                    controls.target.copy(startLookAtRef.current);
                    controls.update();
                } else {
                    camera.lookAt(startLookAtRef.current);
                }
                camera.updateProjectionMatrix();
            }
            animationProgress.current = 0;
            isAnimating.current = true;

        } else {
            isAnimating.current = false;
        }
    }, [enabled, startState, targetState, camera, controls]);

    useFrame((_, delta) => {
        if (!isAnimating.current || !enabled) return;

        animationProgress.current += delta * CAMERA_ANIMATION_SPEED;
        const easedProgress = THREE.MathUtils.smoothstep(animationProgress.current, 0, 1);

        if (animationProgress.current < 1) {
            const currentPos = new THREE.Vector3().lerpVectors(startPosRef.current, targetPosRef.current, easedProgress);
            const currentLookAt = new THREE.Vector3().lerpVectors(startLookAtRef.current, targetLookAtRef.current, easedProgress);
            camera.position.copy(currentPos);

            if (controls && controls instanceof OrbitControlsImpl && controls.enabled && 'target' in controls) {
                controls.target.copy(currentLookAt);
                controls.update();
            } else {
                camera.lookAt(currentLookAt);
            }
            camera.updateProjectionMatrix();

        } else {
            camera.position.copy(targetPosRef.current);
            const finalLookAt = targetLookAtRef.current;

            if (controls && controls instanceof OrbitControlsImpl && 'target' in controls) {
                controls.target.copy(finalLookAt);
                controls.update();
            } else {
                camera.lookAt(finalLookAt);
            }
            camera.updateProjectionMatrix();

            isAnimating.current = false;
            onTransitionComplete();
        }
    });

    return null;
};

export default TransitionAnimator;