// src/App.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StationSelectionScreen from './components/StationSelectionScreen';
import TimetableScreen from './components/TimetableScreen';
import { Timetable, TimetableEntry } from './types';

const App: React.FC = () => {
  const [showTimetable, setShowTimetable] = useState<boolean>(false);
  const [timetableList, setTimetableList] = useState<Timetable[]>([]);
  
  const handleShowTimetable = (
    station: string,
    linename: string,
    direction: string,
    newTimetables: TimetableEntry[],
    stationCode: string,
    directionCode: string
  ) => {
    setTimetableList(prevTimetables => [
      ...prevTimetables,
      { station, linename, direction, times: newTimetables, stationCode, directionCode },
    ]);
    setShowTimetable(true);
  };

  // 時刻表画面に遷移
  const handleGoToTimetable = () => {
    setShowTimetable(true);
  };

  // 時刻表を削除
  const handleRemoveTimetable = (index: number) => {
    setTimetableList(prevTimetables => prevTimetables.filter((_, i) => i !== index));
  };

  // 午前2時に時刻表を更新 (毎日)平日・土日祝で異なる時刻表を取得するため
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const targetHour = 2;
      const targetMinute = 0;
      const tolerance = 30 * 1000;// 30秒の許容範囲
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";
      const targetTime = new Date();
      targetTime.setHours(targetHour, targetMinute, 0, 0);

      if (Math.abs(now.getTime() - targetTime.getTime()) <= tolerance) {
        (async () => {
          try {
            //バックエンドの時刻表取得処理を呼びだして、表示している時刻表を全て更新する
            const updatedTimetables = await Promise.all(
              timetableList.map(async (timetable) => {
                const response = await axios.get(
                  `${API_BASE_URL}/timetable/code/?stationCode=${timetable.stationCode}&code=${timetable.directionCode}`
                );
                const timetables = response.data.ResultSet.TimeTable.HourTable.flatMap((table: any) =>
                  table.MinuteTable.map((minute: any) => ({
                    time: `${String(table.Hour).padStart(2, '0')}:${String(minute.Minute).padStart(2, '0')}`,
                    detail: `${minute.Stop.LineDestinationText}:${minute.Stop.LineKindText}`,
                  }))
                );

                return { ...timetable, times: timetables };
              })
            );

            setTimetableList(updatedTimetables);
          } catch (error) {
            console.error('API call failed:', error);
          }
        })();
      }
    }, 60000);// 1分ごとにチェック

    return () => clearInterval(interval);
  }, [timetableList]);

  return (
    <div style={{ backgroundColor: 'lightgray', minHeight: '100vh' }}>
      {!showTimetable ? (
        <StationSelectionScreen onShowTimetable={handleShowTimetable} onGoToTimetable={handleGoToTimetable} />
      ) : (
        <TimetableScreen
          onBack={() => setShowTimetable(false)}
          timetableList={timetableList}
          onRemoveTimetable={handleRemoveTimetable}//削除ボタン押下時の処時
          onClearAllTimetable={setTimetableList}
        />
      )}
    </div>
  );
};

export default App;
