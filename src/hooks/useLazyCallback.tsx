import { useEffect } from "react";

export const observeElement = (
  callback: any,
  elementRef: any,
  options: IntersectionObserverInit = { rootMargin: "0px 0px 500px 0px" },
  noLazy: boolean,
) => {
  if (typeof IntersectionObserver === "undefined" || !IntersectionObserver || noLazy) {
    callback();
  } else {
    const observer = new IntersectionObserver((entries) => {
      const element = entries[0];
      if (element.isIntersecting) {
        callback();
        observer.unobserve(element.target);
      }
    }, options);
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
  }
};

export const useLazyCallback = (
  callback: any,
  options: IntersectionObserverInit,
  elementRef: any,
  conditions: any = [],
  noLazy = false,
) => {
  useEffect(() => {
    if (callback) observeElement(callback, elementRef, options, noLazy);
  }, conditions);
};
