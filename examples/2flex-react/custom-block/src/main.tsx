/**
 * A block of your own as a component.
 *
 * A block of your own becomes a component with one call, the props of the
 * component are the options of the block. The options of the block are
 * typed, so a prop that does not exist is a type error.
 */
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
    Canvas,
    Layout,
    Rectangle,
    Text,
    makeBlockComponent,
} from '@2flexible/2flex-react'
import { Block, type BlockOptions } from '@2flexible/2flex'

/**
 * The options of the badge.
 */
interface BadgeBlockOptions extends BlockOptions {
    /**
     * The text of the badge.
     */
    label?: string
    /**
     * The colour of the badge.
     */
    badgeColor?: string
}

/**
 * A badge of your own, it draws itself.
 */
class BadgeBlock extends Block<BadgeBlockOptions> {
    label(value?: string) {
        return super.__valueHandler(value, 'label', '')
    }
    badgeColor(value?: string) {
        return super.__valueHandler(value, 'badgeColor', '#f59e0b')
    }
    render() {
        super.render()

        const context = this.context
        if (!context) return

        context.fillStyle = this.badgeColor()
        context.beginPath()
        context.roundRect(
            this.x(),
            this.y(),
            this.width(),
            this.height(),
            this.height() / 2
        )
        context.fill()
    }
}

// the badge is used like every other shape of the library
const Badge = makeBlockComponent(BadgeBlock)

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
                <Badge
                    label="A badge"
                    badgeColor="#f59e0b"
                    width={200}
                    height={120}
                >
                    <Layout
                        padding={20}
                        layout="flex"
                        flexDirection="column"
                        gap={8}
                    >
                        <Text text="A badge of your own" color="#0b0f19" />
                    </Layout>
                </Badge>
                <Rectangle
                    width={200}
                    height={120}
                    backgroundColor="#1e293b"
                    borderRadius={12}
                    borderWidth={2}
                    borderColor="#38bdf8"
                    onClick={() => setCount((value) => value + 1)}
                >
                    <Layout
                        padding={20}
                        layout="flex"
                        flexDirection="column"
                        gap={8}
                    >
                        <Text text={`Clicked ${count} times`} color="white" />
                    </Layout>
                </Rectangle>
            </Layout>
        </Canvas>
    )
}

const container = document.getElementById('root')
if (container) createRoot(container).render(<Scene />)
