// src/components/TimetableScreen.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TimetableScreenProps, TimetableEntry } from '../types';
import '../styles/TimetableScreen.css';

const TimetableScreen: React.FC<TimetableScreenProps> = ({ onBack, timetableList, onRemoveTimetable, onClearAllTimetable }) => {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";
    

    // 1分毎に時刻更新
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    // 時刻差分を計算
    const calculateTimeDifference = (time: string): number => {
        const [hour, minute] = time.split(':').map(Number);
        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(hour, minute, 0);

        // 2時未満の場合は翌日として計算
        if (now.getHours() < 3) {
            now.setHours(now.getHours() + 24);
        }
        return (targetTime.getTime() - now.getTime()) / 60000; // Difference in minutes
    };

    const getSortedTimetables = (times: TimetableEntry[]): TimetableEntry[] => {
        return times
            .filter(entry => calculateTimeDifference(entry.time) >= 0)// 過去の時刻は表示しない
            .sort((a, b) => calculateTimeDifference(a.time) - calculateTimeDifference(b.time)) // 時刻順にソート
            .slice(0, 5);// 上位5件のみ表示
    };

    // 現在の日付を取得
    const getCurrentDate = (): string => {
        return `${currentTime.getFullYear()}年${String(currentTime.getMonth() + 1).padStart(2, '0')}月${String(currentTime.getDate()).padStart(2, '0')}日`;
    };

    // 現在の時刻を取得
    const getCurrentTime = (): string => {
        return `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
    };

    // 全ての時刻表を削除DBからも削除、ダイヤ改正などの際に使用
    const onClearAll = async () => {
        onClearAllTimetable([]);
        try {
            await Promise.all([
                axios.delete(`${API_BASE_URL}/station`),
                axios.delete(`${API_BASE_URL}/timetable`),
                axios.delete(`${API_BASE_URL}/timetable/code`),
            ]);
        } catch (error) {
            console.error('API call failed:', error);
        }
    };


    return (
        <div className="timetable-container">
            <div className="header">
                <button onClick={onBack} className="back-button">
                    <span style={{ marginRight: '8px', fontSize: '16px' }}>＜</span> 駅・方面選択
                </button>
                <div className="current-time">{getCurrentTime()}</div>
                <div className="current-date">{getCurrentDate()}</div>
            </div>

            <h2 className="timetable-header">時刻表一覧</h2>

            <div className="timetable-list">
                {timetableList.length > 0 ? (
                    timetableList.slice().reverse().map((timetable, index) => {
                        const originalIndex = timetableList.length - 1 - index;

                        return (
                            <div key={index} className="timetable-item">
                                <div className="timetable-title">
                                    {timetable.station}駅<br />{timetable.linename}<br />{timetable.direction}方面
                                </div>
                                {getSortedTimetables(timetable.times).map((entry, timeIndex) => {
                                    const limitClass = timeIndex === 0 ? 'limit-time' : 'limit-time limit-wine-red';

                                    return (
                                        <div key={timeIndex} className="timetable-entry">
                                            <div className={limitClass}>
                                                <strong>{`後${Math.floor(calculateTimeDifference(entry.time)) + 1}分`}</strong>
                                            </div>
                                            <div style={{ flexShrink: 1 }}>
                                                {entry.time}<br />
                                                {entry.detail}
                                            </div>
                                        </div>
                                    );
                                })}
                                <button onClick={() => onRemoveTimetable(originalIndex)} className="remove-button">
                                    削除
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="timetable-empty">時刻表のデータはここに表示されます</div>
                )}
            </div>
        </div>
    );
};

    

export default TimetableScreen;
