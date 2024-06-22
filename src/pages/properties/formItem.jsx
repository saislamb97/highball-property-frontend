import React from "react";
import { TextField, useTheme, MenuItem } from "@mui/material";
import moment from 'moment';
import { tokens } from "../../theme";
import { toGamel } from "src/utils/Utils";

export default function FormItem(item) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const InputLabelProps = {
    style: {
      color: colors.greenAccent[500],
      fontWeight: "bold",
    }
  }
  if (item.type === 'select') {
    const selectedValue = item.value != undefined ? item.value : '';
    return <TextField
      variant={ item.variant || "filled" }
      select
      label={ item.label || toGamel(item.field || item.name) }
      required={ item.required }
      value={ selectedValue }
      name={item.field || item.name}
      InputProps={item.InputProps || {}}
      InputLabelProps={ InputLabelProps }
      onChange={ item.onChange }
      size={ item.size }
      sx={ item.sx }
      disabled={!!item.disabled}
      >
      {item.options.map((option, i) => {
        const value = option?.hasOwnProperty('value') ? option.value : option;
        return <MenuItem key={i} value={value} 
          selected={selectedValue === value}
          disabled={!!option.disabled}
          sx={{ display: 'flex', justifyContent: 'space-between', '&.MuiMenuItem-root.Mui-selected': { backgroundColor: colors.grey[400] } }}
          >
          <div>{option.name || value}</div>
        </MenuItem>
      })}
    </TextField>
  }

  const inputProps = item.inputProps || {}
  if (item.type === 'number') {
    inputProps.type = 'number'
    inputProps.step = isNumber(item.step) 
      ? item.step 
      : isNumber(inputProps.step) 
        ? inputProps.step 
        : '0.01'
  }
  return <TextField
    variant={ item.variant || "filled" }
    disabled={!!item.disabled}
    type={item.type}
    label={ item.label || item.field }
    required={ item.required }
    value={ (item.type === 'date' && item.value) ? moment(item.value).format('YYYY-MM-DD') : (item.value || '') }
    name={item.field || item.name}
    multiline={item.rows > 1}
    rows={item.rows || 1}
    InputLabelProps={ InputLabelProps }
    InputProps={item.InputProps || {}}
    inputProps={inputProps}
    onChange={ item.onChange }
    size={ item.size }
    sx={ item.sx }
    />
}

function isNumber(value) {
  return typeof value === 'number' && !isNaN(+value);
}