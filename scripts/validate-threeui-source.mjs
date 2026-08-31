import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const registeredFiles = new Map([
  ['../src/shaders/sylva-living-world/SylvaLivingWorldScene.tsx', 'e29b92a16596bc9383e1dbd4630e83b70ec2a59dbae48de1d3b7ddc48c0b2082'],
  ['../src/shaders/sylva-living-world/sources/inner-green-3d.html', '69c3694bd63f44ef9f007ebe4dac57a83e4402e0cdf6b54dd10b96dd4f05e197'],
  ['../src/shaders/sylva-living-world/sources/inner-green-assets/three.min.js', '8a5f7249903b54d30f79f708699d2fed2d6a1d0741a4cd41377d1f01bb5a2271'],
  ['../src/shaders/threeui.css', 'efe4447139f1358dd8e9be68edf6fa46cbefbd1de423a4d6c439ca61d2c8eccf'],
])

for (const [relativePath, expected] of registeredFiles) {
  const source = await readFile(new URL(relativePath, import.meta.url))
  const actual = createHash('sha256').update(source).digest('hex')
  if (actual !== expected) {
    throw new Error(`ThreeUI registered source mismatch for ${relativePath}: expected ${expected}, received ${actual}`)
  }
}
