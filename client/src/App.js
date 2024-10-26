import React, {useEffect, useState} from 'react';
import './App.scss';
import DwTranslations from "./components/translations/DwTranslations";
import {DwHeader} from "./components/header/DwHeader";
import {searchDataDefaults} from "./components/translations/defaults/search-data.defaults";
import {createClients, deleteClients, fetchClients, updateClients} from "./services/ClientsService";
import {createTranslations, destroyTranslations, searchTranslation, updateTranslations} from "./services/TranslationsService";
import {findOneConfiguration} from "./services/ConfigurationsService";
import {entriesDefaults} from "./components/translations/defaults/entries.defaults";
import {configurationDefaults} from "./components/translations/defaults/configuration.defaults";
import ProjectModal from "./components/project/ProjectModal";
import Import from "./components/translations/import/Import";
import DwButtons from "./components/buttons/DwButtons";
import {FormControl, Modal} from "react-bootstrap";
import Alert from "react-bootstrap/Alert";

const App = () => {
    const [data, setData] = useState(entriesDefaults);
    const [filter, setFilter] = useState(searchDataDefaults);
    const [configuration, setConfiguration] = useState(configurationDefaults);
    const [clients, setClients] = useState([{label:'', value:''}]);
    const [entries, setEntries] = useState([entriesDefaults]);
    const [projectData, setProjectData] = useState({active: false, title: '', action: '', projectName: '', locales: []});
    const [importActive, setImportActive] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [selectedEntries, setSelectedEntries] = useState([]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState(null);


    let clientsFetched = false;

    useEffect(() => {
        initClients();
    }, []);

    useEffect(() => {
        initData();
        initConfigurations('client_config');
    }, [filter.client]);

    const initClients = async () => {
        if (!clientsFetched && filter.client === '') {
            clientsFetched = true;
            const response = await fetchClients();
            if (response.length > 0) {
                setShowTable(true);
                setClients(response);
                setFilter({...filter, client: response[0].value});
            }

        }
    }

    const initData = async () => {
        if (filter.client !== '' && data[0]?.id === -1) {
            const response = await searchTranslation({...filter});
            setData(response.entries);
            setFilter(prevData => ({...prevData, pagination: response.pagination}));
        }
    };

    const initConfigurations = async (type) => {
        if (filter.client !== '') {
            const configuration = await findOneConfiguration(filter.client, type);
            setConfiguration(configuration);
        }
    };

    const getProjectDataLocales = (configuration) => {
        return configuration.client_config.locales.map((locale) => {
            return {label: locale, value: locale}
        })
    }

    const onClientChange = async (e) => {
        await onChange({client: e.value})
    };

    const readData = async (data) => {
        return await searchTranslation(data);
    };

    const onEditButtonClick = async (params) => {
        if (params) {
            const translations = await searchTranslation(params);
            return translations.entries;
        }
    }

    const onDelete = async (client, entries) => {
        await destroyTranslations({client: client, entries});
        onChange(filter);
    }

    const onUpdate = async (client, entries) => {
        await updateTranslations({client, entries});
        onChange(filter);
    }

    const onCreate = async (client, entries) => {
        await createTranslations({client, entries});
        onChange(filter);
    }

    const onChange = async (data) => {
        const params = {...filter, ...data};
        const translations = await readData(params);
        filter.pagination = translations.pagination;
        setData(translations.entries);
        setFilter({...filter, ...data});
    }

    const onImportButtonClick = async () => {
        console.log('import', ' <------  ------ ');
    }


    const exportFile = async (format) => {
        if (selectedEntries.length === 0) {
            console.log('No entries selected for export');
            return;
        }

        if (format === 'csv') {
            const csvContent = selectedEntries.map(entry =>
                `${entry.key},${entry.value},${entry.country},${entry.language}`
            ).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', 'translations.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } else if (format === 'json') {
            // Die Struktur in das gewünschte Format umwandeln
            const jsonStructure = selectedEntries.reduce((acc, entry) => {
                const { language, country, key, value } = entry;
                const locale = `${language}-${country}`; // Vollständige Locale (z.B. de-DE, fr-CH)

                // Überprüfen, ob die Locale schon existiert, wenn nicht, hinzufügen
                if (!acc[locale]) {
                    acc[locale] = {};
                }

                // Schlüsselkategorien (z.B. dummy, feature) aufteilen
                const keyParts = key.split('.');
                let currentLevel = acc[locale];

                // Verschachtelte Struktur aufbauen
                keyParts.forEach((part, index) => {
                    if (index === keyParts.length - 1) {
                        currentLevel[part] = value;  // Letzter Teil ist der Wert
                    } else {
                        if (!currentLevel[part]) {
                            currentLevel[part] = {};
                        }
                        currentLevel = currentLevel[part]; // Navigiere in die Tiefe
                    }
                });

                return acc;
            }, {});

            const jsonContent = JSON.stringify(jsonStructure, null, 2);

            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', 'translations.json');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        setShowExportModal(false); // Schließe das Modal nach dem Export
    };



    const onProjectChange = async (data) => {
        setProjectData(data);
    }

    const refreshData = async () => {
        const response = await searchTranslation({...filter}); // Hole die aktuellen Übersetzungen
        setData(response.entries); // Setze die aktuellen Daten in den Zustand
        setFilter(prevData => ({...prevData, pagination: response.pagination})); // Setze die Paginierungsdaten
    };

    const onProjectSave = async (data) => {
        setProjectData(data);
        switch (data.action) {
            case 'create':
                const newClient = {label: data.projectName, value: data.projectName};
                await createClients({projectName: data.projectName, locales: data.locales})
                setClients(prevClients => [...prevClients, newClient]);
                setFilter({...filter, client: data.projectName});
                setShowTable(true);
                await onClientChange(newClient);
                break;
            case 'edit':
                await updateClients({projectName: data.projectName, locales: data.locales});
                break;
            case 'delete':
                const clients = await deleteClients(filter.client);
                setClients(clients);
                if (clients.length < 1) {
                    setShowTable(false);
                } else {
                    filter.client = clients[0].value;
                    setShowTable(true);
                    onChange(filter);
                }
                break;

        }
    }

    const onOptionsButtonClick = (option) => {
        switch (option) {
            case 'newProject':
                setProjectData({...projectData, active: true, title: 'New Project', action: 'create'});
                break;
            case 'editProject':
                setProjectData({...projectData, locales: getProjectDataLocales(configuration), active: true, title: 'Edit Project', action: 'edit', projectName: filter.client});
                break;
            case 'deleteProject':
                setProjectData({...projectData, active: true, title: 'Delete Project', action: 'delete', projectName: filter.client});
                break;
            case 'importTranslations':
                setImportActive(true);
                break;
            case 'exportSelectedTranslations':
                setShowExportModal(true);
                break;
        }
    }

    const onSelectionChange = (selectedRows) => {
        setSelectedEntries(selectedRows);
    };

    const onExportModalClose = () => {
        setShowExportModal(false)
    }


    const renderContent = () => {
        if (!showTable) {
            return (
                <div className="App">
                    <div className="row">
                        <div className="col-md-12">
                            <span className='new-project-text'>
                                Create new project first
                                <div><DwButtons button='add' onClick={onOptionsButtonClick.bind(null, 'newProject')}></DwButtons></div>
                            </span>

                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <DwTranslations
                    data={data}
                    entries={entries}
                    filter={filter}
                    locales={configuration.client_config.locales}
                    onChange={onChange}
                    onCreate={onCreate}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onSelectionChange={onSelectionChange}
                    onEditButtonClick={onEditButtonClick}>
                </DwTranslations>
            )
        }
    }



    return (
        <>
            <Modal show={showExportModal} onHide={onExportModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Select Export Format</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DwButtons button='custom' text='Export as JSON' onClick={() => exportFile('json')}/>
                    <DwButtons button='custom' text='Export as CSV' onClick={() => exportFile('csv')} />
                </Modal.Body>
                <Modal.Footer>
                    <DwButtons button='cancel' />
                </Modal.Footer>
            </Modal>
            <DwHeader
                defaultClient={filter.client}
                onOptionsButtonClick={onOptionsButtonClick}
                clients={clients}
                onClientChange={onClientChange}>
            </DwHeader>
            {renderContent()}
            <ProjectModal
                data={projectData}
                onChange={onProjectChange}
                onSave={onProjectSave}
            >
            </ProjectModal>
            <Import show={importActive} setShow={setImportActive} onImportSuccess={refreshData}></Import>
        </>
    );
}

export default App;
