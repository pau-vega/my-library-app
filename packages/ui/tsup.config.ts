import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "components/index": "src/components/index.ts",
    "hooks/index": "src/hooks/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    // Peer dependencies - must be external
    "react",
    "react-dom",
    // Keep all other dependencies external for optimal tree-shaking
    // These will be auto-installed from package.json dependencies
    "react-hook-form",
    "zod",
    "next-themes",
    "@radix-ui/*",
    "lucide-react",
    "recharts",
    "sonner",
    "vaul",
    "cmdk",
    "embla-carousel-react",
    "input-otp",
    "react-resizable-panels",
    "react-day-picker",
    "date-fns",
    "@hookform/resolvers",
  ],
  treeshake: true,
  splitting: false,
  minify: false,
  bundle: true,
})
