(function () {
  "use strict";
  /**
   * Whether overlay should be pinned to top of the page when script starts
   * Defaults to presence of `data-start-open` flag on script tag.
   */
  let startOpen =
    document.currentScript &&
    document.currentScript.hasAttribute("data-start-open");

  /** Minimal duration to consider a press long */
  const LONG_PRESS_MS = 500;
  /**
   * Offset in pixels (to display overlay above/below finger/touch position).
   * Can be negative.
   */
  const OVERLAY_OFFSET = 200;

  document.addEventListener("DOMContentLoaded", () => {
    const placeholder = document.createElement("div");
    placeholder.style.height = startOpen ? "60px" : "0";
    document.body.prepend(placeholder);

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      display: startOpen ? "block" : "none",
      position: "relative",
      width: "100vw",
      height: "60px",
      left: "0",
      top: "0",
      zIndex: "9999",
    });
    placeholder.appendChild(overlay);

    const timeline = document.createElement("div");
    Object.assign(timeline.style, {
      position: "relative",
      width: "100%",
      height: "100%",
    });
    overlay.appendChild(timeline);

    function moveOverlay(x, y) {
      Object.assign(overlay.style, {
        position: "fixed",
        display: "block",
        top: `${y - overlay.offsetHeight / 2 - OVERLAY_OFFSET}px`,
      });
    }

    // get document position %
    function getPercent(el) {
      const rect = el.getBoundingClientRect();
      const scrollTop = rect.top;
      const docHeight = document.documentElement.scrollHeight;
      return scrollTop / docHeight;
    }

    // render headings + hr markers
    function renderTimeline(currentY = 0) {
      timeline.innerHTML = "";

      const items = document.querySelectorAll("h1,h2,h3,h4,h5,h6,hr");

      items.forEach(el => {
        const percent = getPercent(el);

        const marker = document.createElement("div");
        Object.assign(marker.style, {
          position: "absolute",
          left: `${percent * 100}%`,
          bottom: "12px",
          transform: "translateX(-50%)",
          backgroundColor: "var(--md-sys-color-on-tertiary, white)",
          border: "2px solid var(--md-sys-color-tertiary, black)",
        });

        if (el.tagName === "HR") {
          Object.assign(marker.style, {
            width: "2px",
            height: "18px",
            borderRadius: "4px",
          });
        } else {
          const level = parseInt(el.tagName.slice(1));

          Object.assign(marker.style, {
            width: `${12 - level}px`,
            height: `${12 - level}px`,
            borderRadius: "50%",
          });

          const label = document.createElement("div");
          label.textContent = el.textContent;

          Object.assign(label.style, {
            textIndent: "1.5em",
            position: "absolute",
            paddingLeft: "2px",
            fontSize: "10px",
            fontWeight: "700",
            color: "var(--md-sys-color-on-tertiary, white)",
            transformOrigin: "bottom left",
            transform: "rotate(-45deg)",
            whiteSpace: "nowrap",
            //stroke
            webkitTextStroke: "2px transparent", //stroke width
            backgroundColor: "var(--md-sys-color-tertiary, black)", //stroke color
            backgroundClip: "text", //apply stroke
          });

          marker.appendChild(label);
        }

        timeline.appendChild(marker);
      });

      // mark current position
      const currentPos = document.createElement("div");
      currentPos.textContent = "👁️";
      Object.assign(currentPos.style, {
        fontSize: "16px",
        textIndent: 0,
        position: "absolute",
        bottom: "10px",
        left: `${currentY * 100}%`,
        transform: "translateX(-50%)",
      });

      timeline.appendChild(currentPos);
    }

    startOpen && setTimeout(renderTimeline, 100); // wait for other scripts to modify DOM (fix for AnyWeb extension)

    // Handle touch interactions
    let pressTimer = null;

    function handleTouchCancelled() {
      clearTimeout(pressTimer);
      overlay.style.display = "none";
    }

    document.addEventListener("touchstart", e => {
      pressTimer = setTimeout(() => {
        const touch = e.touches[0];
        moveOverlay(touch.clientX, touch.clientY);
        const percent = touch.clientY / document.documentElement.scrollHeight;
        renderTimeline(percent);
      }, LONG_PRESS_MS);
    });

    document.addEventListener("touchend", handleTouchCancelled);
    document.addEventListener("touchcancel", handleTouchCancelled);
  });
})();
