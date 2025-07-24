import React, { useCallback, useEffect, useRef, useState } from "react";

interface SignatureCanvasProps {
    width?: number;
    height?: number;
    initialStrokeColor?: string;
    initialStrokeWidth?: number;
    backgroundColor?: string;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
    width = 500,
    height = 300,
    initialStrokeColor = "#000000",
    initialStrokeWidth = 2,
    backgroundColor = "transparent",
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isMouseOutsideCanvasRef = useRef(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(
        null
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const currentContext = canvas.getContext("2d");
            if (currentContext) {
                setContext(currentContext);
                currentContext.strokeStyle = initialStrokeColor;
                currentContext.lineWidth = initialStrokeWidth;
                currentContext.lineJoin = "round";
                currentContext.lineCap = "round";
            }
        }
    }, [initialStrokeColor, initialStrokeWidth]);

    const getCanvasCoordinates = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };

            let clientX: number, clientY: number;
            if (event.nativeEvent instanceof MouseEvent) {
                // MouseEvent
                clientX = event.nativeEvent.clientX;
                clientY = event.nativeEvent.clientY;
            } else {
                // TouchEvent
                clientX = event.nativeEvent.touches[0].clientX;
                clientY = event.nativeEvent.touches[0].clientY;
            }

            const { left, top } = canvas.getBoundingClientRect();
            const x: number = clientX - left;
            const y: number = clientY - top;
            return { x, y };
        },
        []
    );

    const startDrawing = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            if (!context) {
                return;
            }
            setIsDrawing(true);
            isMouseOutsideCanvasRef.current = false;
            const { x, y } = getCanvasCoordinates(event);
            context.beginPath();
            context.moveTo(x, y);
        },
        [context, getCanvasCoordinates]
    );

    const draw = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            if (!isDrawing || !context || isMouseOutsideCanvasRef.current) {
                return;
            }
            const { x, y } = getCanvasCoordinates(event);
            context.lineTo(x, y);
            context.stroke();
        },
        [isDrawing, context, getCanvasCoordinates]
    );
    
    const handleMouseLeave = useCallback(() => {
        if (isDrawing) {
            isMouseOutsideCanvasRef.current = true;
        }
    }, [isDrawing]);

    const handleMouseEnter = useCallback((event: React.MouseEvent) => {
        if (isDrawing && isMouseOutsideCanvasRef.current) {
            isMouseOutsideCanvasRef.current = false;
            const { x, y } = getCanvasCoordinates(event);
            context?.beginPath();
            context?.moveTo(x, y);
        }
    }, [isDrawing, context, getCanvasCoordinates]);
    
    const stopDrawing = useCallback(() => {
        if (!context) {
            return;
        }
        setIsDrawing(false);
        context.closePath();
        isMouseOutsideCanvasRef.current = false;
    }, [context]);

    useEffect(() => {
        window.addEventListener("mouseup", stopDrawing);
        window.addEventListener("touchend", stopDrawing);
        window.addEventListener("touchcancel", stopDrawing);

        return () => {
            window.removeEventListener("mouseup", stopDrawing);
            window.removeEventListener("touchend", stopDrawing);
            window.removeEventListener("touchcancel", stopDrawing);
        };
    }, [stopDrawing]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border border-gray-300 shadow-md"
            style={{
                backgroundColor: backgroundColor,
                touchAction: "none",
            }}
            // Mouse
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            // Touch
            onTouchStart={startDrawing}
            onTouchMove={draw}
        />
    );
};

export default SignatureCanvas;
