/**
 * The shapes as components.
 *
 * Every shape of the library is a component, the props of a component are
 * the options of the block it holds. The name of an option can be written in
 * camel case or in kebab case, both spellings are the same prop.
 */
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, Circle, Layout, Rectangle, Text } from '@2flexible/2flex-react'

function Scene() {
    const [count, setCount] = useState(0)

    return (
        <Canvas width={600} height={400}>
            <Layout
                x={40}
                y={40}
                width={520}
                height={160}
                flexDirection="row"
                flexWrap="wrap"
                gap={16}
            >
                <Rectangle
                    width={160}
                    height={120}
                    backgroundColor="#3b82f6"
                    borderRadius={12}
                />
                <Circle width={120} height={120} backgroundColor="#22c55e" />
                <Rectangle
                    width={200}
                    height={120}
                    backgroundColor="#1e293b"
                    borderRadius={12}
                    borderWidth={2}
                    borderColor="#38bdf8"
                >
                    <Layout
                        padding={20}
                        layout="flex"
                        flexDirection="column"
                        gap={8}
                    >
                        <Text
                            text="Nested inside a rectangle"
                            color="white"
                            fontSize={18}
                        />
                    </Layout>
                </Rectangle>
            </Layout>

            <Rectangle
                x={40}
                y={240}
                width={220}
                height={90}
                backgroundColor="#f59e0b"
                borderRadius={12}
            >
                <Layout
                    padding={25}
                    layout="flex"
                    flexDirection="row"
                    alignItems="center"
                >
                    <Text
                        text={`Clicked ${count} times`}
                        color="#0b0f19"
                        fontSize={16}
                    />
                </Layout>
            </Rectangle>

            <Rectangle
                x={300}
                y={240}
                width={180}
                height={90}
                backgroundColor="#ef4444"
                borderRadius={12}
                onClick={() => setCount((value) => value + 1)}
            />
        </Canvas>
    )
}

const container = document.getElementById('root')
if (container) createRoot(container).render(<Scene />)
