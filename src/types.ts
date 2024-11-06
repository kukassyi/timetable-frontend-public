// src/types.ts
export interface TimetableEntry {
    time: string;
    detail: string;
  }
  
  export interface Timetable {
    station: string;
    linename: string;
    direction: string;
    times: TimetableEntry[];
    stationCode: string;
    directionCode: string;
  }
  
  export interface StationSelectionScreenProps {
    onShowTimetable: (
      station: string,
      linename: string,
      direction: string,
      timetables: TimetableEntry[],
      stationCode: string,
      directionCode: string
    ) => void;
    onGoToTimetable: () => void;
  }
  
  export interface TimetableScreenProps {
    onBack: () => void;
    timetableList: Timetable[];
    onRemoveTimetable: (index: number) => void;
    onClearAllTimetable: React.Dispatch<React.SetStateAction<Timetable[]>>;
  }
  