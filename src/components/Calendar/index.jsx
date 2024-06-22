import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import moment from 'moment';
import { tokens } from 'src/theme';
import { getCalendarData, weeks } from './utils';
import './style.css';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { ArrowBack, ArrowForward, Home } from '@mui/icons-material';
import Selecto from "react-selecto";
import OutsideClickDetector from 'src/components/OutsideClickDetector';
import MonthPicker from './MonthPicker';
import { getBetweenDates } from 'src/utils/Utils';
import eventEmitter from 'src/eventEmitter';
import { SELECTED_DATES_CHANGE_EVENT } from 'src/eventEmitter/eventTypes';

/**
 * 
 * @param {boolean} continuous continuous to selecting, between dates
 * @return {React.Component}
 */

const Calendar = forwardRef(({ 
  selectable = true,
  continuous = false, hideOverflowMonthDate = false, hideHome = false,
  minMonth, maxMonth,
  minWidth, 
  initMonth = moment(), 
  DayItem, 
  onMonthChange = _ => _, 
  onSelect = (_ => _), 
  HeaderActions = <></>
}, ref) => {
  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [currentDate, setCurrentDate] = useState(initMonth);
  const [datesByMonth, setDatesByMonth] = useState( getCalendarData(currentDate) );
  const [selectedDates, setSelectedDates] = useState([]);

  const [selectableTargets, setSelectableTargets] = useState(document.querySelectorAll('.date-item--'))
  const selectedDatesRef = useRef(selectedDates);

  useEffect(() => {
    const listener = dates => {
      setSelectedDates(_ => dates.filter(d => currentDate.isSame(d, 'month')))
    }
    if (continuous) {
      eventEmitter.on(SELECTED_DATES_CHANGE_EVENT, listener);
    } else {
      eventEmitter.off(SELECTED_DATES_CHANGE_EVENT, listener);
    }
    return () => eventEmitter.off(SELECTED_DATES_CHANGE_EVENT, listener);
  }, [continuous])

  useEffect(() => {
    setDatesByMonth([...getCalendarData(currentDate)])
    onMonthChange(currentDate)
  }, [ currentDate.format('YYYY-MM') ])

  useEffect(() => {
    setSelectableTargets(Array.from(document.querySelectorAll('.date-item--')))
  }, [datesByMonth])

  const handleDatesSelecting = useCallback((e) => {
    const newSelectedDates = e.selected.map(t => t.dataset.date)
    
    console.log(newSelectedDates)
    if (continuous && newSelectedDates.length > 1) {
      const betweenDates = getBetweenDates(newSelectedDates[0], newSelectedDates[newSelectedDates.length - 1]).map(d => moment(d).format('YYYY-MM-DD'))
      selectedDatesRef.current = betweenDates;
      setSelectedDates(_ => betweenDates)

      eventEmitter.emit(SELECTED_DATES_CHANGE_EVENT, betweenDates)
    } else {
      selectedDatesRef.current = newSelectedDates.filter(d => currentDate.isSame(d, 'month'))
      setSelectedDates(_ => selectedDatesRef.current)
    }
  }, [currentDate.format('YYYY-MM'), continuous])

  const handleDatesSelected = e => {
    if (e.selected?.length) {
      if (!selectedDatesRef.current.length) {
        handleDatesSelecting(e)
      }
    }
    if (selectedDatesRef.current.length) {
      onSelect(selectedDatesRef.current);
    }
  }

  const [monthPickerShow, setMonthPickerShow] = useState(false)

  /**
   * @param {string} by - 'week' |　'outside'
   */
  const handleDatesSelectedBy = useCallback((by, param) => {
    if (by === 'week') {
      const newSelectedDates = datesByMonth.flat().map(d => {
        if (currentDate.isSame(d, 'month') && moment(d).weekday() === param) {
          return d
        }
      }).filter(Boolean);
      selectedDatesRef.current = newSelectedDates;
      setSelectedDates(_ => newSelectedDates)
      onSelect(newSelectedDates)
    }
    if (by === 'outside') {
      selectedDatesRef.current = []
      setSelectedDates(_ => [])
    }
  }, [datesByMonth, currentDate.format('YYYY-MM')])

  const handleDrag = useCallback((e) => {
  }, [datesByMonth, currentDate.format('YYYY-MM')])
 
  useImperativeHandle(ref, () => {
    return {
      month: currentDate,
      setMonth: setCurrentDate,
    }
  })

  return <Box overflow={'auto'}>
    <Box display={'flex'} alignItems={'center'} justifyContent={'flex-start'} gap={'10px'} minWidth={minWidth}>
      { !hideHome && !moment().isSame(currentDate, 'month') && <Button color='secondary' onClick={e => !moment().isSame(currentDate, 'YYYY-MM') &&  setCurrentDate(_ => moment().clone() )}> 
          <Home sx={{ fontSize: 24 }}/>
        </Button>
      }
        
      <Box width={'220px'} display={'flex'} alignItems={'center'} gap={0} justifyContent={'space-between'}>
        <Button color='info' 
          disabled={ minMonth && currentDate.isSame(minMonth, 'month') }
          onClick={e => setCurrentDate(d => d.subtract(1, 'month').clone() )}
          > 
          <ArrowBack sx={{ fontSize: 30 }}/> 
        </Button>

        <Typography variant='h3' sx={{cursor: 'pointer'}} onClick={ _ => setMonthPickerShow(_ => true) }>{ currentDate.format('YYYY-MM') }</Typography>

        <MonthPicker minMonth={minMonth} maxMonth={maxMonth} currentMonth={currentDate} show={monthPickerShow} 
          onChange={ e => { setCurrentDate(e); setMonthPickerShow(_ => false) } }
          onClose={e => setMonthPickerShow(_ => false) }
          />

        <Button color='info' 
          disabled={ maxMonth && currentDate.isSame(maxMonth, 'month') }
          onClick={e => setCurrentDate(d => d.add(1, 'month').clone() )}>
          <ArrowForward sx={{ fontSize: 30 }}/>
        </Button>
      </Box>
      
      { HeaderActions }
    </Box>

    <OutsideClickDetector className='selecto-wrapper' style={{ minWidth }}
      onOutsideClick={ e => handleDatesSelectedBy('outside')}
      >
      
      <Box mt={1} display={'flex'} gap={0} justifyContent={'space-between'} borderRadius={'4px 4px 0 0'} overflow={'hidden'}>
        { weeks.map((t, i) => 
          <Button color='success' key={t} variant={'contained'} sx={{ flex: 1, padding: '10px 20px', fontSize: 20, fontWeight: 'bold', borderRadius: 0 }}
            onClick={ e => handleDatesSelectedBy('week', i) }
            >{ t }</Button>
          )
        }
      </Box>

      <Box sx={{ width: '100%', border: `1px solid ${colors.primary[300]}` }}> 
        { datesByMonth.map((datesByWeek, wi) => (
          <Box key={wi} display={'flex'} gap={0} justifyContent={'space-between'}
            sx={{
              '&:not(:first-of-type)': {
                borderTop: `1px solid ${colors.primary[300]}`
              }
            }}
            >
            { datesByWeek.map(date => (
              <Button key={date} variant='text'
                color={ 'info' } disabled={ !currentDate.isSame(date, 'month') }
                data-date={date}
                className={ 
                  ['date-item--', selectedDates.includes(date) && 'selected' ].filter(Boolean).join(' ')
                }
                sx={{ 
                  flexShrink: 0,
                  borderRadius: 0,
                  '&:not(:first-of-type)': {
                    borderLeft: `1px solid ${colors.primary[300]}`
                  },
                  flex: 1, padding: '0', fontSize: 20, fontWeight: 'bold',
                  transition: 'all .2s',
                  '&.selected': {
                    backgroundColor: colors.blueAccent[800]
                  },
                  color: moment().isSame(date, 'date') && colors.red[300]
                }}
                >
                { DayItem 
                  ? <DayItem date={date} 
                      isCurrentMonth={currentDate.isSame(date, 'month')} 
                      selected={ selectedDates.includes(date) }
                      isToday={ moment().isSame(date, 'date') }
                      /> 
                  : (hideOverflowMonthDate && !currentDate.isSame(date, 'month')
                      ? ''
                      : +date.slice(-2)
                    )
                }
              </Button>
            ))
            }
          </Box>
        )) }
      </Box>
      
      { selectable && <Selecto 
          container={ document.body }
          dragContainer={ document.querySelector('.selecto-wrapper') }
          keyContainer={window}
          selectableTargets={ 
            selectableTargets?.length 
            ? selectableTargets 
            : document.querySelectorAll('.date-item--') 
          }
          selectByClick
          selectFromInside
          ratio={0}
          hitRate={0}
          onSelect={ handleDatesSelecting }
          onSelectEnd={ handleDatesSelected }
          onDrag={ handleDrag }
        />
      }
    </OutsideClickDetector>
    
  </Box>
})
export default Calendar;
