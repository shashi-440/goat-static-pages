import { useState, useEffect } from "react";

// Add type definition for window with our cache
declare global {
  interface Window {
    __loadedImagesCache?: Set<string>;
    __loadedImagesCacheOrder?: string[];
  }
}

const CACHE_SIZE_LIMIT = 100;

// Initialize cache on window if it doesn't exist
if (__CLIENT__ && !window.__loadedImagesCache) {
  window.__loadedImagesCache = new Set<string>();
  window.__loadedImagesCacheOrder = [];
}

// Helper to manage cache size
const addToCache = (url: string) => {
  if (!__CLIENT__ || !window.__loadedImagesCache || !window.__loadedImagesCacheOrder) return;

  // If URL is already in cache, move it to the end (most recently used)
  if (window.__loadedImagesCache.has(url)) {
    const index = window.__loadedImagesCacheOrder.indexOf(url);
    if (index > -1) {
      window.__loadedImagesCacheOrder.splice(index, 1);
    }
  } else {
    // If cache is full, remove oldest entry
    if (window.__loadedImagesCache.size >= CACHE_SIZE_LIMIT) {
      const oldestUrl = window.__loadedImagesCacheOrder.shift();
      if (oldestUrl) {
        window.__loadedImagesCache.delete(oldestUrl);
      }
    }
    // Add new URL to cache
    window.__loadedImagesCache.add(url);
  }
  // Add URL to the end of order array (most recently used)
  window.__loadedImagesCacheOrder.push(url);
};

interface IUseLazyImage {
  src: string;
  placeholderUrl?: string;
  lazyTarget: any;
  intersectionObserverOptions?: any;
  fallbackSrc?: string;
  isEagerLoad?: boolean;
  isAutoScroll?: boolean; // Prop for auto-scroll optimization PLG-2378
  autoScrollIndex?: number;
}

const useLazyImage = ({
  src = "",
  placeholderUrl = "",
  lazyTarget = null,
  intersectionObserverOptions = {
    rootMargin: "300px 0px 300px 0px",
  },
  fallbackSrc = "",
  isEagerLoad = false,
  isAutoScroll = false,
  autoScrollIndex = 0,
}: IUseLazyImage) => {
  // Use full URL with parameters for caching
  const isFromCache = __CLIENT__ && window.__loadedImagesCache?.has(src);

  const [imgSrc, setImgSrc] = useState(() => {
    // If image is already loaded or eager load is true, use src directly
    if (isEagerLoad || isFromCache) {
      return src;
    }
    return placeholderUrl;
  });
  const [errSrc, setErrSrc] = useState(null);
  // @ts-ignore
  const onError = () => setErrSrc(fallbackSrc || placeholderUrl);

  // load image
  useEffect(() => {
    let lazyImageObserver: any = null;
    let preloadTimeout: NodeJS.Timeout | null = null;

    // If image is already loaded or eager load is true, set src directly
    if (isEagerLoad || isFromCache) {
      setImgSrc(src);
    } else if (!isEagerLoad) {
      // For auto-scroll: First image loads normally, others after 200ms delay
      if (isAutoScroll) {
        const delay = autoScrollIndex === 0 ? 0 : 200;
        preloadTimeout = setTimeout(() => {
          setErrSrc(null);
          setImgSrc(src);
          addToCache(src);
        }, delay);
      } else if (
        "IntersectionObserver" in window &&
        lazyTarget &&
        lazyTarget?.current instanceof Element
      ) {
        if (src !== imgSrc) {
          lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setErrSrc(null);
                setImgSrc(src);
                // Add to cache when image is loaded, keeping full URL with parameters
                addToCache(src);
                lazyImageObserver.unobserve(entry.target);
              }
            });
          }, intersectionObserverOptions);

          lazyImageObserver.observe(lazyTarget.current);
        }
      } else {
        // baseline: load image after componentDidMount
        setImgSrc(src);
        // Add to cache when image is loaded, keeping full URL with parameters
        addToCache(src);
      }
    }

    return () => {
      if (lazyImageObserver) {
        lazyImageObserver.disconnect();
      }
      if (preloadTimeout) {
        clearTimeout(preloadTimeout);
      }
    };
  }, [src, isAutoScroll]);

  return { imgSrc: errSrc || imgSrc, onError, setImgSrc, isFromCache };
};

export default useLazyImage;
