export const XIAOHEI_SYLVA_PERFORMANCE_MARKER = 'data-xiaohei-performance-profile'

/**
 * Apply a conservative runtime profile to the registered ThreeUI source.
 *
 * The registered source remains byte-for-byte untouched on disk. The profile
 * only changes the iframe source snapshot before its first navigation, keeping
 * upstream source verification useful while avoiding the scene's most costly
 * defaults on long-running DSH sessions.
 */
export function injectXiaoheiSylvaPerformanceProfile(source: string): string {
  if (source.includes(`${XIAOHEI_SYLVA_PERFORMANCE_MARKER}="balanced-v1"`)) return source

  const replacements: ReadonlyArray<readonly [string, string]> = [
    [
      'var BLADES_NEAR = small ? 70000 : 190000;',
      'var BLADES_NEAR = small ? 48000 : 105000;',
    ],
    [
      'var BLADES_FAR  = small ? 20000 :  60000;',
      'var BLADES_FAR  = small ? 12000 :  28000;',
    ],
    [
      'renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2));',
      'renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.4));',
    ],
    [
      'if (!small) bf = buildButterfly(nearGroup, nearLimbs, nearGroup.userData.uni);',
      'bf = null; /* butterfly disabled by the Xiaohei long-session profile */',
    ],
    [
      'if (renderer && clock) renderFrame();',
      `if (renderer && clock) {
      var xiaoheiWorldElapsed = now - xiaoheiWorldLastFrame;
      if (xiaoheiWorldElapsed >= xiaoheiWorldFrameInterval) {
        xiaoheiWorldLastFrame = now - (xiaoheiWorldElapsed % xiaoheiWorldFrameInterval);
        renderFrame();
      }
    }`,
    ],
  ]

  let profiled = source
  for (const [authored, optimized] of replacements) {
    if (!profiled.includes(authored)) return source
    profiled = profiled.replace(authored, optimized)
  }

  const runtimeEnd = profiled.lastIndexOf('\n})();\n</script>')
  if (runtimeEnd < 0) return source
  const marker = `
  /* ${XIAOHEI_SYLVA_PERFORMANCE_MARKER}="balanced-v1" */
  var xiaoheiWorldLastFrame = 0;
  var xiaoheiWorldFrameInterval = 1000 / (
    NARROW.matches || (window.innerWidth * window.innerHeight) < 620000 ? 30 : 45
  );`
  return `${profiled.slice(0, runtimeEnd)}${marker}${profiled.slice(runtimeEnd)}`
}
