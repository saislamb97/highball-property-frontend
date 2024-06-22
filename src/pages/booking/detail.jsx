import { Box, Typography, Divider, useTheme } from "@mui/material"
import { tokens } from 'src/theme';
import { toGamel } from "src/utils/Utils";

export default function BookingDetail({ booking = {} }) {
  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  console.log(booking)

  const { user, user_id, image, property, property_id, ...details } = booking

  return <Box>
    { Object.keys(details).map(field => 
      <Box key={field} p={.5}>
        <Typography variant="h4" sx={{ display: 'flex' }}>
          <Box color={colors.grey[100]} mr={1}>{ toGamel(field) }</Box> : 
          <Box color={colors.greenAccent[300]} ml={1}>
            { details[field] ?? '-' }
          </Box> 
        </Typography>
        <Divider/>
      </Box>
    )}
  </Box>
}