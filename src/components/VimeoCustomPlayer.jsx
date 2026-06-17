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
  const timelineRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);
  const seekLoaderTimeoutRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const [hoverTime, setHoverTime] = useState(null);
  const [hoverLeft, setHoverLeft] = useState(0);

  const hashParam = vimeoHash ? `&h=${vimeoHash}` : "";

  const vimeoUrl = `https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=0&muted=0&loop=0&dnt=1&title=0&byline=0&portrait=0&badge=0&controls=0&pip=0&transparent=0${hashParam}`;

  const showControlsTemporarily = () => {
    setShowControls(true);

    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    if (playing) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  useEffect(() => {
    if (!started || !iframeRef.current) return;

    const player = new Player(iframeRef.current);
    playerRef.current = player;

    setBuffering(true);

    player.ready().then(async () => {
      setReady(true);

      const videoDuration = await player.getDuration();
      setDuration(videoDuration);

      setTimeout(async () => {
        try {
          await player.play();
        } catch (error) {
          console.error("Erreur lecture Vimeo :", error);
        } finally {
          setBuffering(false);
        }
      }, 300);
    });

    player.on("play", () => {
      setPlaying(true);
      setBuffering(false);
    });

    player.on("pause", () => {
      setPlaying(false);
      setShowControls(true);
    });

    player.on("ended", () => {
      setPlaying(false);
      setShowControls(true);
    });

    player.on("bufferstart", () => {
      setBuffering(true);
      setShowControls(true);
    });

    player.on("bufferend", () => {
      setBuffering(false);
    });

    player.on("timeupdate", (data) => {
      setCurrentTime(data.seconds || 0);
      setDuration(data.duration || 0);
    });

    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }

      if (seekLoaderTimeoutRef.current) {
        clearTimeout(seekLoaderTimeoutRef.current);
      }

      player.destroy();
    };
  }, [started]);

  useEffect(() => {
    showControlsTemporarily();
  }, [playing]);

  useEffect(() => {
    const handleActivity = () => {
      if (!started) return;
      showControlsTemporarily();
    };

    const handleKeyDown = async (event) => {
      if (!started) return;

      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (event.code === "Space") {
        event.preventDefault();
        await togglePlay();
        showControlsTemporarily();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        await skip(-10);
        showControlsTemporarily();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        await skip(10);
        showControlsTemporarily();
      }

      if (event.key?.toLowerCase() === "f") {
        event.preventDefault();
        await toggleFullscreen();
        showControlsTemporarily();
      }

      if (event.key?.toLowerCase() === "m") {
        event.preventDefault();
        await toggleMute();
        showControlsTemporarily();
      }
    };

    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("touchstart", handleActivity);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("touchstart", handleActivity);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [started, playing, duration, volume, muted]);

  const startVideo = () => {
    setStarted(true);
    setShowControls(true);
    setBuffering(true);
  };

  const togglePlay = async () => {
    if (!playerRef.current) return;

    if (playing) {
      setPlaying(false);
      await playerRef.current.pause();
    } else {
      setPlaying(true);
      await playerRef.current.play();
    }
  };

  const seekTo = async (value) => {
    if (!playerRef.current) return;

    const nextTime = Number(value);
    setCurrentTime(nextTime);

    if (seekLoaderTimeoutRef.current) {
      clearTimeout(seekLoaderTimeoutRef.current);
    }

    seekLoaderTimeoutRef.current = setTimeout(() => {
      setBuffering(true);
    }, 250);

    try {
      await playerRef.current.setCurrentTime(nextTime);
    } finally {
      if (seekLoaderTimeoutRef.current) {
        clearTimeout(seekLoaderTimeoutRef.current);
      }

      seekLoaderTimeoutRef.current = null;
      setBuffering(false);
    }
  };

  const skip = async (amount) => {
    if (!playerRef.current) return;

    const time = await playerRef.current.getCurrentTime();
    const nextTime = Math.min(Math.max(time + amount, 0), duration);

    setCurrentTime(nextTime);

    if (seekLoaderTimeoutRef.current) {
      clearTimeout(seekLoaderTimeoutRef.current);
    }

    seekLoaderTimeoutRef.current = setTimeout(() => {
      setBuffering(true);
    }, 250);

    try {
      await playerRef.current.setCurrentTime(nextTime);
    } finally {
      if (seekLoaderTimeoutRef.current) {
        clearTimeout(seekLoaderTimeoutRef.current);
      }

      seekLoaderTimeoutRef.current = null;
      setBuffering(false);
    }
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

  const handleTimelineMove = (event) => {
    if (!timelineRef.current || !duration) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const ratio = Math.min(Math.max(x / rect.width, 0), 1);

    setHoverTime(ratio * duration);
    setHoverLeft(ratio * 100);
  };

  const handleTimelineLeave = () => {
    setHoverTime(null);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black ${
        !showControls && playing ? "cursor-none" : "cursor-auto"
      }`}
      onDoubleClick={toggleFullscreen}
      onTouchStart={showControlsTemporarily}
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

          {(buffering || !ready) && (
            <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 text-white">
              <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
                <div className="absolute h-16 w-16 rounded-full border border-white/20" />
                <div className="absolute h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-white" />
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>

              <p className="rounded-full bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/80 backdrop-blur">
                Chargement du film
              </p>
            </div>
          )}

          <div
            className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-4 pb-4 pt-16 transition-all duration-300 ${
              showControls || !playing
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0 pointer-events-none"
            }`}
          >
            <div
              ref={timelineRef}
              className="relative mb-3"
              onMouseMove={handleTimelineMove}
              onMouseLeave={handleTimelineLeave}
            >
              {hoverTime !== null && (
                <div
                  className="pointer-events-none absolute -top-9 rounded bg-black/80 px-2 py-1 text-xs text-white"
                  style={{
                    left: `${hoverLeft}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}

              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={(e) => seekTo(e.target.value)}
                className="w-full cursor-pointer"
                aria-label="Progression"
              />
            </div>

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
                className="rounded-full bg-white/10 px-3 py-2 text-xs opacity-90 transition hover:bg-white/20"
              >
                -10s
              </button>

              <button
                type="button"
                onClick={() => skip(10)}
                className="rounded-full bg-white/10 px-3 py-2 text-xs opacity-90 transition hover:bg-white/20"
              >
                +10s
              </button>

              <div className="min-w-[100px] text-xs tabular-nums text-white/80">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              <button
                type="button"
                onClick={toggleMute}
                className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg transition hover:bg-white/20"
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
                className="hidden w-24 cursor-pointer sm:block"
                aria-label="Volume"
              />

              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg transition hover:bg-white/20"
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