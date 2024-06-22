import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, TextField, useTheme, Alert, MenuItem } from "@mui/material";
import Popover from '@mui/material/Popover';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment';

export default function MyDatePicker({ name, value, onChange, ...props }) {
  const [focus, setFocus] = useState(false);
  const pickerWrapper = useRef();
  const handleDateChange = (date) => {
    onChange({ target: { value: date.format('YYYY/MM/DD'), name } })
  }
  return <div>
    <TextField ref={pickerWrapper} name={name} value={value} {...props} 
      onFocus={ e => setFocus(_ => true) }  onBlur={ e => setFocus(_ => false) }
      InputProps={{
        readOnly: true,
        blur: focus
      }}
      />
    
    <Popover open={focus}
      anchorEl={pickerWrapper.current}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DateCalendar value={ moment(value) } name={name} onChange={handleDateChange}></DateCalendar>
      </LocalizationProvider>
    </Popover>
  </div>
}