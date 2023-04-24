import { Canvas } from '@react-three/fiber'
import Particles from './Particles'

function App() {

    return (
        <Canvas camera={{fov: 60, near: 1, far: 10000}}>
            <Particles />
        </Canvas>
    )
}

export default App
