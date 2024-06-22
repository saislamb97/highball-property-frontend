import React, { useState, useEffect, useRef, useCallback } from 'react';
import moment from 'moment';
import './style.css';
import { Box, Button, Typography, Dialog } from '@mui/material';
import { ArrowBack, ArrowForward, Home,  } from '@mui/icons-material';

const MonthPicker = ({ show = false, minMonth, maxMonth, currentMonth, onChange = _ => _, onClose = _ => _ }) => {
  const [year, setYear] = useState(moment())

  const [months, setMonths] = useState(
    Array(12).fill().map((_, i) => moment().clone().set({ month: i }))
  )

  useEffect(() => {
    if (!year.isSame(months[0], 'year')) {
      setMonths(
        Array(12).fill().map((_, i) => year.clone().set({ month: i }))
      )
    }
  }, [year])

  return <>
    <Dialog open={show}
      onClose={ (e, reason) => ['backdropClick', 'escapeKeyDown'].includes(reason) && onClose() }
      >
      <Box display={'flex'} alignItems={'center'}>
        { !moment().isSame(year, 'year') && <Button color='info' sx={{ position: 'absolute', left: '20px' }} onClick={e => !moment().isSame(year, 'YYYY-MM') && setYear(_ => moment().clone() )}> 
            <Home sx={{ fontSize: 24 }}/>
          </Button>
        }

        <Box width={'100%'} p={2} display={'flex'} alignItems={'center'} gap={10} justifyContent={'center'}>
          <Button color='info'
            disabled={ minMonth && year.isSame(minMonth, 'year') }
            onClick={e => setYear(d => d.subtract(1, 'year').clone() )}
            > 
            <ArrowBack sx={{ fontSize: 30 }}/> 
          </Button>

          <Typography variant='h1' sx={{cursor: 'pointer'}}>{ year.format('YYYY') }</Typography>

          <Button color='info' 
            disabled={ maxMonth && year.isSame(maxMonth, 'year') }
            onClick={e => setYear(d => d.add(1, 'year').clone() )}>
            <ArrowForward sx={{ fontSize: 30 }}/>
          </Button>
        </Box>
      </Box>

      <Box display={'flex'} justifyContent={'space-between'} flexWrap={'wrap'} gap={2} p={2}>
        { months.map(m => 
          <Button key={m.format('YYYY-MM')} sx={{ width: "30%", padding: '20px 0' }} 
            color={ moment().isSame(m, 'month') && !currentMonth.isSame(m, 'month') ? 'secondary' : 'info'}
            variant={ currentMonth.isSame(m, 'month') ? 'contained' : 'outlined' }
            onClick={ e => onChange(m) }
            disabled={ (minMonth && m.isBefore(minMonth, 'month')) || (maxMonth && m.isAfter(maxMonth, 'month')) }
            >
            <Typography variant='h2'>{ m.format('MM') }</Typography>
          </Button>
        )}
      </Box>

    </Dialog>
  </>
}

export default MonthPicker