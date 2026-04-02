"use client";

import { useEffect, useRef } from "react";

type FuzzyDirection = "horizontal" | "vertical" | "both";

type FuzzyTextProps = {
  children: string;
  fontSize?: number | string;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  enableHover?: boolean;
  baseIntensity?: number;
  hoverIntensity?: number;
  fuzzRange?: number;
  fps?: number;
  direction?: FuzzyDirection;
  transitionDuration?: number;
  clickEffect?: boolean;
  glitchMode?: boolean;
  glitchInterval?: number;
  glitchDuration?: number;
  gradient?: string[] | null;
  letterSpacing?: number;
  className?: string;
};

type FuzzyCanvas = HTMLCanvasElement & {
  cleanupFuzzyText?: () => void;
};

export default function FuzzyText({
  baseIntensity = 0.18,
  children,
  className = "",
  clickEffect = false,
  color = "#fff",
  direction = "horizontal",
  enableHover = true,
  fontFamily = "inherit",
  fontSize = "clamp(2rem, 10vw, 10rem)",
  fontWeight = 900,
  fps = 60,
  fuzzRange = 30,
  glitchDuration = 200,
  glitchInterval = 2000,
  glitchMode = false,
  gradient = null,
  hoverIntensity = 0.5,
  letterSpacing = 0,
  transitionDuration = 0,
}: FuzzyTextProps) {
  const canvasRef = useRef<FuzzyCanvas | null>(null);

  useEffect(() => {
    let animationFrameId: number | undefined;
    let glitchTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let glitchEndTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let clickTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let isCancelled = false;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = async () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const computedFontFamily =
        fontFamily === "inherit"
          ? window.getComputedStyle(canvas).fontFamily || "sans-serif"
          : fontFamily;

      const fontSizeStr = typeof fontSize === "number" ? `${fontSize}px` : fontSize;
      const fontString = `${fontWeight} ${fontSizeStr} ${computedFontFamily}`;

      try {
        await document.fonts.load(fontString);
      } catch {
        await document.fonts.ready;
      }
      if (isCancelled) return;

      let numericFontSize: number;
      if (typeof fontSize === "number") {
        numericFontSize = fontSize;
      } else {
        const temp = document.createElement("span");
        temp.style.fontSize = fontSize;
        document.body.appendChild(temp);
        const computedSize = window.getComputedStyle(temp).fontSize;
        numericFontSize = Number.parseFloat(computedSize);
        document.body.removeChild(temp);
      }

      const text = children;
      const offscreen = document.createElement("canvas");
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      offCtx.font = `${fontWeight} ${fontSizeStr} ${computedFontFamily}`;
      offCtx.textBaseline = "alphabetic";

      let totalWidth = 0;
      if (letterSpacing !== 0) {
        for (const char of text) {
          totalWidth += offCtx.measureText(char).width + letterSpacing;
        }
        totalWidth -= letterSpacing;
      } else {
        totalWidth = offCtx.measureText(text).width;
      }

      const metrics = offCtx.measureText(text);
      const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
      const actualRight =
        letterSpacing !== 0 ? totalWidth : (metrics.actualBoundingBoxRight ?? metrics.width);
      const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
      const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;

      const textBoundingWidth = Math.ceil(
        letterSpacing !== 0 ? totalWidth : actualLeft + actualRight,
      );
      const tightHeight = Math.ceil(actualAscent + actualDescent);
      const extraWidthBuffer = 10;
      const offscreenWidth = textBoundingWidth + extraWidthBuffer;

      offscreen.width = offscreenWidth;
      offscreen.height = tightHeight;

      const xOffset = extraWidthBuffer / 2;
      offCtx.font = `${fontWeight} ${fontSizeStr} ${computedFontFamily}`;
      offCtx.textBaseline = "alphabetic";

      if (gradient && Array.isArray(gradient) && gradient.length >= 2) {
        const grad = offCtx.createLinearGradient(0, 0, offscreenWidth, 0);
        gradient.forEach((shade, index) =>
          grad.addColorStop(index / (gradient.length - 1), shade),
        );
        offCtx.fillStyle = grad;
      } else {
        offCtx.fillStyle = color;
      }

      if (letterSpacing !== 0) {
        let xPos = xOffset;
        for (const char of text) {
          offCtx.fillText(char, xPos, actualAscent);
          xPos += offCtx.measureText(char).width + letterSpacing;
        }
      } else {
        offCtx.fillText(text, xOffset - actualLeft, actualAscent);
      }

      const horizontalMargin = fuzzRange + 20;
      const verticalMargin = 0;
      canvas.width = offscreenWidth + horizontalMargin * 2;
      canvas.height = tightHeight + verticalMargin * 2;
      ctx.translate(horizontalMargin, verticalMargin);

      const interactiveLeft = horizontalMargin + xOffset;
      const interactiveTop = verticalMargin;
      const interactiveRight = interactiveLeft + textBoundingWidth;
      const interactiveBottom = interactiveTop + tightHeight;

      let isHovering = false;
      let isClicking = false;
      let isGlitching = false;
      let currentIntensity = baseIntensity;
      let targetIntensity = baseIntensity;
      let lastFrameTime = 0;
      const frameDuration = 1000 / fps;

      const startGlitchLoop = () => {
        if (!glitchMode || isCancelled) return;
        glitchTimeoutId = setTimeout(() => {
          if (isCancelled) return;
          isGlitching = true;
          glitchEndTimeoutId = setTimeout(() => {
            isGlitching = false;
            startGlitchLoop();
          }, glitchDuration);
        }, glitchInterval);
      };

      if (glitchMode) startGlitchLoop();

      const run = (timestamp: number) => {
        if (isCancelled) return;

        if (timestamp - lastFrameTime < frameDuration) {
          animationFrameId = window.requestAnimationFrame(run);
          return;
        }
        lastFrameTime = timestamp;

        ctx.clearRect(
          -fuzzRange - 20,
          -fuzzRange - 10,
          offscreenWidth + 2 * (fuzzRange + 20),
          tightHeight + 2 * (fuzzRange + 10),
        );

        if (isClicking || isGlitching) {
          targetIntensity = 1;
        } else if (isHovering) {
          targetIntensity = hoverIntensity;
        } else {
          targetIntensity = baseIntensity;
        }

        if (transitionDuration > 0) {
          const step = 1 / (transitionDuration / frameDuration);
          if (currentIntensity < targetIntensity) {
            currentIntensity = Math.min(currentIntensity + step, targetIntensity);
          } else if (currentIntensity > targetIntensity) {
            currentIntensity = Math.max(currentIntensity - step, targetIntensity);
          }
        } else {
          currentIntensity = targetIntensity;
        }

        if (direction === "horizontal") {
          for (let row = 0; row < tightHeight; row += 1) {
            const dx = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange);
            ctx.drawImage(offscreen, 0, row, offscreenWidth, 1, dx, row, offscreenWidth, 1);
          }
        } else if (direction === "vertical") {
          for (let column = 0; column < offscreenWidth; column += 1) {
            const dy = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange);
            ctx.drawImage(offscreen, column, 0, 1, tightHeight, column, dy, 1, tightHeight);
          }
        } else {
          for (let row = 0; row < tightHeight; row += 1) {
            const dx = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange);
            ctx.drawImage(offscreen, 0, row, offscreenWidth, 1, dx, row, offscreenWidth, 1);
          }

          const tempData = ctx.getImageData(0, 0, offscreenWidth + fuzzRange, tightHeight + fuzzRange);
          ctx.clearRect(
            -fuzzRange - 20,
            -fuzzRange - 10,
            offscreenWidth + 2 * (fuzzRange + 20),
            tightHeight + 2 * (fuzzRange + 10),
          );
          ctx.putImageData(tempData, 0, 0);

          for (let column = 0; column < offscreenWidth + fuzzRange; column += 1) {
            const dy = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange * 0.5);
            const colData = ctx.getImageData(column, 0, 1, tightHeight + fuzzRange);
            ctx.clearRect(column, -fuzzRange, 1, tightHeight + 2 * fuzzRange);
            ctx.putImageData(colData, column, dy);
          }
        }

        animationFrameId = window.requestAnimationFrame(run);
      };

      animationFrameId = window.requestAnimationFrame(run);

      const isInsideTextArea = (x: number, y: number) =>
        x >= interactiveLeft &&
        x <= interactiveRight &&
        y >= interactiveTop &&
        y <= interactiveBottom;

      const handleMouseMove = (event: MouseEvent) => {
        if (!enableHover) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        isHovering = isInsideTextArea(x, y);
      };

      const handleMouseLeave = () => {
        isHovering = false;
      };

      const handleClick = () => {
        if (!clickEffect) return;
        isClicking = true;
        if (clickTimeoutId) clearTimeout(clickTimeoutId);
        clickTimeoutId = setTimeout(() => {
          isClicking = false;
        }, 150);
      };

      const handleTouchMove = (event: TouchEvent) => {
        if (!enableHover) return;
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        if (!touch) return;
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        isHovering = isInsideTextArea(x, y);
      };

      const handleTouchEnd = () => {
        isHovering = false;
      };

      if (enableHover) {
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);
        canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
        canvas.addEventListener("touchend", handleTouchEnd);
      }

      if (clickEffect) {
        canvas.addEventListener("click", handleClick);
      }

      const cleanup = () => {
        if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
        if (glitchTimeoutId) clearTimeout(glitchTimeoutId);
        if (glitchEndTimeoutId) clearTimeout(glitchEndTimeoutId);
        if (clickTimeoutId) clearTimeout(clickTimeoutId);
        if (enableHover) {
          canvas.removeEventListener("mousemove", handleMouseMove);
          canvas.removeEventListener("mouseleave", handleMouseLeave);
          canvas.removeEventListener("touchmove", handleTouchMove);
          canvas.removeEventListener("touchend", handleTouchEnd);
        }
        if (clickEffect) {
          canvas.removeEventListener("click", handleClick);
        }
      };

      canvas.cleanupFuzzyText = cleanup;
    };

    void init();

    return () => {
      isCancelled = true;
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      if (glitchTimeoutId) clearTimeout(glitchTimeoutId);
      if (glitchEndTimeoutId) clearTimeout(glitchEndTimeoutId);
      if (clickTimeoutId) clearTimeout(clickTimeoutId);
      canvas.cleanupFuzzyText?.();
    };
  }, [
    baseIntensity,
    children,
    clickEffect,
    color,
    direction,
    enableHover,
    fontFamily,
    fontSize,
    fontWeight,
    fps,
    fuzzRange,
    glitchDuration,
    glitchInterval,
    glitchMode,
    gradient,
    hoverIntensity,
    letterSpacing,
    transitionDuration,
  ]);

  return <canvas aria-label={children} className={className} ref={canvasRef} role="img" />;
}
