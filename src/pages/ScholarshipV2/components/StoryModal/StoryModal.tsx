import { useEffect } from "react";
import styles from "./StoryModal.module.scss";

interface StoryModalProps {
  /** Rendered only while true — keeps the iframe from loading in the background. */
  open: boolean;
  /** Whose story is playing, used for the caption and the dialog label. */
  title: string;
  /** YouTube video id. */
  videoId: string;
  /**
   * Start offset in seconds — the `t=` on a YouTube share link. Optional; omitted
   * means the video plays from the beginning, which is what every existing caller
   * gets.
   */
  start?: number;
  onClose: () => void;
}

/**
 * Lightbox for a winner's story video.
 *
 * Uses youtube-nocookie and only mounts the iframe while open, so nothing is
 * requested from YouTube (and no cookie is set) until someone opens a story.
 * autoplay=1 is honoured because opening it is always a user gesture.
 */
const StoryModal = ({ open, title, videoId, start, onClose }: StoryModalProps) => {
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Stop the page scrolling behind the dialog, restoring whatever was set.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — amberscholar story`}
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close story">
          <span className={styles.closeIcon} aria-hidden="true" />
        </button>

        <div className={styles.frame}>
          <iframe
            className={styles.video}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1${
              start ? `&start=${start}` : ""
            }`}
            title={`${title} — amberscholar story`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <p className={styles.caption}>{title}</p>
      </div>
    </div>
  );
};

export default StoryModal;
