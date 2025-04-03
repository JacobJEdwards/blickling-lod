import {FC, Fragment, ReactElement, Suspense, useCallback, useEffect, useRef, useState} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import {CameraState, PoiData} from "../types.ts";
import {OrbitControls as OrbitControlsImpl, PointerLockControls as PointerLockControlsImpl} from "three-stdlib";
import {INITIAL_ROOM_VIEW_STATE, POINTS_OF_INTEREST, ROOM_DEPTH, ROOM_HEIGHT, ROOM_WIDTH} from "../constants.ts";
import {Html, OrbitControls, PointerLockControls, Splat, Stats, useProgress} from "@react-three/drei";
import {usePlayerMovement} from "../hooks/hooks.tsx";
import * as THREE from "three";
import Loader from "./Loader.tsx";
import Room from "./Room.tsx";
import PointOfInterest from "./PointOfInterest.tsx";
import ObjDetailViewer from "./ObjDetailViewer.tsx";
import BackButton from "./BackButton.tsx";
import TransitionAnimator from "./TransititionAnimator.tsx";

export const Experience: FC = () => {
    const {camera, scene, gl} = useThree();
    const [activePoi, setActivePoi] = useState<PoiData | null>(null);
    const [isExploring, setIsExploring] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [targetedPoiId, setTargetedPoiId] = useState<string | null>(null);

    const pointerLockControlsRef = useRef<PointerLockControlsImpl>(null);
    const orbitControlsRef = useRef<OrbitControlsImpl>(null);

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionStartState, setTransitionStartState] = useState<CameraState | null>(null);
    const [transitionTargetState, setTransitionTargetState] = useState<CameraState | null>(null);

    const lastRoomCameraState = useRef<CameraState>(INITIAL_ROOM_VIEW_STATE);
    const {active: assetsLoading} = useProgress();

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
    }, [isExploring, isTransitioning, scene]);

    useFrame(() => {
        if (isExploring && isLocked && !isTransitioning && poiHitboxesRef.current.length > 0) {
            targetingRaycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera); // Center screen
            const intersects = targetingRaycaster.current.intersectObjects(poiHitboxesRef.current);

            if (intersects.length > 0) {
                const firstHit = intersects[0];
                const hitPoi = firstHit.object.userData.poi as PoiData;
                if (hitPoi && hitPoi.id !== targetedPoiId) {
                    setTargetedPoiId(hitPoi.id);
                } else if (!hitPoi && targetedPoiId !== null) {
                    setTargetedPoiId(null);
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

    usePlayerMovement(true);

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

        const detailCamPos = camera.position.toArray();
        const detailTarget = orbitControlsRef.current?.target.toArray() as THREE.Vector3Tuple ?? activePoi.cameraTarget;
        setTransitionStartState({position: detailCamPos, target: detailTarget});
        setTransitionTargetState(lastRoomCameraState.current);

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

        const handleLock = () => {
            setIsLocked(true);
        };
        const handleUnlock = () => {
            // setIsLocked(false);
        };

        controlsInstance.addEventListener('lock', handleLock);
        controlsInstance.addEventListener('unlock', handleUnlock);

        return () => {
            controlsInstance.removeEventListener('lock', handleLock);
            controlsInstance.removeEventListener('unlock', handleUnlock);
        };
    }, [pointerLockControlsRef]);


    useEffect(() => {
        const handleRaycastClick = (event: MouseEvent): void => {
            console.log("handling click")

            if (!isExploring || !isLocked || isTransitioning || event.button !== 0) return;

            const targetElement = event.target as Element;

            if (!gl.domElement.contains(targetElement) && !targetElement.id?.includes('request-lock')) {
                return;
            }

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

            const hitboxes: THREE.Object3D[] = [];

            scene.traverse((object) => {
                if (object.userData.isPoiHitbox) {
                    hitboxes.push(object);
                }
            });

            const intersects = raycaster.intersectObjects(hitboxes);

            if (intersects.length > 0) {
                const firstHit = intersects[0];
                const hitPoi = firstHit.object.userData.poi as PoiData;
                if (hitPoi) {
                    handlePoiClick(hitPoi);
                }
            }
        };

        if (isLocked && isExploring) {
            gl.domElement.addEventListener('click', handleRaycastClick);
        }

        return () => {
            gl.domElement.removeEventListener('click', handleRaycastClick);
        };
    }, [isLocked, isExploring, isTransitioning, camera, scene, gl.domElement, handlePoiClick]);


    const requestPointerLock = useCallback(() => {
        if (isExploring && !isLocked && !isTransitioning && pointerLockControlsRef.current) {
            pointerLockControlsRef.current.lock()
        }
    }, [isExploring, isLocked, isTransitioning, pointerLockControlsRef]);


    return (
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

            <Suspense fallback={<Loader message="Loading Room..."/>}>
                <group visible={isExploring || (isTransitioning && !activePoi)}>
                    <Room/>
                    <group position={[3, ROOM_HEIGHT - 1.5, 0]}>
                        <Splat
                            src="/splat.splat"
                            rotation={[0, 15, 0]}
                            toneMapped={false}
                            scale={15}
                            castShadow={false}
                            alphaTest={0.1}
                        />
                    </group>
                </group>
            </Suspense>

            {isExploring && !isTransitioning && POINTS_OF_INTEREST.map((poi: PoiData): ReactElement => (
                <Fragment key={poi.id}>
                    <PointOfInterest
                        onClick={() => handlePoiClick(poi)}
                        isTargeted={poi.id === targetedPoiId}
                        {...poi}
                    />
                </Fragment>
            ))}


            <group visible={!!activePoi || (isTransitioning && activePoi !== null)}>
                {activePoi && (
                    <Suspense fallback={<Loader message={`Loading ${activePoi.name}...`}/>}>
                        <ObjDetailViewer
                            key={activePoi.id}
                            objUrl={activePoi.objUrl}
                            mtlUrl={activePoi.mtlUrl}
                            position={[0, 0, 0]}
                            scale={activePoi.scale}
                            rotation={activePoi.rotation}
                        />
                        {!isTransitioning && <BackButton onClick={handleBackClick}/>}
                    </Suspense>
                )}
            </group>

            {isExploring && !isTransitioning && !activePoi && (
                <PointerLockControls
                    ref={pointerLockControlsRef}
                    makeDefault
                />
            )}

            {!isExploring && !isTransitioning && activePoi && (
                <OrbitControls
                    ref={orbitControlsRef}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    target={activePoi.cameraTarget}
                    enabled={!isTransitioning && !isExploring && !!activePoi}
                />
            )}

            <TransitionAnimator
                startState={transitionStartState}
                targetState={transitionTargetState}
                enabled={isTransitioning}
                onTransitionComplete={handleTransitionComplete}
            />

            <Stats/>

            {assetsLoading && <Loader message="Loading Assets..."/>}

            {isExploring && !isLocked && !isTransitioning && !activePoi && (
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