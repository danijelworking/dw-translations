import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ExistingKeysModal = ({ existingKeys, onConfirm, onCancel }) => {
    const [overwriteAll, setOverwriteAll] = useState(false);
    const [overwriteKeys, setOverwriteKeys] = useState(new Set());

    const handleKeyChange = (key) => {
        setOverwriteKeys((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const handleConfirm = () => {
        const finalKeysToOverwrite = overwriteAll ? existingKeys : [...overwriteKeys];
        onConfirm(finalKeysToOverwrite);
    };

    return (
        <Modal show={true}>
            <Modal.Header>
                <Modal.Title>Bereits vorhandene Keys</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={overwriteAll}
                            onChange={() => setOverwriteAll(!overwriteAll)}
                        />
                        Alle überschreiben
                    </label>
                </div>
                <ul>
                    {existingKeys.map((key) => (
                        <li key={key}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={overwriteKeys.has(key)}
                                    onChange={() => handleKeyChange(key)}
                                    disabled={overwriteAll} // Deaktiviert, wenn "Alle überschreiben" aktiviert ist
                                />
                                {key}
                            </label>
                        </li>
                    ))}
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Abbrechen
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Bestätigen
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ExistingKeysModal;
