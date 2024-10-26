import DwEnvironmentSelect from "../environment-select/DwEnvironmentSelect";
import React from "react";
import CreatableSelect from "react-select/creatable";
import {
    ButtonGroup,
    Container,
    Dropdown,
    DropdownButton,
    Nav,
    Navbar,
    NavDropdown
} from "react-bootstrap";
import {IoSettingsOutline} from "react-icons/io5";
import "./DwHeader.scss";

export const DwHeader = (props) => {
    const { clients, defaultClient, onClientChange, onOptionsButtonClick, size = 'xl' } = props;

    const renderClientsSelect = () => {
        if (clients && defaultClient) {
            return <CreatableSelect
                className="dw-projects-select"
                onChange={onClientChange}
                value={clients.find(client => client.value === defaultClient)}
                options={clients}
            />;
        } else {
            return null;
        }
    };

    const handleNewProject = () => {
        onOptionsButtonClick('newProject');
    };

    const handleEditProject = () => {
        onOptionsButtonClick('editProject');
    };

    const handleDeleteProject = () => {
        onOptionsButtonClick('deleteProject');
    };

    const handleImport = () => {
        onOptionsButtonClick('importTranslations');
    };

    const handleExport = () => {
        onOptionsButtonClick('exportTranslations');
    };

    const handleSelectedExport = () => {
        onOptionsButtonClick('exportSelectedTranslations');
    };

    const handleApiKeys = () => {
        onOptionsButtonClick('apiKeys');
    };

    return (
        <div className='dw-header'>
            <Navbar expand="lg">
                <Container fluid>
                    <Navbar.Brand href="#">  <img src="/api/images/logo.png" alt="" height={30} /></Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="me-auto my-2 my-lg-0"
                            style={{ maxHeight: '100px' }}
                            navbarScroll
                        >
                            <Nav.Link href="#action1">Translations</Nav.Link>
                        </Nav>

                        <div className="dw-settings d-flex">
                            {renderClientsSelect()}
                            <DwEnvironmentSelect></DwEnvironmentSelect>
                            <DropdownButton
                                as={ButtonGroup}
                                key={'Primary'}
                                id={`dropdown-variants-primary`}
                                variant={'link'}
                                size="sm"
                                style={{marginLeft: '10px'}}
                                title={<IoSettingsOutline size={30}/>}
                            >
                                <Dropdown.Item onClick={handleNewProject}>New Project</Dropdown.Item>
                                <Dropdown.Item onClick={handleEditProject}>Edit Project</Dropdown.Item>
                                <Dropdown.Item onClick={handleDeleteProject}>Delete Project</Dropdown.Item>
                                <Dropdown.Divider></Dropdown.Divider>
                                <Dropdown.Item onClick={handleImport}>Import Translations</Dropdown.Item>
                                {/*<Dropdown.Item onClick={handleExport}>Export Translations</Dropdown.Item>*/}
                                <Dropdown.Item onClick={handleSelectedExport}>Export Selected Translations</Dropdown.Item>
                                {/*<Dropdown.Divider></Dropdown.Divider>
                                <Dropdown.Item onClick={handleApiKeys}>Api-Keys</Dropdown.Item>*/}
                            </DropdownButton>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};
