import React, { useState, useEffect, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaFileImport } from "react-icons/fa6";
import { importTranslations } from "../../../services/TranslationsService";
import { danger, success, info } from "../../toast/DwToastHelper";
import { TranslationsContext } from "../DwTranslations";
import Papa from 'papaparse'; // Importiere PapaParse

function Import(props) {
    const state = useContext(TranslationsContext);
    const [file, setFile] = useState(null);
    const [client] = useState('DW001'); // Beispiel für einen festen Client

    const handleClose = () => props.setShow(false);

    useEffect(() => {
        if (props.show) {
            setFile(null); // Datei zurücksetzen, wenn Modal neu geöffnet wird
        }
    }, [props.show]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && (selectedFile.type === "application/json" || selectedFile.type === "text/csv")) {
            setFile(selectedFile);
        } else {
            info("Bitte eine CSV- oder JSON-Datei hochladen.");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            info("Bitte eine Datei auswählen.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            let data;
            try {
                if (file.type === "application/json") {
                    data = JSON.parse(event.target.result); // JSON-Datei parsen
                    data = flattenJSON(data); // JSON flach machen
                } else if (file.type === "text/csv") {
                    data = await parseCSV(event.target.result); // CSV in JSON umwandeln
                }

                // API-Call zur Übersetzungs-Import-Funktion
                try {
                    const response = await importTranslations(client, data, {}); // Leeres Objekt für Länder und Sprachen
                    if (response.success) {
                        success("Import erfolgreich abgeschlossen!");
                        props.onImportSuccess(); // Rufe die Aktualisierungsfunktion auf
                        handleClose(); // Schließe das Modal
                    } else {
                        danger("Fehler beim Import.");
                    }
                } catch (error) {
                    console.error("Fehler beim API-Aufruf:", error);
                    danger("Ein Fehler ist beim API-Aufruf aufgetreten.");
                }
            } catch (error) {
                danger("Fehler beim Verarbeiten der Datei.");
                console.error("Dateifehler:", error);
            }
        };

        reader.readAsText(file);
    };


    const flattenJSON = (data) => {
        const result = {};
        Object.keys(data).forEach(locale => {
            Object.keys(data[locale]).forEach(namespace => {
                const flatKeys = flattenObject(data[locale][namespace], namespace); // Namespace hier behalten
                Object.assign(result, {
                    [locale]: {
                        ...result[locale],
                        ...flatKeys,
                    }
                });
            });
        });
        return result;
    };

    const flattenObject = (obj, namespace = '') => {
        return Object.keys(obj).reduce((acc, key) => {
            const pre = namespace.length ? `${namespace}.` : '';
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                Object.assign(acc, flattenObject(obj[key], `${pre}${key}`));
            } else {
                acc[`${pre}${key}`] = obj[key];
            }
            return acc;
        }, {});
    };

    const parseCSV = (csv) => {
        return new Promise((resolve, reject) => {
            Papa.parse(csv, {
                header: true, // Nutze die erste Zeile als Header
                skipEmptyLines: true,
                complete: (results) => {
                    const translations = {};
                    results.data.forEach(row => {
                        const locale = row.locale;
                        const key = row.key;
                        const value = row.value;

                        if (!translations[locale]) {
                            translations[locale] = {};
                        }
                        translations[locale][key] = value; // Füge den Wert hinzu
                    });
                    resolve(translations);
                },
                error: (error) => {
                    reject(error); // Fehler beim Parsen zurückgeben
                }
            });
        });
    };

    return (
        <>
            <Modal show={props.show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title><FaFileImport />&nbsp;Import</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>Import (json, csv): </div>
                    <input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileChange}
                        style={{ marginTop: '10px' }}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Abbrechen
                    </Button>
                    <Button variant="primary" onClick={handleUpload} disabled={!file}>
                        Hochladen
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Import;
