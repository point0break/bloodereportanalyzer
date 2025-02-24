    return (
        <section id="upload" className="container my-5" style={{ maxWidth: "600px" }}>
            <div className="card shadow-lg p-4 border-0 bg-light">
                <h2 className="text-center mb-4">Upload Your Blood Report</h2>
                <form onSubmit={handleFileUpload}>
                    <div className="mb-3">
                        <input
                            type="file"
                            className="form-control"
                            accept="image/png, image/jpeg"
                            onChange={(e) => {
                                const selectedFile = e.target.files[0];
                                setFile(selectedFile);
                                if (selectedFile && selectedFile.type.startsWith("image/")) {
                                    setPreview(URL.createObjectURL(selectedFile));
                                } else {
                                    setPreview(null);
                                }
                            }}
                        />
                    </div>
                    <button type="submit" className="btn btn-danger btn-sm w-100">Analyze</button>
                </form>
                {loading && <div className="text-center mt-3"><div className="spinner-border text-danger" role="status"></div></div>}
                {responseMessage && <div className="alert mt-3">{responseMessage}</div>}
                {preview && (
                    <button className="btn btn-secondary btn-sm mt-3" onClick={() => setShowModal(true)}>
                        Preview
                    </button>
                )}
            </div>
            {preview && showModal && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content bg-white text-black border-success">
                            <div className="modal-header">
                                <h5 className="modal-title text-center w-100">Report Preview</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body text-center">
                                <img src={preview} alt="Preview" className="img-fluid rounded shadow" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {extractedText && (
                <section className="container my-5">
                    <div className="card bg-light shadow-lg p-4">
                        <h3 className="text-center">Extracted Text</h3>
                        <pre className="p-3 border rounded bg-white">{extractedText}</pre>
                    </div>
                </section>
            )}
            {prediction && (
                <section className="container my-5">
                    <div className="card bg-light shadow-lg p-4">
                        <h3 className="text-center">Prediction Results</h3>
                        <div className={`alert ${prediction.status === "Safe" ? "alert-success" : "alert-warning"} shadow p-3`}>
                            <strong>Status:</strong> {prediction.status === "Safe" ? "✅ Safe" : "⚠️ Attention Needed"}
                        </div>
                        {prediction.recommendations && (
                            <div className="mt-3 p-3 bg-white border rounded">
                                <h5>Recommended Actions:</h5>
                                {Array.isArray(prediction.recommendations) ? (
                                    <ul>
                                        {prediction.recommendations.map((rec, index) => (
                                            <li key={index}>{rec}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>{prediction.recommendations}</p>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </section>
    );
}
