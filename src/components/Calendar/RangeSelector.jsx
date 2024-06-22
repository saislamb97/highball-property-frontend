import { useState, useRef } from "react";
import { useTheme, Box } from "@mui/material";
import Calendar from "./index";
import moment from "moment";
import { getBetweenDates } from "src/utils/Utils";
import { tokens } from "src/theme";

var touching = false;

export default function CalendarRangeSelector({ 
  onChange = e => null, 
  initMonths = [moment(), moment().add(1, 'month')], 
  onMonthChange = e => null, 
  children,
  DayItem
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [dateRange, setDateRange] = useState([])
  const [selectedDates, setSelectedDates] = useState([]);

  const handleDateSelect = (e, date) => {
    if (!touching) {
      setDateRange([date])
      setSelectedDates([])
    } else {
      console.log(selectedDates, dateRange)
      setDateRange([dateRange[0], date])
      onChange([
        selectedDates[0],
        selectedDates[selectedDates.length - 1]
      ].filter(Boolean))
    }
    touching = !touching
    console.log(touching)
  }
  const handleDateSelecting = (e, date) => {
    if (touching) {
      const betweens = moment(dateRange[0]).isAfter(date, 'date')
        ? [date, dateRange[0]]
        : [dateRange[0], date];

      const dates = getBetweenDates(...betweens).map(d => moment(d).format('YYYY-MM-DD'))

      setSelectedDates(_ => dates)
    }
  }
  
  const startMonthRef = useRef(null)
  const endMonthRef = useRef(null)

  const handleMonthChange = (m, index) => {
    const months = []
    if (index === 0) {
      months.push(m, endMonthRef.current.month)
    }
    else {
      months.push(startMonthRef.current.month, m)
    }
    if (months[0].isAfter(months[1])) {
      months.reverse()
    } else {
    }
    onMonthChange(months)
  }

  const selectedColor = date => {
    const [startDate, endDate] = dateRange
    if (date === startDate || date === endDate) {
      return colors.blueAccent[600]
    }
    if (selectedDates.includes(date)) {
      return colors.grey[700]
    }
    return 'none'
  }
  return <Box display={'flex'} gap={2}>
    <Calendar hideHome selectable={false} 
      ref={startMonthRef}
      initMonth={initMonths[0]} minMonth={moment()}
      onMonthChange={ m => handleMonthChange(m, 0) } 
      DayItem={ ({ date }) => {
        return <Box 
          width={'100%'} height={'60px'} className={'customer-date-cell--'}
          backgroundColor={ selectedColor(date) }
          onClick={ e => handleDateSelect(e, date) }
          onMouseMove={ e => handleDateSelecting(e, date) }
          >
          { DayItem ? <DayItem date={date}/> : date.slice(-2) }
        </Box>
      } }
    />
    <Calendar hideHome selectable={false} 
      ref={endMonthRef}
      initMonth={initMonths[1]} 
      minMonth={moment().add(1, 'month')}
      onMonthChange={ m => handleMonthChange(m, 1) }
      DayItem={ ({ date }) => {
        return <Box 
          width={'100%'} height={'60px'} className={'customer-date-cell--'}
          backgroundColor={ selectedColor(date) }
          onClick={ e => handleDateSelect(e, date) }
          onMouseMove={ e => handleDateSelecting(e, date) }
          >
          { DayItem ? <DayItem date={date}/> : date.slice(-2) }
        </Box>
      } }
      /> 
  </Box>
}