/* eslint-disable react/forbid-elements */
import { memo, useEffect, useRef } from "react";
import useLazyImage from "hooks/useLazyImage";
import styles from "./Image.module.scss";
import formatClassNames from "@Utils/clientUtils/stringUtility/formatClassNames";
import { Helmet } from "react-helmet";
import config from "@Config/index";

interface ILazyImage extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  width: string | number;
  height: string | number;
  fallbackSrc?: string;
  className?: string;
  alt?: string;
  onClick?: any;
  placeholderUrl?: string;
  isEagerLoad?: boolean;
  isNotLazy?: boolean;
  rootMargin?: string;
  dataTestId?: string;
  isWhitelabelIframeImage?: boolean;
  addShimmer?: boolean;
  noTransformAnimation?: boolean;
  isAutoScroll?: boolean;
  autoScrollIndex?: number;
  shimmerStyles?: React.CSSProperties;
}

const getImageSrc = (src: string) => {
  let imgSrcReal = "";
  if (src.includes("https://prod-static-assets.amberstudent.com")) {
    imgSrcReal = src.replace(
      "https://prod-static-assets.amberstudent.com",
      `${config.CHINA_STATIC_ASSETS_URL}/image/prod-static-assets`,
    );
  } else if (src.includes("https://prod-assets.amberstudent.com")) {
    imgSrcReal = src.replace(
      "https://prod-assets.amberstudent.com",
      `${config.CHINA_STATIC_ASSETS_URL}/image/prod-assets`,
    );
  } else if (src.includes("https://assets.amberstudent.com")) {
    imgSrcReal = src.replace(
      "https://assets.amberstudent.com",
      `${config.CHINA_STATIC_ASSETS_URL}/image/assets`,
    );
  } else if (src.includes("https://assets.dev-amber.com")) {
    imgSrcReal = src.replace(
      "https://assets.dev-amber.com",
      `${config.CHINA_STATIC_ASSETS_URL}/image/dev-assets`,
    );
  } else if (src.includes("https://static-assets.amberstudent.com")) {
    imgSrcReal = src.replace(
      "https://static-assets.amberstudent.com",
      `${config.CHINA_STATIC_ASSETS_URL}/image/static-assets`,
    );
  } else {
    imgSrcReal = src;
  }
  return imgSrcReal;
};

const Image = ({
  src = "",
  placeholderUrl = "",
  fallbackSrc = "",
  className = "",
  alt = "",
  height,
  width,
  isEagerLoad = false,
  onClick = null,
  isNotLazy = false,
  rootMargin = "300px 0px 300px 0px",
  dataTestId = "",
  isWhitelabelIframeImage = false,
  addShimmer = false,
  noTransformAnimation = false,
  isAutoScroll = false,
  autoScrollIndex = 0,
  shimmerStyles = {},
  ...rest
}: ILazyImage) => {
  const imgElement = useRef<any>(null);
  const { imgSrc, setImgSrc, isFromCache } = useLazyImage({
    src,
    placeholderUrl,
    lazyTarget: imgElement,
    fallbackSrc,
    isEagerLoad: isNotLazy || isEagerLoad,
    isAutoScroll,
    autoScrollIndex,
    intersectionObserverOptions: {
      rootMargin,
    },
  });

  const imgSrcReal = config.IS_CHINA_APP ? getImageSrc(imgSrc) : imgSrc;

  const handleOnLoad = () => {
    if (imgElement.current) {
      imgElement.current.classList.remove(styles.fallbackClass);
      imgElement.current.classList.add(styles.show);
    }
  };

  useEffect(() => {
    if (isWhitelabelIframeImage) {
      setImgSrc(src);
    }
  }, [src, setImgSrc]);

  const renderImg = (noClass = false) => (
    <>
      <img
        height={height}
        width={width}
        src={imgSrcReal}
        alt={alt}
        ref={imgElement}
        data-testid={dataTestId}
        onLoad={handleOnLoad}
        className={formatClassNames(
          styles.animateOpacity,
          !noClass && className,
          (isEagerLoad || isNotLazy || isFromCache) && styles.show,
          !imgSrcReal && styles.fallbackClass,
          noTransformAnimation && styles.noTransformAnimation,
        )}
        onClick={onClick}
        {...rest}
        role="none"
      />
      {isEagerLoad && (
        <Helmet>
          <link rel="preload" fetchPriority="high" as="image" href={imgSrcReal} />
        </Helmet>
      )}
    </>
  );

  if (addShimmer) {
    return (
      <div
        style={{ width, height, ...shimmerStyles }}
        className={formatClassNames(styles.shimmerBackground, className)}
      >
        {renderImg(true)}
      </div>
    );
  }
  return renderImg();
};
export default memo(Image);
