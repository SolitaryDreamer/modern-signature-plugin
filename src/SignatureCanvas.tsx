import {
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

interface SignatureCanvasProps {
  width?: number;
  height?: number;
  initialStrokeColor?: string;
  initialStrokeWidth?: number;
  backgroundColor?: string;
  clearCanvasRef?: React.RefObject<(() => void) | undefined>;
  undoCanvasRef?: React.RefObject<(() => void) | undefined>;
  onSignatureChange?: (hasSigned: boolean) => void;
}

export type CanvasRef = {
  getCanvas: () => HTMLCanvasElement | null;
  clear: () => void;
  undo: () => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
};

type Point = { x: number; y: number };
type Stroke = Point[];

const SignatureCanvas = forwardRef<CanvasRef, SignatureCanvasProps>(
  (
    {
      width = 500,
      height = 300,
      initialStrokeColor = "#000000",
      initialStrokeWidth = 2,
      backgroundColor = "transparent",
      clearCanvasRef,
      undoCanvasRef,
      onSignatureChange,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    // 初始化 canvas 上下文
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = initialStrokeColor;
      ctx.lineWidth = initialStrokeWidth;
      // 填充背景
      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      setContext(ctx);
    }, [width, height, backgroundColor, initialStrokeColor, initialStrokeWidth]);

    // 更新笔触样式
    useEffect(() => {
      if (context) {
        context.strokeStyle = initialStrokeColor;
        context.lineWidth = initialStrokeWidth;
      }
    }, [context, initialStrokeColor, initialStrokeWidth]);

    // 获取鼠标位置
    const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX =
        "touches" in e.nativeEvent
          ? e.nativeEvent.touches[0].clientX
          : e.nativeEvent.clientX;
      const clientY =
        "touches" in e.nativeEvent
          ? e.nativeEvent.touches[0].clientY
          : e.nativeEvent.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    }, []);

    // 开始绘制
    const startDrawing = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        if (!context) return;
        const pos = getPos(e);
        setStrokes((prev) => [...prev, [pos]]);
        setIsDrawing(true);
        onSignatureChange?.(true);
      },
      [context, getPos, onSignatureChange]
    );

    // 绘制中
    const draw = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !context) return;
        const pos = getPos(e);
        setStrokes((prev) => {
          const newStrokes = [...prev];
          newStrokes[newStrokes.length - 1].push(pos);
          return newStrokes;
        });
      },
      [isDrawing, context, getPos]
    );

    // 停止绘制
    const stopDrawing = useCallback(() => {
      setIsDrawing(false);
    }, []);

    // 监听全局鼠标抬起/触屏结束
    useEffect(() => {
      window.addEventListener("mouseup", stopDrawing);
      window.addEventListener("touchend", stopDrawing);
      return () => {
        window.removeEventListener("mouseup", stopDrawing);
        window.removeEventListener("touchend", stopDrawing);
      };
    }, [stopDrawing]);

    // 监听 strokes 变化，重绘整张画布
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = context;
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      // 重画每一笔
      ctx.beginPath();
      strokes.forEach((stroke) => {
        if (stroke.length < 2) return;
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
      });
      ctx.stroke();
    }, [strokes, context, backgroundColor]);

    // 清空画布
    const clear = useCallback(() => {
      setStrokes([]);
      onSignatureChange?.(false);
    }, [onSignatureChange]);

    // 撤销上一步
    const undo = useCallback(() => {
      setStrokes((prev) => prev.slice(0, -1));
      onSignatureChange?.(strokes.length - 1 > 0);
    }, [strokes.length, onSignatureChange]);

    // 暴露给父组件
    useImperativeHandle(
      ref,
      () => ({
        getCanvas: () => canvasRef.current,
        clear,
        undo,
        setStrokeColor: (c) => {
          if (context) context.strokeStyle = c;
        },
        setStrokeWidth: (w) => {
          if (context) context.lineWidth = w;
        },
      }),
      [clear, undo, context]
    );

    // 把 clear/undo 传到外部 ref
    useEffect(() => {
      if (clearCanvasRef) clearCanvasRef.current = clear;
      if (undoCanvasRef) undoCanvasRef.current = undo;
    }, [clearCanvasRef, undoCanvasRef, clear, undo]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 shadow-md"
        style={{ touchAction: "none", backgroundColor }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchMove={(e) => {
          e.preventDefault();
          draw(e);
        }}
      />
    );
  }
);

export default SignatureCanvas;
