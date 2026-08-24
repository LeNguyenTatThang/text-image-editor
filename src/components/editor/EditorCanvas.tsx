"use client";

import { useRef, useEffect } from "react";
import * as fabric from "fabric";
import { useEditorStore } from "@/store/editor.store";

export default function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const image = useEditorStore((s) => s.present.image);
  const textItems = useEditorStore((s) => s.present.textItems);
  const selectedTextId = useEditorStore((s) => s.present.selectedTextId);
  const selectText = useEditorStore((s) => s.selectText);
  const updateText = useEditorStore((s) => s.updateText);

  const textObjectMap = useRef<Map<string, fabric.FabricText>>(new Map());

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: "#1a1a1a",
    });
    fabricRef.current = canvas;

    const ro = new ResizeObserver(() => {
      if (!container || !fabricRef.current) return;
      fabricRef.current.setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
      fabricRef.current.renderAll();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const onSelect = (e: { selected?: fabric.FabricObject[] }) => {
      const obj = e.selected?.[0];
      if (obj && obj instanceof fabric.FabricText) {
        for (const [id, txt] of textObjectMap.current.entries()) {
          if (txt === obj) {
            selectText(id);
            return;
          }
        }
      }
    };

    const onDeselect = () => {
      selectText(null);
    };

    canvas.on("selection:created", onSelect);
    canvas.on("selection:updated", onSelect);
    canvas.on("selection:cleared", onDeselect);

    return () => {
      canvas.off("selection:created", onSelect);
      canvas.off("selection:updated", onSelect);
      canvas.off("selection:cleared", onDeselect);
    };
  }, [selectText]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const onModified = (e: { target?: fabric.FabricObject }) => {
      const obj = e.target;
      if (obj && obj instanceof fabric.FabricText) {
        for (const [id, txt] of textObjectMap.current.entries()) {
          if (txt === obj) {
            updateText(id, {
              x: obj.left ?? 0,
              y: obj.top ?? 0,
              rotation: obj.angle ?? 0,
            });
            return;
          }
        }
      }
    };

    canvas.on("object:modified", onModified);

    return () => {
      canvas.off("object:modified", onModified);
    };
  }, [updateText]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects().filter((o) => o instanceof fabric.FabricImage);
    objects.forEach((o) => canvas.remove(o));

    if (image) {
      const imgEl = new Image();
      imgEl.onload = () => {
        const fabricImg = new fabric.FabricImage(imgEl, {
          selectable: false,
          evented: false,
        });
        fabricImg.hoverCursor = "default";

        const cw = canvas.width ?? 800;
        const ch = canvas.height ?? 600;
        const scale = Math.min(cw / imgEl.width, ch / imgEl.height);
        fabricImg.scale(scale);
        fabricImg.set({
          left: (cw - imgEl.width * scale) / 2,
          top: (ch - imgEl.height * scale) / 2,
        });

        canvas.add(fabricImg);
        canvas.sendObjectToBack(fabricImg);
        canvas.renderAll();
      };
      imgEl.src = image;
    }
  }, [image]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const existingIds = new Set(textItems.map((t) => t.id));

    for (const [id, obj] of textObjectMap.current.entries()) {
      if (!existingIds.has(id)) {
        canvas.remove(obj);
        textObjectMap.current.delete(id);
      }
    }

    for (const item of textItems) {
      const existing = textObjectMap.current.get(item.id);
      if (existing) {
        existing.set({
          left: item.x,
          top: item.y,
          angle: item.rotation,
          fontFamily: item.style.fontFamily,
          fontSize: item.style.fontSize,
          fontWeight: item.style.fontWeight,
          fontStyle: item.style.fontStyle === "italic" ? "italic" : "normal",
          fill: item.style.color,
          textAlign: item.style.textAlign,
          charSpacing: item.style.letterSpacing * 10,
          lineHeight: item.style.lineHeight,
          opacity: item.style.opacity,
        });

        if (item.style.shadow) {
          existing.shadow = new fabric.Shadow({
            color: item.style.shadow.color,
            blur: item.style.shadow.blur,
            offsetX: item.style.shadow.offsetX,
            offsetY: item.style.shadow.offsetY,
          });
        } else {
          existing.shadow = null;
        }

        if (item.style.stroke) {
          existing.set({
            stroke: item.style.stroke.color,
            strokeWidth: item.style.stroke.width,
          });
        } else {
          existing.set({ stroke: null, strokeWidth: 0 });
        }

        existing.set("text", item.newText || " ");
      } else {
        const shadow = item.style.shadow
          ? new fabric.Shadow({
              color: item.style.shadow.color,
              blur: item.style.shadow.blur,
              offsetX: item.style.shadow.offsetX,
              offsetY: item.style.shadow.offsetY,
            })
          : undefined;

        const txt = new fabric.FabricText(item.newText || " ", {
          left: item.x,
          top: item.y,
          angle: item.rotation,
          fontFamily: item.style.fontFamily,
          fontSize: item.style.fontSize,
          fontWeight: item.style.fontWeight,
          fontStyle: item.style.fontStyle === "italic" ? "italic" : "normal",
          fill: item.style.color,
          textAlign: item.style.textAlign,
          charSpacing: item.style.letterSpacing * 10,
          lineHeight: item.style.lineHeight,
          opacity: item.style.opacity,
          shadow,
          stroke: item.style.stroke?.color,
          strokeWidth: item.style.stroke?.width,
          selectable: true,
          hasControls: true,
          borderColor: "#3b82f6",
          cornerColor: "#3b82f6",
          cornerSize: 10,
        });
        textObjectMap.current.set(item.id, txt);
        canvas.add(txt);
      }
    }

    if (selectedTextId) {
      const selObj = textObjectMap.current.get(selectedTextId);
      if (selObj) {
        canvas.setActiveObject(selObj);
      }
    } else {
      canvas.discardActiveObject();
    }

    canvas.renderAll();
  }, [textItems, selectedTextId]);

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden bg-zinc-900">
      <canvas ref={canvasRef} />
    </div>
  );
}
