import { useCallback, useRef, useState, useEffect } from "react";
import SignatureCanvas from "./SignatureCanvas";
import SaveAsImage from "./SaveAsImage";
import type { CanvasRef } from "./SignatureCanvas";

interface SignaturePadProps {
    width?: number;
    height?: number;
    initialStrokeColor?: string;
    initialStrokeWidth?: number;
    backgroundColor?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
    width = 500,
    height = 300,
    initialStrokeColor = "#000000",
    initialStrokeWidth = 2,
    backgroundColor = "transparent",
}) => {
    const signatureCanvasRef = useRef<CanvasRef>(null);

    const [strokeColor, setStrokeColor] = useState(initialStrokeColor);
    const [strokeWidth, setStrokeWidth] = useState(initialStrokeWidth);
    const [currentBackgroundColor, setCurrentBackgroundColor] =
        useState(backgroundColor);
    const [hasSigned, setHasSigned] = useState(false);

    const handleSignatureChange = useCallback((signed: boolean) => {
        setHasSigned(signed);
    }, []);

    const handleSavePNG = useCallback(() => {
        const canvasElement = signatureCanvasRef.current?.getCanvas();
        if (canvasElement) {
            const dataUrl = SaveAsImage(canvasElement, "image/png");
            if (dataUrl) {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = "signature.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }, []);

    const handleSaveJPG = useCallback(() => {
        const canvasElement = signatureCanvasRef.current?.getCanvas();
        if (canvasElement) {
            const dataUrl = SaveAsImage(canvasElement, "image/jpeg", 1.0);
            if (dataUrl) {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = "signature.jpg";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }, []);

    useEffect(() => {
        if (signatureCanvasRef.current) {
            signatureCanvasRef.current.setStrokeColor(strokeColor);
        }
    }, [strokeColor]);

    useEffect(() => {
        if (signatureCanvasRef.current) {
            signatureCanvasRef.current.setStrokeWidth(strokeWidth);
        }
    }, [strokeWidth]);

    return (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                请在下方区域签名
            </h2>
            <SignatureCanvas
                ref={signatureCanvasRef}
                width={width}
                height={height}
                initialStrokeColor={strokeColor}
                initialStrokeWidth={strokeWidth}
                backgroundColor={currentBackgroundColor}
                onSignatureChange={handleSignatureChange}
            />

            <div className="mt-4 flex flex-wrap gap-3 items-center justify-center">
                {/* 颜色选择器 */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="strokeColor" className="text-gray-700">
                        笔触颜色:
                    </label>
                    <input
                        type="color"
                        id="strokeColor"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="w-10 h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                </div>

                {/* 笔触粗细 */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="strokeWidth" className="text-gray-700">
                        笔触粗细:
                    </label>
                    <input
                        type="range"
                        id="strokeWidth"
                        min="1"
                        max="10"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="w-24 h-2 rounded-lg appearance-none cursor-pointer bg-gray-300"
                        style={{
                            backgroundImage: `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${
                                ((strokeWidth - 1) / 9) * 100
                            }%, #ccc ${
                                ((strokeWidth - 1) / 9) * 100
                            }%, #ccc 100%)`,
                        }}
                    />
                    <span className="text-gray-700 text-sm">
                        {strokeWidth}px
                    </span>
                </div>

                {/* 背景颜色 */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="backgroundColor" className="text-gray-700">
                        背景颜色:
                    </label>
                    <select
                        id="backgroundColor"
                        value={currentBackgroundColor}
                        onChange={(e) =>
                            setCurrentBackgroundColor(e.target.value)
                        }
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="transparent">透明</option>
                        <option value="#FFFFFF">白色</option>
                        <option value="#F0F0F0">浅灰</option>
                    </select>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => signatureCanvasRef.current?.clear()}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
                    disabled={!hasSigned} // 只有当有签名时才可操作
                >
                    清空
                </button>
                <button
                    type="button"
                    onClick={() => signatureCanvasRef.current?.undo()}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors shadow-sm disabled:opacity-50"
                    disabled={!hasSigned} 
                >
                    撤销
                </button>
                <button
                    type="button"
                    onClick={handleSavePNG}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
                    disabled={!hasSigned}
                >
                    保存为 PNG
                </button>
                <button
                    type="button"
                    onClick={handleSaveJPG}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
                    disabled={!hasSigned}
                >
                    保存为 JPG
                </button>
            </div>
        </div>
    );
};

export default SignaturePad;
