import { useEffect, useState } from "react";
import { Box, Typography, TextField, useTheme, Chip, Switch, FormControlLabel, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { Confirm } from 'src/components/Confirm';
import { delay } from "src/utils/Utils";
import Calendar from "src/components/Calendar";
import useIsMobile from "src/hooks/useIsMobile";
import moment from "moment";
import ButtonRadios from "src/components/ButtonRadios";
import useToast from "src/hooks/useToast";
import PropertySelector from "src/pages/booking/PropertySelector";
import { useFormSubmit, usePricesByDateRange } from "src/services/propertyPrices";
import useLocationQuery from "src/hooks/useLocationQuery";

const PropertyPrices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const toast = useToast();
  const isMobile = useIsMobile();
  const [openSelected, setOpenSelected] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [calendarContinuous, setCalendarContinuous] = useState(false);

  const availableStatus = [
    { name: 'AVAILABLE', value: 'AVAILABLE', icon: '💚', color: colors.greenAccent[400] },
    { name: 'RESERVED', value: 'RESERVED', icon: '👩🏼', color: colors.blueAccent[200] },
    { name: 'OCCUPIED', value: 'OCCUPIED', icon: '🛌🏼', color: colors.blueAccent[400] },
  ];

  const [availableStatu, setAvailableStatu] = useState('-');
  const [formData, setFormData] = useState({ price: '', available_status: availableStatus[0].value });

  const id = useLocationQuery('property_id', 'number');
  const [property, setProperty] = useState({ id });
  const [propertyAnchorEl, setPropertyAnchorEl] = useState(null);

  const { data: rows = [], refetch } = usePricesByDateRange({
    property_id: property?.id,
    available_status: availableStatu !== '-' ? availableStatu : undefined,
    dateRange: [
      currentMonth.format('YYYY-MM-01'),
      currentMonth.format(`YYYY-MM-${currentMonth.daysInMonth()}`)
    ]
  }, {
    enabled: Boolean(property?.id),
    refetchOnMount: true
  });

  useEffect(() => {
    const newFormData = { price: '', available_status: availableStatus[0].value };
    if (selectedDates.length && rows?.length) {
      const row = rows.find(t => selectedDates[0].isSame(moment(t.date), 'date'));
      if (row) {
        newFormData.price = row.price || '';
        newFormData.available_status = row.available_status || availableStatus[0].value;
      }
    }
    setFormData(newFormData);
  }, [selectedDates, rows]);

  const mutation = useFormSubmit({
    onSuccess() {
      refetch();
      toast('Success!', 1);
      setOpenSelected(false);
    },
    onError(e) {
      toast(mutation.error?.message || 'Request failed');
    }
  });

  const handleSubmit = async e => {
    const price = e.detail.value.price.trim();

    if (isNaN(+price) || +price < 0) {
      return toast('Invalid price', -1);
    }

    if (mutation.isPending) return;
    const fd = {
      price,
      available_status: formData.available_status,
      property_id: property.id,
      date: selectedDates.map(t => t.format('YYYY-MM-DD'))
    };

    mutation.mutate(fd);
  };

  return (
    <Box m="20px" sx={!isMobile ? { width: '80%' } : {}}>
      <Box display={'flex'} gap={4} sx={{ cursor: 'pointer' }}>
        <Header
          title={
            <Box onClick={e => setPropertyAnchorEl(e.currentTarget)}>
              Property {<span style={{ color: colors.greenAccent[500], textDecoration: 'underline' }}>{property?.property_name}'s</span>} Prices
            </Box>
          }
          subtitle="Property Prices Interactive Page"
        />
        <PropertySelector defaultValue={property} hideAnchor anchorEl={propertyAnchorEl} onClose={e => setPropertyAnchorEl(null)} onChange={setProperty} />
      </Box>

      <Calendar continuous={calendarContinuous}
        DayItem={({ date, isCurrentMonth, isToday, selected }) => {
          const momentDate = moment(date);
          const row = rows.find(t => moment(t.date).isSame(momentDate, 'date'));

          return (
            <Box position={'relative'} height={'12vh'} padding={'10px'} flexShrink={0}>
              <Box>{momentDate.date()}</Box>
              {!!row && (
                <Box>
                  <Box fontSize={'14px'} color={colors.greenAccent[200]}>
                    {row.price} ({row.price_currency})
                  </Box>
                  <Box sx={{ fontSize: '12px' }}>{availableStatus.find(t => t.value === row.available_status)?.icon}</Box>
                </Box>
              )}
            </Box>
          );
        }}
        onMonthChange={monthDate => setCurrentMonth(monthDate.clone())}
        onSelect={dates => {
          setSelectedDates(dates.map(d => moment(d)));
          delay(160).then(() => setOpenSelected(true));
        }}
        HeaderActions={
          <Box gap={'10px'} flex={1} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            <FormControlLabel control={<Switch color="info" onChange={ e => setCalendarContinuous(e.target.checked) } />} label="SELECT BY RANGE" />

            <ButtonRadios sx={{ height: 26 }} color="warning"
              options={[{ name: '-', value: '-' }].concat(availableStatus)} 
              valueKey={'value'} 
              value={ availableStatu } 
              onChange={ setAvailableStatu }
              LabeRender={ ({icon = '', name}) => name + icon }
              />
          </Box>
        }
      />

      <Confirm form title="CONFIRM TO UPDATE" open={openSelected} onCancel={e => setOpenSelected(false)} onConfirm={handleSubmit} loading={mutation.isPending}>
        <Typography variant='h3'>{currentMonth.format('YYYY-MM')}</Typography>

        <Box display="flex" flexWrap="wrap" marginTop={2} gap={2} width={560}>
          {selectedDates.map((date, i) =>
            <Chip key={i} variant="outlined" color={"info"} sx={{ color: colors.grey[100], fontSize: '18px' }} label={date.format('DD')}
              onDelete={e => {
                if (selectedDates.length === 1) {
                  setOpenSelected(false);
                } else {
                  setSelectedDates(selectedDates.filter((t, ti) => ti !== i));
                }
              }}
            />
          )}
        </Box>

        <Box mt={4}>
          <Typography variant="h6" sx={{ marginBottom: '10px', color: colors.grey[200] }}>🎈Filling in the blank (excluding 0) will be removed.</Typography>

          <TextField
            variant="filled"
            fullWidth
            value={formData.price}
            label={`Property Price (MYR)`}
            name={'price'}
            inputProps={{ type: 'number', min: 0, step: 0.01, autoComplete: 'off' }}
            InputLabelProps={{
              style: { color: colors.greenAccent[300] }
            }}
            sx={{ marginBottom: 2 }}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
          />

          <FormControl fullWidth variant="filled">
            <InputLabel style={{ color: colors.greenAccent[300] }}>Available Status</InputLabel>
            <Select
              value={formData.available_status}
              onChange={e => setFormData({ ...formData, available_status: e.target.value })}
              sx={{ marginBottom: 2 }}
            >
              {availableStatus.map(status => (
                <MenuItem key={status.value} value={status.value}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Confirm>
    </Box>
  );
};

export default PropertyPrices;
