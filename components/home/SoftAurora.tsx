import ReactBitsSoftAurora from "@/components/SoftAurora";

export function SoftAurora() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <ReactBitsSoftAurora
        speed={0.55}
        scale={1.4}
        brightness={0.95}
        color1="#ffffff"
        color2="#f97316"
        noiseFrequency={2.2}
        noiseAmplitude={0.9}
        bandHeight={0.2}
        bandSpread={1.1}
        octaveDecay={0.18}
        layerOffset={0.18}
        colorSpeed={0.8}
        mouseInfluence={0.12}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  );
}
