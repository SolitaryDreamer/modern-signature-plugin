const SaveAsImage = (
    canvasElement: HTMLCanvasElement | null,
    format: "image/png" | "image/jpeg",
    quality: number = 0.9
): string | undefined => {
    if (!canvasElement) {
        console.error("Canvas element not found.");
        return undefined;
    }
    return canvasElement.toDataURL(format, quality);
};

export default SaveAsImage; 