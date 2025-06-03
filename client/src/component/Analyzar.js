import React, { useState, forwardRef, useImperativeHandle } from 'react';

const Analyzer = forwardRef(({ onClose, setDisableClose }, ref) => {
    const [file, setFile] = useState(null);
    const [commonNames, setCommonNames] = useState([]);
    const [loading, setLoading] = useState(false);

    useImperativeHandle(ref, () => ({
        closeWithResult: () => {
            if (onClose) {
                onClose(commonNames);
            }
            return commonNames;
        },
    }));

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setDisableClose(true); // Disable close while analyzing

        setFile(selectedFile);
        setCommonNames([]);
        const formData = new FormData();
        formData.append('image', selectedFile);

        setLoading(true);
        try {
            const response = await fetch(process.env.REACT_APP_ADDRESS + '/analyze-logo', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            const names = (data.outputs || [])
                .flatMap(output => output.data.regions || [])
                .map(region => region.data.concepts?.[0]?.name)
                .filter(Boolean);
            setCommonNames((prev) => [...new Set([...prev, ...names])]);

            const response1 = await fetch(process.env.REACT_APP_ADDRESS + '/analyze', {
                method: 'POST',
                body: formData,
            });
            const data1 = await response1.json();
            const regions = data1.outputs?.[0]?.data?.concepts || [];
            const conceptNames = regions.map(region => region.name).filter(Boolean);
            const topNames = conceptNames.slice(0, 3);
            setCommonNames(prev => [...new Set([...prev, ...topNames])]);

            const response2 = await fetch(process.env.REACT_APP_ADDRESS + '/analyze-Text', {
                method: 'POST',
                body: formData,
            });
            const data2 = await response2.json();
            const extractedText = (data2.outputs?.[0]?.data?.regions || [])
                .map(region => region.data?.text?.raw)
                .filter(Boolean);
            setCommonNames(prev => [...new Set([...prev, ...extractedText])]);
        } catch (error) {
            console.error(error);
            alert('Error analyzing image');
        } finally {
            setLoading(false);
            setDisableClose(false); // Re-enable close
        }
    };

    return (
        <div className="container mt-3">
            <h5>Logo & Text Analyzer</h5>

            <div style={{ width: '100%' }}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="form-control form-control-sm mb-3"
                />
            </div>

            {file && (
                <div className="mb-3">
                    <h6>Selected Image Preview:</h6>
                    <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="img-fluid border rounded"
                        style={{ maxHeight: '250px' }}
                    />
                </div>
            )}

            <button
                className="btn btn-success"
                onClick={() => onClose && onClose(commonNames)}
                disabled={loading}
            >
                {loading ? 'Analyzing...' : 'Close & Return Data'}
            </button>
        </div>
    );
});

export default Analyzer;
