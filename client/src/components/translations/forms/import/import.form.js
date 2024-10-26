import React from 'react';
import Form from 'react-bootstrap/Form';

const ImportForm = ({ onFileChange, error }) => {

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        onFileChange(selectedFile);
    };

    return (
        <Form>
            <Form.Group controlId="formFile">
                <Form.Label>Upload your CSV or JSON file</Form.Label>
                <Form.Control
                    type="file"
                    accept=".csv, .json"
                    onChange={handleFileChange}
                />
                {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
            </Form.Group>
        </Form>
    );
};

export default ImportForm;
