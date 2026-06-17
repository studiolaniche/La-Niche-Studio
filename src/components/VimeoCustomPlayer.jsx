import { useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function VimeoCustomPlayer({
  vimeoId,
  vimeoHash = "",
  poster,
  title = "Vidéo",
}) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const wrapperRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const hashParam = vimeoHash ? `&h=${vimeoHash}` : "";

  const vimeoUrl = `https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=0&muted=0&loop=0&dnt=1&title=0&byline=0&portrait=0&badge=0&controls=0&pip=0&transparent=0${hashParam}`;

  useEffect(() => {
    if (!started || !iframeRef.current) return;

    const player = new Player(iframeRef.current);
    playerRef.current = player;

    player.ready().then(async () => {
      setReady(true);
      const videoDuration = await player.getDuration();
      setDuration(videoDuration);
      await player.play();
    });

    player.on("play", () => setPlaying(true));
    player.on("pause", () => setPlaying(false));
    player.on("ended", () => setPlaying(false));

    player.on("timeupdate", (data) => {
      setCurrentTime(data.seconds || 0);
      setDuration(data.duration || 0);
    });

    return () => {
      player.destroy();
    };
  }, [started]);

  const startVideo = () => {
    setStarted(true);
  };

  const togglePlay = async () => {
    if (!playerRef.current) return;

    if (playing) {
      await playerRef.current.pause();
    } else {
      await playerRef.current.play();
    }
  };

  const seekTo = async (value) => {
    if (!playerRef.current) return;

    const nextTime = Number(value);
    setCurrentTime(nextTime);
    await playerRef.current.setCurrentTime(nextTime);
  };

  const skip = async (amount) => {
    if (!playerRef.current) return;

    const time = await playerRef.current.getCurrentTime();
    const nextTime = Math.min(Math.max(time + amount, 0), duration);
    await playerRef.current.setCurrentTime(nextTime);
  };

  const changeVolume = async (value) => {
    if (!playerRef.current) return;

    const nextVolume = Number(value);
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
    await playerRef.current.setVolume(nextVolume);
  };

  const toggleMute = async () => {
    if (!playerRef.current) return;

    if (muted || volume === 0) {
      setMuted(false);
      setVolume(1);
      await playerRef.current.setVolume(1);
    } else {
      setMuted(true);
      setVolume(0);
      await playerRef.current.setVolume(0);
    }
  };

  const toggleFullscreen = async () => {
    if (!wrapperRef.current) return;

    if (!document.fullscreenElement) {
      await wrapperRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black"
    >
      {!started && (
        <>
          {poster && (
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-black/30" />

          <button
            type="button"
            onClick={startVideo}
            className="absolute inset-0 z-20 flex items-center justify-center"
            aria-label="Lire la vidéo"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition hover:scale-105 hover:bg-white/30">
              <span className="ml-1 text-4xl text-white">▶</span>
            </div>
          </button>
        </>
      )}

      {started && (
        <>
          <iframe
            ref={iframeRef}
            src={vimeoUrl}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={title}
          />

          {!ready && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black text-white/70">
              Chargement…
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-100 transition">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={(e) => seekTo(e.target.value)}
              className="mb-3 w-full cursor-pointer"
            />

            <div className="flex items-center gap-3 text-white">
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
                aria-label={playing ? "Mettre en pause" : "Lire"}
              >
                {playing ? "Ⅱ" : "▶"}
              </button>

              <button
                type="button"
                onClick={() => skip(-10)}
                className="text-sm opacity-80 transition hover:opacity-100"
              >
                -10s
              </button>

              <button
                type="button"
                onClick={() => skip(10)}
                className="text-sm opacity-80 transition hover:opacity-100"
              >
                +10s
              </button>

              <div className="min-w-[90px] text-xs tabular-nums text-white/80">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              <button
                type="button"
                onClick={toggleMute}
                className="ml-auto text-lg opacity-90 transition hover:opacity-100"
                aria-label={muted ? "Activer le son" : "Couper le son"}
              >
                {muted || volume === 0 ? "🔇" : "🔊"}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => changeVolume(e.target.value)}
                className="w-24 cursor-pointer"
                aria-label="Volume"
              />

              <button
                type="button"
                onClick={toggleFullscreen}
                className="text-lg opacity-90 transition hover:opacity-100"
                aria-label="Plein écran"
              >
                ⛶
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}