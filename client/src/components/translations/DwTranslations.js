import React, {useEffect, useState} from 'react';
import {Route, Routes} from "react-router-dom";
import TranslationsDetailsPage from "./pages/TranslationsDetailsPage";
import TranslationsPage from "./pages/TranslationsPage";
import DwToast from "../toast/DwToast";

import {toastDefaults} from "../toast/toast.defaults";
import {initToastHelper} from "../toast/DwToastHelper";

export const TranslationsContext = React.createContext(null);

const DwTranslations = (props) => {

    const [toast, setToast] = useState(toastDefaults);

    useEffect(() => {
        initToastHelper(setToast);
    }, []);

    const onToastChange = (params) => {
        setToast({...toast, ...params})
    }

    const providerContext = {
        ...props
    }

    return (
        <TranslationsContext.Provider value={providerContext}>
            <DwToast
                onChange={onToastChange}
                title={toast.title}
                message={toast.message}
                background={toast.background}
                isHidden={toast.isHidden}
            ></DwToast>
            <Routes>
                <Route path="/" element={<TranslationsPage></TranslationsPage>}/>
                <Route path="/details/:project/:key" element={<TranslationsDetailsPage></TranslationsDetailsPage>}/>
            </Routes>
        </TranslationsContext.Provider>
    );
};

export default DwTranslations;
