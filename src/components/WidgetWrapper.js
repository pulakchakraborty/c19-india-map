import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';

import '../styles/App.scss';
import config from '../config';
import { StatesLatLong } from '../config/StatesLatLong';
import CoronaMap from './CoronaMap';
import SidePanel from './SidePanel';

const WidgetWrapper = () => {
    const { indiaLatest,
        countriesLatest,
        allSummary } = config;
    const [ data, setData ] = useState({});
    const [ summary, setSummary ] = useState({ confirmed: 0, dead: 0, recovered: 0 });
    const [ tableData, setTableData ] = useState([]);
    const [ errorMessage, setErrorMessage ] = useState('');
    const [ hasError, setHasError ] = useState(false);
    const [ isMapIndia, setisMapIndia ] = useState(true);

    const switchMap = (flag) => {
        setisMapIndia(flag);
    }

    //console.log(`data widget wrapper: ${data}`);
    useEffect(() => {
        if (isMapIndia) {
            const fetchData = async() => {
                try {
                    const { data: responseLatest, status: statusLatest } = await axios.get(indiaLatest);
                    if (statusLatest === 200) {
                        const response = responseLatest.data.regional;
                        setData(
                            response.map((point, index) => ({
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: StatesLatLong.find(state => state.name === point.loc).location
                                },
                                properties: {
                                    id: index,
                                    country: "India",
                                    province: point.loc,
                                    confirmed: point.totalConfirmed,
                                    dead: point.deaths,
                                    recovered: point.discharged
                                }
                            }))
                        );
                        setSummary({
                            confirmed: responseLatest.data.summary.total,
                            dead: responseLatest.data.summary.deaths,
                            recovered: responseLatest.data.summary.discharged
                        });
                        setTableData(responseLatest.data.regional);
                    }

                } catch(e) {
                    if (e.response) {
                        setHasError(true);
                        setErrorMessage(e.response.data.message);
                    }
                }
            }
            console.log(`mapFilter value: ${isMapIndia}`)
            fetchData();
        } else {
            console.log(`mapFilter value: ${isMapIndia}`)
            const fetchData = async() => {
                try {
                    const { data: responseLatest, status: statusLatest } = await axios.get(countriesLatest);
                    if (statusLatest === 200) {
                        //const response = responseLatest.data;
                        setData(
                            responseLatest.map((point, index) => ({
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: [
                                        point.countryInfo.long,
                                        point.countryInfo.lat
                                    ]
                                },
                                properties: {
                                    id: index,
                                    country: point.country,
                                    province: null,
                                    confirmed: point.cases,
                                    dead: point.deaths,
                                    recovered: point.recovered
                                }
                            }))
                        );
                        //setSummary(responseLatest.data.summary);
                        setTableData(responseLatest);
                        const { data: responseAllSummary, status: statusHistory } = await axios.get(allSummary);
                        if (statusHistory === 200) {
                            setSummary({
                                confirmed: responseAllSummary.cases,
                                dead: responseAllSummary.deaths,
                                recovered: responseAllSummary.recovered
                            });
                        }
                    }

                } catch(e) {
                    if (e.response) {
                        setHasError(true);
                        setErrorMessage(e.response.data.message);
                    }
                }
            }
            console.log(`mapFilter value: ${data}`)
            fetchData();
        }
    }, [isMapIndia]);

    return(
        <Fragment>
            <CoronaMap data={data} error={errorMessage} />
            <SidePanel
                summary={summary}
                mapSummary={isMapIndia}
                tableData={tableData}
                mapFilter={switchMap} />
        </Fragment>
    );
};

export default WidgetWrapper;