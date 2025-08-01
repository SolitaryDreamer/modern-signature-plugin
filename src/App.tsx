import SignaturePad from "./SignaturePad";

function App() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-6">手写签名插件</h1>
            <SignaturePad
                width={600}
                height={400}
                initialStrokeColor="#333333"
                initialStrokeWidth={3}
                backgroundColor="#f0f0f0"
            />
        </div>
    );
}

export default App;
