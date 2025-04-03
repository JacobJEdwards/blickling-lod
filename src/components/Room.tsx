import {ROOM_DEPTH, ROOM_HEIGHT, ROOM_WIDTH} from "../constants.ts";
import * as THREE from "three";
import {FC, ReactElement} from "react";

export const Room: FC = (): ReactElement => {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow={true}>
                <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
                <meshStandardMaterial color="#aaa" side={THREE.DoubleSide}/>
            </mesh>
            <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow={true}>
                <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
                <meshStandardMaterial color="#ccc" side={THREE.DoubleSide}/>
            </mesh>
            <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow={true}>
                <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
                <meshStandardMaterial color="#ccc" side={THREE.DoubleSide}/>
            </mesh>
            <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]} rotation={[0, 0, 0]} receiveShadow={true}>
                <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
                <meshStandardMaterial color="#ccc" side={THREE.DoubleSide}/>
            </mesh>
            <mesh position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} rotation={[0, Math.PI, 0]} receiveShadow={true}>
                <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
                <meshStandardMaterial color="#ccc" side={THREE.DoubleSide}/>
            </mesh>
        </group>
    );
};

export default Room;