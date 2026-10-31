#!/usr/bin/env python3
"""
FestivaPulseAI - Professional Hackathon Demo Audio Generator.
Uses Gemini Live Native Audio with female voice ("Kore") on Vertex AI,
with seamless high-fidelity neural female TTS fallback (edge-tts en-IN-NeerjaNeural).
Outputs calibrated WAV files and exact scene duration timings.
"""

import asyncio
import json
import os
import sys
import wave
from pathlib import Path

from google import genai
from google.genai import types

# Set stdout encoding for Windows
if sys.platform == "win32":
    import io

    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "docs" / "demo" / "demo_audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
SCRATCH_DIR = ROOT / "scratch"
SCRATCH_DIR.mkdir(parents=True, exist_ok=True)

FFMPEG_BIN = r"C:\ProgramData\chocolatey\bin\ffmpeg.exe"
if not os.path.exists(FFMPEG_BIN):
    FFMPEG_BIN = "ffmpeg"

SCENES = [
    {
        "id": "scene_01_intro",
        "title": "Welcome, Themes & Multilingual Localization",
        "text": (
            "Welcome to FestivaPulseAI, an autonomous agentic celebration operating system engineered for the "
            "Google Cloud APAC AI Builder Cup 2026. Experience our responsive interface with Midnight Velvet dark mode "
            "and Ivory Silk light mode, coupled with instant localization across Tamil, Hindi, Telugu, Kannada, "
            "Malayalam, and English. In high-stakes Indian celebrations, FestivaPulseAI replaces operational chaos "
            "with mathematical certainty, cultural grandeur, and zero food waste."
        ),
    },
    {
        "id": "scene_02_blueprint",
        "title": "Celebration Blueprint & 1-Click Cultural Presets",
        "text": (
            "Here is the Master Celebration Blueprint Atelier. Coordinators choose from one-click cultural presets, "
            "including Kalyana Mandapam Weddings, Community Melas, and Royal Birthdays. Notice our strict client-side "
            "validation: testing an invalid state immediately triggers a prominent safety banner preventing fire overcrowding. "
            "Selecting the Royal Wedding preset and generating the plan instantly creates an end-to-end itinerary, "
            "a deterministic portion planner, and a Pareto-balanced budget ledger."
        ),
    },
    {
        "id": "scene_03_adk_swarm",
        "title": "Google Cloud ADK Multi-Agent Swarm Deliberation",
        "text": (
            "Under the hood, our dedicated Google Cloud Agent Development Kit swarm orchestrates the entire celebration. "
            "Watch six specialist agents deliberate in parallel: the Event Supervisor, Cultural Synthesizer, FoodGuard, "
            "Timeline Cascade, Spatial Crowd, and Budget Elasticity agents. Each agent reports live reasoning traces, "
            "tool calls, and sub-second execution latencies, backing every decision with pure mathematical models "
            "and zero arithmetic hallucinations."
        ),
    },
    {
        "id": "scene_04_imagination_atelier",
        "title": "AI Event Imagination Studio & Vertex AI Image Synthesis",
        "text": (
            "Next, we present the AI Event Imagination Studio, powered by Vertex AI Gemini Flash and Imagen 3.0. "
            "Coordinators describe their cultural vision in plain English, and our dynamic prompt expansion enriches "
            "it with authentic camera optics, royal marigold canopies, and temple lighting. With one click, "
            "we synthesize photorealistic visualizations of Rajput palaces and South Indian Kalyana Mandapams."
        ),
    },
    {
        "id": "scene_05_event_pulse",
        "title": "Event Pulse, 4DX Sensory Digital Twin & Shock Simulator",
        "text": (
            "On the day of the celebration, coordinators switch to Event Pulse. Our 4DX Sensory Digital Twin "
            "monitors live guest arrivals, acoustic decibel curfews, and forty-thirty-thirty catering batch depletion. "
            "When unexpected chaos strikes, coordinators inject stochastic shocks like mid-event attendance surges "
            "or timeline delays, stress-testing operational resilience in real time."
        ),
    },
    {
        "id": "scene_06_rescue_studio",
        "title": "Rescue Studio, 3-Way Comparative Recovery & Coordinator Sign-Off",
        "text": (
            "Field shocks immediately engage Rescue Studio. Our Google ADK swarm evaluates three comparative counter-mitigations: "
            "Strategy A Conservative, Strategy B Balanced, and Strategy C Aggressive, while mathematically rejecting options "
            "that breach HSE fire limits. In keeping with our strict human-in-the-loop governance, the coordinator audits "
            "cost deltas and signs off on Strategy B, instantly updating state and generating certified FSSAI food rescue manifests."
        ),
    },
    {
        "id": "scene_07_multimodal_ledger_qa",
        "title": "Immutable Decision Ledger & In-App Automated QA Runner",
        "text": (
            "Every approved intervention is cryptographically stamped into the immutable Decision Ledger, providing "
            "a tamper-proof audit trail for families and vendors. We inspect the GenAI Telemetry X-Ray drawer with full "
            "token and latency traces, and launch our in-app automated QA test runner, executing real backend test suites "
            "live with one hundred percent passing checks."
        ),
    },
    {
        "id": "scene_08_conclusion",
        "title": "Enterprise Cloud Architecture & Impact",
        "text": (
            "FestivaPulseAI unites Google Cloud ADK, Vertex AI Gemini 2.5, Cloud Run, and Firebase Hosting into a seamless, "
            "enterprise-ready celebration platform. By combining multi-agent intelligence with deterministic physical constraints, "
            "we safeguard cultural traditions, protect family budgets, and ensure unforgettable, serene celebrations. "
            "This is FestivaPulseAI on Google Cloud."
        ),
    },
]


async def synthesize_gemini_live(client: genai.Client, text: str, output_wav: Path) -> bool:
    """Attempt speech synthesis via Gemini Live Native Audio with Kore voice."""
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Kore"))
        ),
    )
    prompt = (
        "Please read the following script aloud with a clear, elegant, articulate, and natural female voice (Kore) "
        "at a steady, professional broadcast presentation pace. Output ONLY the spoken voiceover verbatim:\n\n" + text
    )
    chunks = []
    try:
        async with client.aio.live.connect(model="gemini-live-2.5-flash-native-audio", config=config) as session:
            await session.send(input=prompt, end_of_turn=True)
            async for response in session.receive():
                if response.server_content and response.server_content.model_turn:
                    for part in response.server_content.model_turn.parts:
                        if hasattr(part, "inline_data") and part.inline_data and part.inline_data.data:
                            chunks.append(part.inline_data.data)
                if response.server_content and response.server_content.turn_complete:
                    break

        if chunks:
            all_pcm = b"".join(chunks)
            with wave.open(str(output_wav), "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(24000)
                wf.writeframes(all_pcm)
            return True
    except Exception as exc:
        print(f"    [Gemini Live] note: {exc}")
    return False


async def synthesize_edge_tts(text: str, output_wav: Path) -> bool:
    """Fallback speech synthesis using Microsoft Edge Neural female voice (en-IN-NeerjaNeural)."""
    import subprocess

    import edge_tts

    temp_mp3 = SCRATCH_DIR / f"{output_wav.stem}_temp.mp3"
    try:
        communicate = edge_tts.Communicate(text, voice="en-IN-NeerjaNeural", rate="+0%", pitch="+0Hz")
        await communicate.save(str(temp_mp3))

        # Convert MP3 to 24000 Hz mono PCM WAV using ffmpeg
        cmd = [FFMPEG_BIN, "-y", "-i", str(temp_mp3), "-ar", "24000", "-ac", "1", "-c:a", "pcm_s16le", str(output_wav)]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if temp_mp3.exists():
            temp_mp3.unlink()
        return res.returncode == 0 and output_wav.exists()
    except Exception as exc:
        print(f"    [Edge TTS] error: {exc}")
        if temp_mp3.exists():
            temp_mp3.unlink()
        return False


async def synthesize_scene(client: genai.Client, scene: dict, output_wav: Path) -> float:
    """Synthesize scene audio, trying Gemini Live first with high-fidelity fallback."""
    print(f"--> Synthesizing [{scene['id']}]: {scene['title']}...")
    success = False

    # Attempt 1: Gemini Live Native Audio (Female 'Kore' voice)
    try:
        success = await synthesize_gemini_live(client, scene["text"], output_wav)
        if success:
            print("    [Source: Gemini Live Native Audio (Kore)]")
    except Exception as e:
        print(f"    Gemini Live attempt skipped: {e}")

    # Attempt 2: High-Fidelity Edge Neural Voice (Neerja / Jenny)
    if not success or not output_wav.exists() or output_wav.stat().st_size < 1000:
        print("    [Fallback: High-Fidelity Neural Female TTS (Neerja)]")
        fallback_ok = await synthesize_edge_tts(scene["text"], output_wav)
        if not fallback_ok:
            raise RuntimeError(f"Audio synthesis failed for {scene['id']}")

    with wave.open(str(output_wav), "rb") as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        duration = frames / float(rate)
        print(f"    Duration: {duration:.2f}s ({output_wav.stat().st_size // 1024} KB)")
        return round(duration, 2)


async def main():
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "genai-apac-2026-491004")
    location = os.getenv("VERTEX_AI_LIVE_LOCATION", "us-central1")
    client = genai.Client(vertexai=True, project=project_id, location=location)

    print("=" * 70)
    print("FestivaPulseAI Official Demo Audio Synthesis Pipeline")
    print(f"Destination: {AUDIO_DIR}")
    print("=" * 70)

    durations = {}
    for idx, scene in enumerate(SCENES, 1):
        wav_path = AUDIO_DIR / f"{scene['id']}.wav"
        print(f"\n[{idx}/{len(SCENES)}]")
        dur = await synthesize_scene(client, scene, wav_path)
        durations[scene["id"]] = dur

    durations_file = AUDIO_DIR / "scene_durations.json"
    with open(durations_file, "w", encoding="utf-8") as f:
        json.dump(durations, f, indent=2)

    total_duration = sum(durations.values())
    print("\n" + "=" * 70)
    print(f"SUCCESS: Generated {len(SCENES)} audio scene tracks.")
    print(f"Total Video Duration: {total_duration:.2f}s (~{total_duration / 60:.2f} minutes)")
    print(f"Durations saved to: {durations_file}")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
