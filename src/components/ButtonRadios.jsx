import { Button, ButtonGroup } from "@mui/material";

export default function ButtonRadios ({ options, value, valueKey, LabeRender, onChange = _ => 0,...props }) {

  return (
    <ButtonGroup color={props.color || 'info'} sx={ props.sx }>
    { options.map((t, i) => 
      <Button key={i} variant={(t?.[valueKey] || t) === value ? 'contained' : 'outlined'} onClick={e => onChange(t?.[valueKey] || t)}>
        { LabeRender 
          ? <LabeRender {...t} index={i} /> 
          : t?.[valueKey] || t
        }
      </Button>
    )}
    </ButtonGroup>
  )
}