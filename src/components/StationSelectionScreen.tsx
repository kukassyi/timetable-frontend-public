// src/components/StationSelectionScreen.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { StationSelectionScreenProps } from '../types';
import '../styles/StationSelectionScreen.css';

const StationSelectionScreen: React.FC<StationSelectionScreenProps> = ({ onShowTimetable, onGoToTimetable }) => {
    const [searchText, setSearchText] = useState<string>('');
    const [stationList, setStationList] = useState<string[]>([]);
    const [directionList, setDirectionList] = useState<string[]>([]);
    const [stationCode, setStationCode] = useState<string>('');
    const [stationName, setStationName] = useState<string>('');
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

    const handleSearch = async () => {
        setStationCode('');
        try {
            const response = await axios.get(`${API_BASE_URL}/station?stationName=${searchText}`);
            const stations = response.data.map((station: any) => `${station.station_code}:${station.station_name}`);
            setStationList(stations);
        } catch (error) {
            console.error('API call failed:', error);
        }
    };

    const handleStationClick = async (stationData: string) => {
        setDirectionList([]);
        const [code, name] = stationData.split(':');
        setStationCode(code);
        setStationName(name);
        try {
            const response = await axios.get(`${API_BASE_URL}/timetable/?stationCode=${code}`);
            const directions = response.data.ResultSet.TimeTable.map(
                (direction: any) => `${direction.code}:${direction.Line.Name}:${direction.Line.Source}⇒${direction.Line.Direction}`
            );
            setDirectionList(directions);
        } catch (error) {
            console.error('API call failed:', error);
        }
    };

    const handleDirectionClick = async (direction: string) => {
        const [directionCode, directionLineName, directionName] = direction.split(':');
        try {
            const response = await axios.get(`${API_BASE_URL}/timetable/code/?stationCode=${stationCode}&code=${directionCode}`);
            const timetables = response.data.ResultSet.TimeTable.HourTable.flatMap((table: any) =>
                table.MinuteTable.map((minute: any) => ({
                    time: `${String(table.Hour).padStart(2, '0')}:${String(minute.Minute).padStart(2, '0')}`,
                    detail: `${minute.Stop.LineDestinationText}:${minute.Stop.LineKindText}`
                }))
            );
            onShowTimetable(stationName, directionLineName, directionName, timetables, stationCode, directionCode);
        } catch (error) {
            console.error('API call failed:', error);
        }
    };

    return (
        <div className="station-selection-container">
            <div className="header">
                <div className="search-box">
                    <label htmlFor="stationSearch" className="search-label">駅名：</label>
                    <input
                        id="stationSearch"
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="button-box">
                <button onClick={handleSearch} className="search-button">検索</button>
                <button onClick={onGoToTimetable} className="timetable-button">時刻表一覧　＞</button>
                </div>
            </div>

            <div className="list-container">
                <div className="station-list">
                    <div>駅一覧</div>
                    <ul className="list">
                        {stationList.map((station, index) => (
                            <li
                                key={index}
                                onClick={() => handleStationClick(station)}
                                className="list-item"
                            >
                                {station.split(':')[1]}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="direction-list">
                    <div>方面一覧</div>
                    <ul className="list">
                        {directionList.map((direction, index) => (
                            <li
                                key={index}
                                onClick={() => handleDirectionClick(direction)}
                                className="list-item"
                            >
                                <b>{(direction.split('⇒')[0]).split(':')[1]}</b>:<span className="gray-text">{(direction.split('⇒')[0]).split(':')[2]}</span><b>⇒{direction.split('⇒')[1]}</b>行き
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StationSelectionScreen;
