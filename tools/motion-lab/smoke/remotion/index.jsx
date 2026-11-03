import React from 'react';
import { registerRoot, Composition, AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

const Hello = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#0b1b33', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: '#f4f1ea', fontSize: 120, fontFamily: 'sans-serif', opacity: o }}>smoke test</div>
    </AbsoluteFill>
  );
};

registerRoot(() => (
  <Composition id="Smoke" component={Hello} durationInFrames={30} fps={30} width={1080} height={1920} />
));
