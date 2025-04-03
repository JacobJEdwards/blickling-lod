import {FC, ReactElement, Suspense} from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
    INITIAL_ROOM_VIEW_STATE,
    INITIAL_CAMERA
} from "./constants.ts";
import Loader from "./components/Loader.tsx";
import Experience from "./components/Experience.tsx";


const App: FC = (): ReactElement => {
    return (
        <div style={{ height: '100vh', width: '100vw', background: '#333' }}>
            <Canvas
                style={{ display: 'block' }}
                camera={INITIAL_CAMERA}
                shadows
                onCreated={({ camera }) => {
                    camera.lookAt(new THREE.Vector3(...INITIAL_ROOM_VIEW_STATE.target));
                    camera.updateProjectionMatrix();
                }}
            >
                <Suspense fallback={<Loader />}>
                    <Experience />
                </Suspense>
            </Canvas>
        </div>
    );
}

export default App;