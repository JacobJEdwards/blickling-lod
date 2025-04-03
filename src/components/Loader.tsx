import {FC, ReactElement} from "react";
import {Html, useProgress} from "@react-three/drei";

export interface LoaderProps {
    message?: string;
}

export const Loader: FC<LoaderProps> = ({ message = "Loading..." }: LoaderProps): ReactElement => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div style={{ color: 'white', fontSize: '16px', background: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: '5px', textAlign: 'center' }}>
                {message}<br/>{Math.round(progress)}%
            </div>
        </Html>
    );
}

export default Loader;