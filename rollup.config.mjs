import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
    input: `./src/index.ts`,
    output: [
        {
            file: "./output/2flex.js",
            name: "2flex",
            // dir: "output",
            format: "esm",
        },
    ],
    // external: ["fs"],
    // watch: {
    //     include: "src/**",
    // },
    plugins: [nodeResolve(), typescript()],
};
