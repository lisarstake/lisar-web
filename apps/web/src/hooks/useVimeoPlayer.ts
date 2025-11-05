import { useState, useEffect, useRef, useMemo } from 'react';
import { extractVimeoId, getVimeoEmbedUrl } from '@/utils/vimeo';

interface UseVimeoPlayerOptions {
  videoUrl?: string;
  onEnded?: () => void;
  onTimeUpdate?: (seconds: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export const useVimeoPlayer = ({
  videoUrl,
  onEnded,
  onTimeUpdate,
  onPlay,
  onPause,
}: UseVimeoPlayerOptions) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const callbacksRef = useRef({ onEnded, onTimeUpdate, onPlay, onPause });

  useEffect(() => {
    callbacksRef.current = { onEnded, onTimeUpdate, onPlay, onPause };
  }, [onEnded, onTimeUpdate, onPlay, onPause]);

  const vimeoId = useMemo(() => {
    if (videoUrl) return extractVimeoId(videoUrl) || undefined;
    return undefined;
  }, [videoUrl]);

  const embedUrl = useMemo(() => {
    if (!vimeoId) return undefined;
    return getVimeoEmbedUrl(vimeoId, {
      autoplay: false,
      muted: false,
      loop: false,
      controls: true,
      title: false,
      portrait: false,
      byline: false,
    });
  }, [vimeoId]);

  useEffect(() => {
    if (!vimeoId || !iframeRef.current) return;

    const initPlayer = () => {
      if (typeof window === 'undefined' || !(window as any).Vimeo?.Player) {
        setTimeout(initPlayer, 100);
        return;
      }

      try {
        const Player = (window as any).Vimeo.Player;
        if (!iframeRef.current) return;
        
        const player = new Player(iframeRef.current);
        playerRef.current = player;

        player.on('play', () => {
          setIsPlaying(true);
          callbacksRef.current.onPlay?.();
        });

        player.on('pause', () => {
          setIsPlaying(false);
          callbacksRef.current.onPause?.();
        });

        player.on('timeupdate', (data: { seconds: number; duration: number }) => {
          setElapsedTime(data.seconds);
          callbacksRef.current.onTimeUpdate?.(data.seconds);
        });

        player.on('seeked', (data: { seconds: number }) => {
          setElapsedTime(data.seconds);
        });

        player.on('ended', () => {
          setIsPlaying(false);
          callbacksRef.current.onEnded?.();
        });

        player.getCurrentTime().then((time: number) => {
          setElapsedTime(time);
        }).catch(() => {});
        
        player.getPaused().then((paused: boolean) => {
          setIsPlaying(!paused);
        }).catch(() => {});
      } catch (error) {
        console.error('Error initializing Vimeo Player:', error);
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      if (iframe.contentDocument?.readyState === 'complete') {
        initPlayer();
      } else {
        iframe.addEventListener('load', initPlayer);
      }
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', initPlayer);
      }
      if (playerRef.current) {
        try {
          playerRef.current.off('play');
          playerRef.current.off('pause');
          playerRef.current.off('timeupdate');
          playerRef.current.off('seeked');
          playerRef.current.off('ended');
        } catch (error) {}
        playerRef.current = null;
      }
    };
  }, [vimeoId]);

  return {
    iframeRef,
    embedUrl,
    elapsedTime,
    isPlaying,
    vimeoId,
  };
};

