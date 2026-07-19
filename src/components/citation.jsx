import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

// Broadcast on <document> whenever a citation opens; other open citations
// listen and close themselves so only one popover is ever active — including
// when a new one is opened by keyboard (Tab + Enter/Space), which fires no
// pointer event for the outside-click handler to catch.
const OPEN_EVENT = 'citation:open';

const MARGIN = 16; // min distance the popover keeps from the viewport edges
const GAP = 10; // distance between the phrase and the popover

const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));

// An inline phrase with a superscript citation number. Hovering the phrase
// tints it, and clicking the phrase or the number opens a popover with the
// note. The popover renders into <body> and positions itself against the
// phrase each time it opens (and on scroll/resize) so it stays on screen at
// any viewport size.
function Citation({ number, note, children }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, ready: false });
  const anchorRef = useRef(null);
  const popoverRef = useRef(null);

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const popover = popoverRef.current;
    if (!anchor || !popover) return;

    const a = anchor.getBoundingClientRect();
    const pw = popover.offsetWidth;
    const ph = popover.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Center over the phrase horizontally, then clamp within the viewport.
    const left = clamp(a.left + a.width / 2 - pw / 2, MARGIN, vw - pw - MARGIN);

    // Prefer sitting above the phrase; drop below when there isn't room.
    let top = a.top - ph - GAP;
    if (top < MARGIN) {
      const below = a.bottom + GAP;
      top =
        below + ph <= vh - MARGIN ? below : clamp(top, MARGIN, vh - ph - MARGIN);
    }

    setPos({ top, left, ready: true });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (e) => {
      if (
        popoverRef.current?.contains(e.target) ||
        anchorRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onOtherOpen = (e) => {
      if (e.detail !== id) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener(OPEN_EVENT, onOtherOpen);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener(OPEN_EVENT, onOtherOpen);
    };
  }, [open, id]);

  const toggle = () => {
    const next = !open;
    setPos((p) => ({ ...p, ready: false })); // re-measure before showing
    setOpen(next);
    if (next) {
      document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
    }
  };

  const onAnchorKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <span className="citation">
      <span
        ref={anchorRef}
        className="citation-phrase"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={onAnchorKeyDown}
      >
        {children}
        <sup className="citation-number">{number}</sup>
      </span>
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="citation-popover"
            role="dialog"
            aria-label={`Note ${number}`}
            style={{
              top: pos.top,
              left: pos.left,
              visibility: pos.ready ? 'visible' : 'hidden',
            }}
          >
            <span className="citation-popover-number">{number}</span>
            {/* A <div>, not a <p>, so notes can hold rich content — images,
                links, multiple paragraphs. `note` accepts a string or any
                JSX. */}
            <div className="citation-popover-note">{note}</div>
            <button
              type="button"
              className="citation-popover-close"
              aria-label="Close note"
              onClick={() => setOpen(false)}
            >
              x
            </button>
          </div>,
          document.body
        )}
    </span>
  );
}

export default Citation;
