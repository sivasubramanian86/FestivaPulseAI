#!/usr/bin/env python3
"""
FestivaPulseAI - Official Demo Video Recording & Assembly Pipeline.
Drives Playwright Chromium headless against the live application,
executes frame-perfect actions synchronized with narration WAVs,
and uses FFmpeg to mux pristine 1080p H.264 video with synchronized audio.
"""

import io
import json
import os
import subprocess
import sys
import time
import wave
from pathlib import Path

from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "docs" / "demo" / "demo_audio"
OUTPUT_DIR = ROOT / "docs" / "demo"
TEMP_REC_DIR = ROOT / "scratch" / "playwright_video_recording"
TEMP_REC_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FFMPEG_BIN = r"C:\ProgramData\chocolatey\bin\ffmpeg.exe"
if not os.path.exists(FFMPEG_BIN):
    FFMPEG_BIN = "ffmpeg"

SCENE_IDS = [
    "scene_01_intro",
    "scene_02_blueprint",
    "scene_03_adk_swarm",
    "scene_04_imagination_atelier",
    "scene_05_event_pulse",
    "scene_06_rescue_studio",
    "scene_07_multimodal_ledger_qa",
    "scene_08_conclusion",
]

APP_URL = "https://festivapulseai.web.app/"


def log(msg: str) -> None:
    print(msg, flush=True)


def load_durations() -> dict[str, float]:
    durations_file = AUDIO_DIR / "scene_durations.json"
    if durations_file.exists():
        with open(durations_file, "r", encoding="utf-8") as f:
            return json.load(f)

    durations = {}
    for sid in SCENE_IDS:
        p = AUDIO_DIR / f"{sid}.wav"
        if not p.exists():
            raise FileNotFoundError(f"Missing audio track: {p}")
        with wave.open(str(p), "rb") as wf:
            durations[sid] = wf.getnframes() / float(wf.getframerate())
    return durations


def concatenate_audio() -> Path:
    playlist = AUDIO_DIR / "concat_list.txt"
    with open(playlist, "w", encoding="utf-8") as f:
        for sid in SCENE_IDS:
            path_str = (AUDIO_DIR / f"{sid}.wav").resolve().as_posix()
            f.write(f"file '{path_str}'\n")

    combined = AUDIO_DIR / "combined_narration.wav"
    cmd = [
        FFMPEG_BIN,
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(playlist),
        "-c:a",
        "pcm_s16le",
        "-ar",
        "24000",
        str(combined),
    ]
    log(f"Concatenating {len(SCENE_IDS)} audio tracks into combined narration...")
    subprocess.run(cmd, check=True)
    return combined


def scroll(page, amount: int) -> None:
    page.evaluate("(amount) => window.scrollBy({top: amount, behavior: 'smooth'})", amount)


def scroll_to_top(page) -> None:
    page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")


def click_button_with_text(page, *labels: str) -> None:
    page.evaluate(
        """(labels) => {
            const btn = [...document.querySelectorAll('button')].find(b =>
                labels.some(l => b.textContent && b.textContent.includes(l))
            );
            if (btn) btn.click();
        }""",
        list(labels),
    )


def switch_tab(page, tab_keyword: str) -> None:
    page.evaluate(
        """(kw) => {
            const btn = [...document.querySelectorAll('nav button')].find(b =>
                b.textContent && b.textContent.toLowerCase().includes(kw.toLowerCase())
            );
            if (btn) btn.click();
        }""",
        tab_keyword,
    )


def at(page, scene_started: float, offset: float, action) -> None:
    remaining = scene_started + offset - time.monotonic()
    if remaining > 0:
        page.wait_for_timeout(round(remaining * 1000))
    try:
        action()
    except Exception as exc:
        log(f"    Action offset {offset:.1f}s note: {exc}")


def record_scene(page, scene_id: str, duration: float, checkpoints) -> None:
    log(f"[{scene_id}] Playing for {duration:.2f}s...")
    started = time.monotonic()
    for offset, action in checkpoints:
        if offset < duration:
            at(page, started, offset, action)
    at(page, started, duration, lambda: None)


def record_video(durations: dict[str, float]) -> tuple[Path, float]:
    log("Launching Playwright Chromium headless at 1920x1080...")
    playwright = sync_playwright().start()
    browser = playwright.chromium.launch(
        headless=True,
        args=["--start-maximized", "--disable-blink-features=AutomationControlled"],
    )
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir=str(TEMP_REC_DIR),
        record_video_size={"width": 1920, "height": 1080},
    )

    page = context.new_page()
    page.set_default_timeout(20000)

    # Initial title card pre-roll
    recording_started = time.monotonic()
    page.goto(
        "data:text/html,<html><body style='margin:0;background:%230E0918;color:%23F5E6CA;display:grid;place-items:center;height:100vh;font-family:sans-serif;text-align:center'><div><h1 style='font-size:52px;margin:0 0 10px 0;letter-spacing:1px;background:linear-gradient(135deg,%23D4AF37,%23F59E0B,%23E11D48);-webkit-background-clip:text;-webkit-text-fill-color:transparent;'>FestivaPulseAI</h1><p style='font-size:24px;margin:0;color:%23E8DFD1;'>Autonomous Celebration Operating System</p><p style='font-size:16px;color:%23D4AF37;margin-top:15px;letter-spacing:2px;font-family:monospace;'>GOOGLE CLOUD APAC AI BUILDER CUP 2026</p></div></body></html>",
        wait_until="load",
    )
    page.wait_for_timeout(1400)

    log(f"Navigating to {APP_URL}...")
    page.goto(APP_URL, wait_until="networkidle")
    page.wait_for_selector("nav[aria-label='Main Navigation']", timeout=30000)
    preroll = time.monotonic() - recording_started
    log(f"Pre-roll delay measured: {preroll:.2f}s")

    def run(sid: str, checkpoints):
        record_scene(page, sid, durations[sid], checkpoints)

    # SCENE 1: Welcome, Themes & Multilingual Localization (35.15s)
    run(
        "scene_01_intro",
        [
            (3.0, lambda: page.locator("button[aria-label='Toggle Color Theme']").click()),  # Light mode (Ivory Silk)
            (
                7.5,
                lambda: page.locator("button[aria-label='Toggle Color Theme']").click(),
            ),  # Dark mode (Midnight Velvet)
            (11.0, lambda: page.locator("select[aria-label='Select Language']").select_option("ta")),  # Tamil
            (15.0, lambda: page.locator("select[aria-label='Select Language']").select_option("hi")),  # Hindi
            (19.0, lambda: page.locator("select[aria-label='Select Language']").select_option("kn")),  # Kannada
            (23.0, lambda: page.locator("select[aria-label='Select Language']").select_option("te")),  # Telugu
            (27.0, lambda: page.locator("select[aria-label='Select Language']").select_option("en")),  # English
            (30.0, lambda: scroll(page, 320)),
            (33.0, lambda: scroll_to_top(page)),
        ],
    )

    # SCENE 2: Celebration Blueprint & 1-Click Cultural Presets (34.58s)
    run(
        "scene_02_blueprint",
        [
            (1.5, lambda: scroll(page, 280)),
            # Trigger Test Error State to show validation alert banner on camera
            (4.5, lambda: click_button_with_text(page, "Test Error State")),
            (9.5, lambda: click_button_with_text(page, "Wedding (₹18L)", "Traditional Wedding")),
            (14.0, lambda: scroll(page, 400)),
            (17.5, lambda: page.locator("button[aria-label='Generate Celebration Blueprint']").click()),
            (
                21.5,
                lambda: page.evaluate(
                    "document.querySelector('[class*=\"border-emerald-500\"]')?.scrollIntoView({behavior:'smooth',block:'start'})"
                ),
            ),
            (26.0, lambda: scroll(page, 300)),
        ],
    )

    # SCENE 3: Google Cloud ADK Multi-Agent Swarm Deliberation (31.75s)
    run(
        "scene_03_adk_swarm",
        [
            (
                1.0,
                lambda: page.evaluate(
                    "() => { const h = [...document.querySelectorAll('h3, h2')].find(el => el.textContent.includes('Agent Swarm') || el.textContent.includes('ADK')); if (h) h.scrollIntoView({behavior:'smooth',block:'start'}); else window.scrollBy({top:400,behavior:'smooth'}); }"
                ),
            ),
            # Click through agent cards to inspect thoughts and tool calls
            (4.0, lambda: click_button_with_text(page, "Supervisor", "EventSupervisorAgent")),
            (8.5, lambda: click_button_with_text(page, "FoodGuard", "FestivaFoodGuardAgent")),
            (13.0, lambda: click_button_with_text(page, "Budget Agent", "BudgetElasticityAgent")),
            (17.5, lambda: click_button_with_text(page, "Timeline Agent", "TimelineCascadeAgent")),
            # Switch to Predictive Forecasting Dashboard
            (22.0, lambda: click_button_with_text(page, "Predictive Forecasting", "Predictions")),
            (26.0, lambda: scroll(page, 200)),
        ],
    )

    # SCENE 4: AI Event Imagination Studio & Vertex AI Image Synthesis (30.60s)
    run(
        "scene_04_imagination_atelier",
        [
            (
                1.0,
                lambda: page.evaluate(
                    "() => { const el = [...document.querySelectorAll('h3')].find(e => e.textContent.includes('Imagination Studio')); if (el) el.scrollIntoView({behavior:'smooth',block:'start'}); else window.scrollBy({top:650,behavior:'smooth'}); }"
                ),
            ),
            # Click 1-Click Visual Theme pill: Raja Rani Rajput Palace
            (4.0, lambda: click_button_with_text(page, "Raja Rani Rajput Palace", "Raja Rani")),
            (
                11.0,
                lambda: page.locator("select[aria-label='Lighting Mood Setting']").select_option("Muhurtham Twilight"),
            ),
            (15.0, lambda: click_button_with_text(page, "Visualize with Imagen 3")),
            (21.0, lambda: scroll(page, 250)),
        ],
    )

    # SCENE 5: Event Pulse, 4DX Sensory Digital Twin & Shock Simulator (27.31s)
    run(
        "scene_05_event_pulse",
        [
            (1.0, lambda: switch_tab(page, "pulse")),
            (
                4.0,
                lambda: page.evaluate(
                    "() => { const input = document.querySelector('input[type=\"range\"]'); if (input) { input.value = '315'; input.dispatchEvent(new Event('change', { bubbles: true })); } }"
                ),
            ),
            (8.0, lambda: scroll(page, 350)),
            (14.0, lambda: scroll(page, 400)),
            # Click Crowd Surge shock simulator button
            (19.0, lambda: click_button_with_text(page, "Crowd Surge", "Jump from 250 to 360")),
        ],
    )

    # SCENE 6: Rescue Studio, 3-Way Comparative Recovery & Coordinator Sign-Off (29.11s)
    run(
        "scene_06_rescue_studio",
        [
            (1.0, lambda: switch_tab(page, "rescue")),
            (3.5, lambda: scroll(page, 300)),
            (10.0, lambda: scroll(page, 350)),
            (16.0, lambda: scroll(page, -350)),
            # Approve Strategy B Balanced proposal
            (
                20.0,
                lambda: page.evaluate(
                    "() => { const btns = [...document.querySelectorAll('button')].filter(b => b.textContent && b.textContent.includes('Approve Proposal')); if (btns.length > 1) btns[1].click(); else if (btns.length > 0) btns[0].click(); }"
                ),
            ),
            (24.0, lambda: switch_tab(page, "ledger")),
        ],
    )

    # SCENE 7: Immutable Decision Ledger & In-App Automated QA Runner (24.31s)
    run(
        "scene_07_multimodal_ledger_qa",
        [
            (1.0, lambda: switch_tab(page, "ledger")),
            (3.0, lambda: scroll(page, 200)),
            # Open Telemetry X-Ray Drawer
            (6.0, lambda: click_button_with_text(page, "Telemetry X-Ray")),
            (10.0, lambda: click_button_with_text(page, "Telemetry X-Ray")),  # Close Drawer
            # Open QA Suite Modal
            (12.5, lambda: click_button_with_text(page, "QA Suite")),
            # Run Automated Test Suite
            (15.0, lambda: click_button_with_text(page, "Run Automated Test Suite", "Run Full Suite")),
            (20.0, lambda: page.keyboard.press("Escape")),
        ],
    )

    # SCENE 8: Enterprise Cloud Architecture & Impact (29.02s)
    run(
        "scene_08_conclusion",
        [
            (1.0, lambda: switch_tab(page, "blueprint")),
            (3.0, lambda: scroll_to_top(page)),
            (7.0, lambda: scroll(page, 200)),
            (16.0, lambda: scroll_to_top(page)),
        ],
    )

    log("Closing browser and flushing recorded WebM...")
    video = page.video
    page.close()
    context.close()
    rec_path = Path(video.path())
    browser.close()
    playwright.stop()

    rec_size_mb = rec_path.stat().st_size / (1024 * 1024)
    log(f"Raw video recorded: {rec_path} ({rec_size_mb:.2f} MB)")
    return rec_path, preroll


def assemble_final_video(video: Path, narration: Path, preroll: float, output: Path) -> None:
    log("Synchronizing audio pre-roll and muxing final MP4...")
    delay_ms = max(0, round(preroll * 1000))
    aligned_audio = AUDIO_DIR / "aligned_narration.wav"

    # 1. Apply audio delay to match initial page load
    cmd_adelay = [
        FFMPEG_BIN,
        "-y",
        "-i",
        str(narration),
        "-af",
        f"adelay={delay_ms}:all=1",
        "-c:a",
        "pcm_s16le",
        str(aligned_audio),
    ]
    subprocess.run(cmd_adelay, check=True)

    # 2. Mux video and aligned audio into high-quality 1080p MP4
    cmd_mux = [
        FFMPEG_BIN,
        "-y",
        "-i",
        str(video),
        "-i",
        str(aligned_audio),
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-shortest",
        str(output),
    ]
    subprocess.run(cmd_mux, check=True)

    # 3. Generate high-resolution thumbnail cover at 15s mark
    cover_image = OUTPUT_DIR / "FestivaPulseAI_Official_Demo_Cover.jpg"
    cmd_cover = [
        FFMPEG_BIN,
        "-y",
        "-ss",
        "00:00:15",
        "-i",
        str(output),
        "-vframes",
        "1",
        "-q:v",
        "2",
        "-update",
        "1",
        str(cover_image),
    ]
    subprocess.run(cmd_cover, check=True)

    final_size_mb = output.stat().st_size / (1024 * 1024)
    log("=" * 70)
    log("SUCCESS: Official Hackathon Demo Video Created!")
    log(f"Output File: {output} ({final_size_mb:.2f} MB)")
    log(f"Cover Image: {cover_image}")
    log("=" * 70)


def main():
    durations = load_durations()
    total_time = sum(durations.values())
    log(f"Loaded narration timing: {total_time:.2f}s (~{total_time / 60:.2f} minutes) across {len(durations)} scenes")

    narration = concatenate_audio()
    video_path, preroll = record_video(durations)
    output_mp4 = OUTPUT_DIR / "FestivaPulseAI_Official_Demo_Video_4Min.mp4"
    assemble_final_video(video_path, narration, preroll, output_mp4)


if __name__ == "__main__":
    main()
