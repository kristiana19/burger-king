"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export default function ISpyGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const bgRef = useRef<HTMLImageElement | null>(null);
  const itemRef = useRef<HTMLImageElement | null>(null);

  // camera in image coordinates
  const camRef = useRef({ x: 0, y: 0 });

  // drag state
  const isDraggingRef = useRef(false);
  const lastPtrRef = useRef<Point | null>(null);
  const movedRef = useRef(false);

  // game state
  const [found, setFound] = useState(false);
  const [itemPos, setItemPos] = useState({ x: 0, y: 0 });
  //const capsuleRef = useRef<HTMLImageElement | null>(null);
  //const chestRef = useRef<HTMLImageElement | null>(null);

  const ITEM_SIZE = 90;

  useEffect(() => {
    // load background
    const bg = new Image();
    bg.src = "/background.webp";
    bg.onload = () => {
      bgRef.current = bg;
      resizeCanvasToDisplaySize();

      centerCamera();
      randomizeItemPosition();

      draw();
    };

    // load hidden item (crown)
    const item = new Image();
    item.src = "/crown.png";
    item.onload = () => {
      itemRef.current = item;
      draw();
    };

    /* const capsule = new Image();
    capsule.src = "/capsule.png";
    capsule.onload = () => {
        capsuleRef.current = capsule;
        draw();
    };

    const chest = new Image();
    chest.src = "/chest.png";
    chest.onload = () => {
        chestRef.current = chest;
        draw();
    }; */

  }, []);

  //const capsulePos = { x: 523, y: 2450 };
  //const chestPos = { x: 4800, y: 2534 };

  useEffect(() => {
    const handleResize = () => {
      resizeCanvasToDisplaySize();
      centerCamera(); // keep a nice starting view on resize
      draw();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

  }, []);

  //redraw canvas when game state changes (found / item position)
  useEffect(() => {
    draw();
  }, [found, itemPos]);

  function resizeCanvasToDisplaySize() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
  }

  function getViewportSize() {
    const canvas = canvasRef.current;
    if (!canvas) return { w: 0, h: 0, dpr: 1 };

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    return { w, h, dpr };
  }

  function centerCamera() {
    const bg = bgRef.current;
    if (!bg) return;

    const { w: viewW, h: viewH } = getViewportSize();

    const maxX = Math.max(0, bg.width - viewW);
    const maxY = Math.max(0, bg.height - viewH);

    camRef.current.x = clamp((bg.width - viewW) / 2, 0, maxX);
    camRef.current.y = clamp((bg.height - viewH) / 2, 0, maxY);
  }

  function randomizeItemPosition() {
    const bg = bgRef.current;
    if (!bg) return;

    const { w: viewW, h: viewH } = getViewportSize();

    const pad = 100;

    const minX = pad;
    const maxX = bg.width - ITEM_SIZE - pad;
    const minY = pad;
    const maxY = bg.height - ITEM_SIZE - pad;

    for (let i = 0; i < 100; i++) {
      const x = Math.floor(minX + Math.random() * (maxX - minX));
      const y = Math.floor(minY + Math.random() * (maxY - minY));

      const itemRight = x + ITEM_SIZE;
      const itemBottom = y + ITEM_SIZE;

      // avoid placing item inside the CURRENT start view (camera-based)
      const cam = camRef.current;
      const overlapsStartView =
        x < cam.x + viewW &&
        itemRight > cam.x &&
        y < cam.y + viewH &&
        itemBottom > cam.y;

      if (!overlapsStartView) {
        setItemPos({ x, y });
        return;
      }
    }

    // fallback
    setItemPos({ x: maxX, y: maxY });
  }

  function draw() {
    const canvas = canvasRef.current;
    const bg = bgRef.current;
    if (!canvas || !bg) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w: viewW, h: viewH, dpr } = getViewportSize();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewW, viewH);

    const cam = camRef.current;

    // clamp camera
    const maxX = Math.max(0, bg.width - viewW);
    const maxY = Math.max(0, bg.height - viewH);
    cam.x = clamp(cam.x, 0, maxX);
    cam.y = clamp(cam.y, 0, maxY);

    // background
    ctx.drawImage(bg, -cam.x, -cam.y);

    // hidden item
    const item = itemRef.current;
    if (item && !found) {
      const drawX = itemPos.x - cam.x;
      const drawY = itemPos.y - cam.y;
      ctx.drawImage(item, drawX, drawY, ITEM_SIZE, ITEM_SIZE);
    }

    // small hint UI
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(16, 16, 260, 38);
    ctx.fillStyle = "white";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Drag to pan • Tap the crown to win", 26, 40);

    /* const capsule = capsuleRef.current;
    if (capsule) {
        ctx.drawImage(
            capsule,
            capsulePos.x - cam.x,
            capsulePos.y - cam.y,
            140,
            140
        );
    }

    const chest = chestRef.current;
    if (chest) {
        ctx.drawImage(
            chest,
            chestPos.x - cam.x,
            chestPos.y - cam.y,
            140,
            140
        );
    } */
  }

  function canvasToImageCoords(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cam = camRef.current;
    return { imgX: cam.x + clickX, imgY: cam.y + clickY };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    movedRef.current = false;
    lastPtrRef.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDraggingRef.current) return;
    const last = lastPtrRef.current;
    if (!last) return;

    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;

    if (Math.abs(dx) + Math.abs(dy) > 2) movedRef.current = true;

    camRef.current.x -= dx;
    camRef.current.y -= dy;

    lastPtrRef.current = { x: e.clientX, y: e.clientY };
    draw();
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    try {
      (e.currentTarget as HTMLCanvasElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    isDraggingRef.current = false;
    lastPtrRef.current = null;

    // if it wasn't a drag, treat as a tap/click attempt
    if (!movedRef.current && !found) {
      const { imgX, imgY } = canvasToImageCoords(e);

      const hit =
        imgX >= itemPos.x &&
        imgX <= itemPos.x + ITEM_SIZE &&
        imgY >= itemPos.y &&
        imgY <= itemPos.y + ITEM_SIZE;

      if (hit) {
        setFound(true);
      }
    }
  }

  function reset() {
    setFound(false);
    centerCamera();
    randomizeItemPosition();
    draw();
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          display: "block",
          width: "100vw",
          height: "100vh",
          touchAction: "none",
          background: "#000",
          cursor: isDraggingRef.current ? "grabbing" : "grab",
        }}
      />

      {found && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 520,
              width: "100%",
              background: "#FFF4E6",
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
              color: "#5A1E0E",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 32 }}>You Found the King!</h2>
            <button
              onClick={reset}
              style={{
                marginTop: 16,
                padding: "12px 18px",
                fontSize: 16,
                fontWeight: 700,
                backgroundColor: "#D62300",
                border: "none",
                color: "white",
                cursor: "pointer",
                borderRadius: 10,
              }}
            >
              Play again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}