import {FC, ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {useThree} from "@react-three/fiber";
import {CameraState, PoiData} from "../types.ts";
import {OrbitControls as OrbitControlsImpl, PointerLockControls as PointerLockControlsImpl} from "three-stdlib";
import {
    INITIAL_ROOM_VIEW_STATE,
    PLAYER_HEIGHT,
    POINTS_OF_INTEREST,
    ROOM_DEPTH,
    ROOM_HEIGHT,
    ROOM_WIDTH
} from "../constants.ts";
import {Html, OrbitControls, PointerLockControls, Stats, useProgress} from "@react-three/drei";
import {usePlayerMovement, usePoiTargeting, usePreventClickPropagation} from "../hooks/hooks.tsx";
import * as THREE from "three";
import Loader from "./Loader.tsx";
import TransitionAnimator from "./TransititionAnimator.tsx";
import {RoomView} from "./RoomView.tsx";
import DetailView from "./DetailView.tsx";

const SceneLighting: FC = (): ReactElement => (
    <>
        <ambientLight intensity={0.4}/>
        <hemisphereLight groundColor={0x444444} intensity={0.5}/>
        <directionalLight
            position={[8, 15, 10]}
            intensity={1.0}
            castShadow={true}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-ROOM_WIDTH * 1.5}
            shadow-camera-right={ROOM_WIDTH * 1.5}
            shadow-camera-top={ROOM_DEPTH * 1.5}
            shadow-camera-bottom={-ROOM_DEPTH * 1.5}
            shadow-bias={-0.0001}
        />
        <pointLight position={[0, ROOM_HEIGHT - 0.5, 0]} intensity={0.7} distance={ROOM_WIDTH * 1.5}
                    castShadow={true} shadow-mapSize={[1024, 1024]} shadow-bias={-0.001}/>
    </>)

export const Experience: FC = () => {
    const {camera, scene, gl} = useThree();

    const [activePoi, setActivePoi] = useState<PoiData | null>(null);
    const [isExploring, setIsExploring] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionStartState, setTransitionStartState] = useState<CameraState | null>(null);
    const [transitionTargetState, setTransitionTargetState] = useState<CameraState | null>(null);
    const [isInit, setInit] = useState<boolean>(false);
    const lastRoomCameraState = useRef<CameraState>(INITIAL_ROOM_VIEW_STATE);

    const pointerLockControlsRef = useRef<PointerLockControlsImpl>(null);
    const orbitControlsRef = useRef<OrbitControlsImpl>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const {active: assetsLoading} = useProgress();

    const targetedPoiId = usePoiTargeting(isExploring, isLocked, isTransitioning, isInit)

    usePlayerMovement(isExploring);
    usePreventClickPropagation(overlayRef);

    const handlePoiClick = useCallback((poi: PoiData) => {
        if (isTransitioning || !isExploring) return;

        const currentPos = camera.position.toArray();
        const lookAtDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
        lastRoomCameraState.current = {position: currentPos, target: lookAtDir.toArray()};
        setTransitionStartState(lastRoomCameraState.current);

        const targetVec = new THREE.Vector3(...poi.cameraTarget);
        const offsetVec = new THREE.Vector3(...poi.cameraPositionOffset);
        const detailCamPos = targetVec.clone().add(offsetVec);
        const detailTargetState: CameraState = {
            position: detailCamPos.toArray(),
            target: poi.cameraTarget,
        };
        setTransitionTargetState(detailTargetState);

        setIsExploring(false);
        setActivePoi(poi);
        setIsTransitioning(true);

        if (pointerLockControlsRef.current?.isLocked) {
            pointerLockControlsRef.current.unlock();
        }

    }, [camera, isTransitioning, isExploring]);

    const handleBackClick = useCallback(() => {
        if (isTransitioning || !activePoi) return;

        if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = false;
        }

        if (pointerLockControlsRef.current) {
            pointerLockControlsRef.current.lock();
        }

        const detailCamPos = camera.position.toArray();
        const detailTarget = orbitControlsRef.current?.target.toArray() as THREE.Vector3Tuple ?? activePoi.cameraTarget;
        setTransitionStartState({position: detailCamPos, target: detailTarget});

        const toTarget = lastRoomCameraState.current;
        toTarget.target[1] = PLAYER_HEIGHT;

        setTransitionTargetState(toTarget);

        setIsTransitioning(true);
        setActivePoi(null);

    }, [camera, isTransitioning, activePoi]);

    const handleTransitionComplete = useCallback(() => {
        setIsTransitioning(false);
        const isNowExploring = !activePoi;

        if (isNowExploring) {
            setIsExploring(true);
        } else {
            setIsExploring(false);
            if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = true;
                orbitControlsRef.current.target.set(...(transitionTargetState?.target || [0, 0, 0]));
                orbitControlsRef.current.update();
            }
        }
    }, [activePoi, transitionTargetState]);


    useEffect(() => {
        const controlsInstance = pointerLockControlsRef.current;
        if (!controlsInstance) {
            return;
        }

        const handleLock = (): void => {
            setIsLocked(true);
        };
        const handleUnlock = (): void => {
            setIsLocked(false);
        };

        controlsInstance.addEventListener('lock', handleLock);
        controlsInstance.addEventListener('unlock', handleUnlock);

        return () => {
            controlsInstance.removeEventListener('lock', handleLock);
            controlsInstance.removeEventListener('unlock', handleUnlock);
        };
    }, []);

    const requestPointerLock = useCallback(() => {
        setInit(true)

        if (isExploring && !isLocked && !isTransitioning && pointerLockControlsRef.current) {
            pointerLockControlsRef.current.lock()
        }
    }, [isExploring, isLocked, isTransitioning, pointerLockControlsRef]);


    useEffect(() => {
        const handleRaycastClick = (event: MouseEvent): void => {
            console.log("handling click")

            if (!isExploring || !isLocked || isTransitioning || event.button !== 0 || !targetedPoiId) {
                return;
            }

            const poiToClick = POINTS_OF_INTEREST.find(p => p.id === targetedPoiId);
            if (poiToClick) {
                handlePoiClick(poiToClick);
            }
        };

        if (isLocked && isExploring) {
            gl.domElement.addEventListener('click', handleRaycastClick);
        }

        return (): void => {
            gl.domElement.removeEventListener('click', handleRaycastClick);
        };
    }, [isLocked, isExploring, isTransitioning, camera, scene, gl.domElement, handlePoiClick, targetedPoiId]);


    return (
        <>
            <SceneLighting/>
            <Stats/>

            <RoomView isVisible={true}
                      targetedPoiId={targetedPoiId} onPoiClick={handlePoiClick}/>

            <DetailView
                isVisible={!isExploring || (isTransitioning && activePoi !== null)}
                activePoi={activePoi}
                isTransitioning={isTransitioning}
                onBackClick={handleBackClick}
                />

            {isExploring && !activePoi && (
                <PointerLockControls
                    ref={pointerLockControlsRef}
                    camera={camera}
                    makeDefault
                />
            )}

            {!isExploring && activePoi && (
                <OrbitControls
                    ref={orbitControlsRef}
                    camera={camera}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    target={activePoi.cameraTarget}
                    enabled={true}
                />
            )}

            <TransitionAnimator
                startState={transitionStartState}
                targetState={transitionTargetState}
                enabled={isTransitioning}
                onTransitionComplete={handleTransitionComplete}
            />


            {assetsLoading && <Loader message="Loading Assets..."/>}

            {!isInit && (
                <Html fullscreen style={{zIndex: 1}}>
                    <div
                        id="request-lock-overlay"
                        onClick={requestPointerLock}
                        style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'white',
                            fontSize: '20px', cursor: 'pointer', userSelect: 'none',
                            textAlign: 'center', padding: '20px'
                        }}
                    >
                        Click to look around (WASD to move)<br/>Click on objects or labels to view details
                    </div>
                </Html>
            )}
        </>
    );
};

export default Experience;