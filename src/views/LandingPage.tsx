import React from 'react';
import { motion } from 'motion/react';
import { Bot, Shield, Globe, Cpu, ChevronRight, Upload, Layers } from 'lucide-react';
import LiveOutbreakGraph from "../components/LiveOutbreakGraph";

export default function LandingPage({ onStartChat }: { onStartChat: () => void }) {
  return (
  <div className="relative min-h-screen bg-bg-dark flex flex-col overflow-x-hidden">

    {/* Background Effects */}
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-accent-cyan/5 blur-[100px] sm:blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-accent-purple/5 blur-[100px] sm:blur-[120px] rounded-full" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>

    {/* NAV */}
    <nav className="relative z-10 glass-nav h-14 sm:h-16 px-4 sm:px-8 flex items-center justify-between w-full">

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-lg flex items-center justify-center shadow-lg shadow-accent-cyan/20">
          <Cpu size={16} className="sm:size-[18px] text-white" />
        </div>

        <span className="text-sm sm:text-base font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-white uppercase">
          Federated Intel
        </span>
      </div>

      {/* Desktop nav only */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[10px] lg:text-[11px] font-bold uppercase tracking-widest">

        <a
          href="#architecture"
          className="text-white/60 hover:text-accent-cyan transition-colors"
        >
          Architecture
        </a>

        <div className="px-3 lg:px-4 py-2 rounded-full border border-border-cyan bg-accent-cyan/10 text-accent-cyan">
          System Active: 12 Nodes
        </div>

        <button
          onClick={onStartChat}
          className="px-4 lg:px-6 py-2 bg-accent-cyan text-bg-dark rounded-md hover:scale-105 transition-all font-bold"
        >
          Launch Assistant
        </button>
      </div>

      {/* Mobile CTA */}
      <button
        onClick={onStartChat}
        className="md:hidden px-3 py-1.5 text-xs bg-accent-cyan text-bg-dark rounded-md font-bold"
      >
        Start
      </button>
    </nav>

    {/* MAIN */}
    <main className="relative z-10 pt-12 sm:pt-20 pb-20 sm:pb-32 flex-1">

      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* HERO */}
        <div className="max-w-3xl mb-16 sm:mb-32">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-border-cyan text-accent-cyan text-[9px] sm:text-[10px] font-bold font-mono mb-5 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              RAG-Enabled Thesis Active
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-light tracking-tight leading-[1.05] sm:leading-[0.95] mb-6 sm:mb-8 text-white">
              Federated Intelligence <br />
              <span className="text-accent-cyan">
                for Health Outbreak
              </span>{" "}
              Detection
            </h1>

            <p className="text-sm sm:text-lg text-white/40 mb-8 sm:mb-10 leading-relaxed max-w-2xl font-light">
              Decentralized health intelligence using privacy-preserving multi-source data fusion.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">

              <button
                onClick={onStartChat}
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-tr from-accent-cyan to-accent-purple text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all"
              >
                Start Research Chat
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="px-5 sm:px-8 py-3 sm:py-4 bg-white/5 border border-border-white rounded-xl flex items-center justify-center gap-2">
                <Shield size={16} className="text-accent-cyan" />
                <span className="text-xs sm:text-sm text-white/60">
                  Differential Privacy v1.0
                </span>
              </div>

            </div>

          </motion.div>
        </div>

        {/* LIVE OUTBREAK MONITOR */}
        <div className="mb-32">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs uppercase tracking-[0.3em] text-green-400 font-mono">
              Live Federated Signal Stream
            </span>
          </div>

          <LiveOutbreakGraph />
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-20 sm:mb-32">

          {[
            {
              icon: <Globe size={22} className="text-accent-cyan" />,
              title: "Social Media Node",
              desc: "Reddit-based signals processed using a DistilBERT classifier to detect outbreak-related discussion patterns.",
            },
            {
              icon: <Layers size={22} className="text-accent-purple" />,
              title: "Search Engine Node",
              desc: "Google COVID-19 search trends used to capture symptom-driven population-level interest signals.",
            },
            {
              icon: <Shield size={22} className="text-white" />,
              title: "Hospital Node",
              desc: "CDC emergency department data providing clinical validation and ground-truth outbreak indicators.",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-black/20 border border-border-white p-6 sm:p-8 rounded-2xl"
            >
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/5 rounded-lg flex items-center justify-center mb-5 sm:mb-6 border border-border-white">
                {card.icon}
              </div>

              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                {card.title}
              </h3>

              <p className="text-white/40 text-xs sm:text-sm">
                {card.desc}
              </p>
            </motion.div>
          ))}

        </div>

        {/* ARCHITECTURE */}
<div id="architecture" className="mb-20 sm:mb-32">

  <h2 className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-12 flex items-center gap-4">
    <span className="w-8 sm:w-12 h-1 bg-accent-cyan" />
    Architecture Overview
  </h2>

  <div className="glass-card p-6 sm:p-12 flex flex-col md:flex-row gap-10 items-center">

    {/* LEFT */}
    <div className="flex-1">
      <h3 className="text-xl sm:text-2xl font-bold mb-3">
        Three-Node Surveillance Pipeline
      </h3>

      <p className="text-white/60 mb-6 sm:mb-8 text-sm">
        Multi-source signals are processed locally, then fused securely at the global server.
      </p>

      <ul className="space-y-3 sm:space-y-4">
        {[
          "Social Media Node (Reddit + DistilBERT classification)",
          "Search Engine Node (Google COVID-19 search trends)",
          "Hospital Node (CDC emergency department data)",
        ].map((step, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full border border-accent-cyan flex items-center justify-center text-[10px] text-accent-cyan">
              {i + 1}
            </div>
            {step}
          </li>
        ))}
      </ul>
    </div>

    {/* RIGHT VISUAL */}
    <div className="flex-1 w-full max-w-sm aspect-square relative flex items-center justify-center">

      <div className="absolute inset-0 border border-dashed border-accent-cyan/20 rounded-full animate-spin-slow" />

      <div className="w-20 sm:w-24 h-20 sm:h-24 bg-white/10 rounded-full flex items-center justify-center z-10">
        <Cpu size={32} className="sm:size-[40px] text-accent-cyan" />
      </div>

      {[
        { angle: 0, label: "Social" },
        { angle: 120, label: "Search" },
        { angle: 240, label: "Hospital" },
      ].map((node, i) => (
        <div
          key={i}
          className="absolute w-10 sm:w-12 h-10 sm:h-12 bg-white/5 rounded-lg border border-white/20 flex items-center justify-center text-[10px] text-white/60"
          style={{
            transform: `rotate(${node.angle}deg) translate(120px) rotate(-${node.angle}deg)`,
          }}
        >
          {node.label}
        </div>
      ))}

    </div>

  </div>
</div>

{/* EARLY WARNING TIMELINE */}
<div className="mb-20 sm:mb-32">

  <h2 className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-12 flex items-center gap-4">
    <span className="w-8 sm:w-12 h-1 bg-accent-purple" />
    Early Detection Timeline
  </h2>

  <div className="glass-card p-6 sm:p-12">

    <div className="relative border-l border-accent-cyan/30 pl-6 space-y-10">

      {[
        {
          time: "T - 79 days",
          title: "Early Signal Emergence",
          desc: "Search and social anomalies begin diverging from baseline behavior."
        },
        {
          time: "T - 24 days",
          title: "High-Confidence Alert",
          desc: "Fusion model confirms consistent multi-node outbreak pressure."
        },
        {
          time: "T0",
          title: "Outbreak Confirmation",
          desc: "Ground truth onset aligns with hospital data spike."
        },
      ].map((event, i) => (
        <div key={i} className="relative">

          <div className="absolute -left-[34px] top-1 w-3 h-3 rounded-full bg-accent-cyan shadow-lg shadow-accent-cyan/40" />

          <div>
            <p className="text-accent-cyan text-xs font-bold">{event.time}</p>
            <h3 className="text-white font-bold">{event.title}</h3>
            <p className="text-white/60 text-sm mt-1">{event.desc}</p>
          </div>

        </div>
      ))}

    </div>
  </div>
</div>

{/* DATA FLOW PIPELINE */}
<div className="mb-20 sm:mb-32">

  <h2 className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-12 flex items-center gap-4">
    <span className="w-8 sm:w-12 h-1 bg-accent-cyan" />
    Signal Processing Pipeline
  </h2>

  <div className="glass-card p-6 sm:p-12">

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

      {[
        {
          title: "Raw Signals",
          desc: "Unstructured social, search, and clinical data streams",
          color: "from-cyan-500/20"
        },
        {
          title: "Feature Extraction",
          desc: "Text classification + trend normalization + noise filtering",
          color: "from-purple-500/20"
        },
        {
          title: "Fusion Layer",
          desc: "Weighted aggregation using gated risk scoring model",
          color: "from-white/10"
        },
      ].map((step, i) => (
        <div
          key={i}
          className={`p-6 rounded-xl border border-white/10 bg-gradient-to-b ${step.color} to-transparent`}
        >
          <div className="text-xs text-accent-cyan font-bold mb-2">
            Stage {i + 1}
          </div>
          <h3 className="font-bold mb-2">{step.title}</h3>
          <p className="text-white/60 text-sm">{step.desc}</p>
        </div>
      ))}

    </div>

  </div>
</div>

{/* PRIVACY LAYER */}
<div className="mb-20 sm:mb-32">

  <h2 className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-12 flex items-center gap-4">
    <span className="w-8 sm:w-12 h-1 bg-white" />
    Privacy Preservation Mechanism
  </h2>

  <div className="glass-card p-6 sm:p-12 flex flex-col md:flex-row gap-10 items-center">

    <div className="flex-1">
      <h3 className="text-xl font-bold mb-4">Secure Federated Training</h3>

      <ul className="space-y-4 text-sm text-white/70">

        {[
          "Local models trained on-device without raw data sharing",
          "Differential privacy adds calibrated noise to gradients",
          "Secure aggregation prevents reconstruction attacks",
          "Only encrypted updates reach the global server"
        ].map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-accent-purple">▹</span>
            {item}
          </li>
        ))}

      </ul>
    </div>

    <div className="flex-1 relative flex items-center justify-center">

      <div className="w-40 h-40 rounded-full border border-dashed border-accent-purple/40 animate-spin-slow" />
      <div className="absolute w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
        <Shield className="text-accent-purple" size={32} />
      </div>

    </div>

  </div>
</div>

{/* PERFORMANCE DASHBOARD */}
<div className="mb-20 sm:mb-32">

  <h2 className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-12 flex items-center gap-4">
    <span className="w-8 sm:w-12 h-1 bg-accent-cyan" />
    System Performance Metrics
  </h2>

  <div className="glass-card p-6 sm:p-12 grid grid-cols-1 sm:grid-cols-3 gap-6">

    {[
      {
        label: "Detection Lead Time",
        value: "79 days",
        desc: "Early warning before benchmark onset"
      },
      {
        label: "Confirmed Alert Lead",
        value: "24 days",
        desc: "High-confidence outbreak detection"
      },
      {
        label: "Fusion Accuracy",
        value: "94%+",
        desc: "Cross-node weighted decision performance"
      }
    ].map((m, i) => (
      <div key={i} className="p-6 rounded-xl border border-white/10 bg-white/5">

        <p className="text-accent-cyan text-xs font-bold">{m.label}</p>
        <h3 className="text-3xl font-bold mt-2">{m.value}</h3>
        <p className="text-white/50 text-sm mt-2">{m.desc}</p>

      </div>
    ))}

  </div>
</div>

      </div>
    </main>

    {/* FOOTER */}
    <footer className="relative z-10 border-t border-white/5 py-10 sm:py-12">

      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row gap-8 md:gap-0 justify-between items-center">

        <div className="flex items-center gap-2 opacity-50">
          <Cpu size={18} />
          <span className="text-xs sm:text-sm font-bold">
            FEDERATED ANALYTICS
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">

          <div className="p-2 bg-white rounded-lg">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                window.location.href
              )}`}
              className="w-16 sm:w-20 h-16 sm:h-20"
              alt="QR"
            />
          </div>

          <span className="text-[9px] sm:text-[10px] text-white/30 uppercase">
            Scan to Access
          </span>

        </div>

        <div className="text-white/30 text-[10px] sm:text-xs font-mono text-center">
          © 2026 RESEARCH PROJECT
        </div>

        <div className="flex gap-4 sm:gap-6">
          <button
            onClick={onStartChat}
            className="text-xs sm:text-sm text-accent-cyan hover:underline"
          >
            Chat
          </button>
          <button className="text-xs sm:text-sm text-white/50">
            Docs
          </button>
        </div>

      </div>
    </footer>
  </div>
);
}
