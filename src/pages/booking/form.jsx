import { useState, useEffect, useMemo } from "react";
import { useTheme, Box, Button } from "@mui/material";
import { tokens } from "src/theme";
import { Stepper, Step, StepButton, Typography, CircularProgress } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "src/components/Header";
import moment from "moment";
import { toGamel, delay } from "src/utils/Utils";
import FormItem from "src/pages/properties/formItem";
import PropertySelector from "./PropertySelector";
import useToast from "src/hooks/useToast";
import { minus, plus } from "src/utils/money";
import CalendarRangeSelector from "src/components/Calendar/RangeSelector";
import { usePricesByDateRange } from "src/services/propertyPrices";
import { useFormSubmit } from "src/services/bookings";
import PropertyImageCard from "src/pages/properties/ImageCard";
import BookingDetail from "./detail";
import useSelectFields from "./useSelectFields";
import useLocationQuery from "src/hooks/useLocationQuery";

const BookingForm = () => {
  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery("(min-width:600px)");

  const toast = useToast();

  const [steps] = useState(['Select Date', 'Tenant Info', 'Confirm Booking', 'Confirm Payment'])
  const [stepIndex, setStepIndex] = useState(0);

  const [propertySelectShow, setPropertySelectShow ] = useState(false);
  const property_id = useLocationQuery('property_id', 'number');
  const [property, setProperty] = useState(property_id ? { id: property_id } : null);

  const [dateRange, setDateRange] = useState([]);
  const [propertyAnchorEl, setPropertyAnchorEl] = useState(null);

  const [formData, setFormData] = useState({
    guest_full_name: '',
    guest_email: '',
    date_start: '',
    date_end: '',
    total_price: '',
    guest_mobile_no: '',
    number_of_guests: '',
    property_id: property?.id || 0,
    booking_status: 'CONFIRMED',
    payment_status: 'PAID',
    discount: 0,
    tax_fee: 0
  })

  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    discount: formData.discount ?? 0,
    tax_fee: formData.tax_fee ?? 0,
  })

  const [months, setMonths] = useState([moment(), moment().add(1, 'month')])
  const { isRefetching: propertyPricesByMonthsLoading, data: propertyPricesByMonths = [] } = usePricesByDateRange({ 
    property_id: property?.id,
    dateRange: [ 
      months[0].format('YYYY-MM-01'),
      months[1].format(`YYYY-MM-${months[1].daysInMonth()}`)
    ]
  }, {
    enabled: Boolean(property?.id && stepIndex === 0),
    refetchOnMount: true
  })

  const { data: pricesByDataRange = [] } = usePricesByDateRange({ property_id: property?.id, dateRange })

  const propertyPricesTotal = useMemo(() => 
    pricesByDataRange.reduce((sum, p) => plus(sum, p.price), 0)
  , [pricesByDataRange])

  const validateFormData = function() {
    if (!property) {
      toast('No Property Selected')
      return false
    }
    if (!dateRange.length) {
      toast('No Date Range Selected')
      return false
    }
    if (!pricesByDataRange.length) {
      toast('There are no available prices within this date range')
      return false
    }
    return true
  }

  const handleStepSet = newStepIndex => {
    if (stepIndex === 0 && newStepIndex === 1) {
      if (!validateFormData()) return
      formData.property_id = property?.id;
      formData.date_start = dateRange[0];
      formData.date_end = dateRange[1];
      formData.total_price = propertyPricesTotal
      setFormData({ ...formData })
    }
    setStepIndex(newStepIndex)
  }

  useEffect(() => {
    const { tax_fee, discount, total_price } = formData
    setPaymentFormData({
      amount: total_price,
      discount,
      tax_fee,
    })
  }, [formData])

  const handleFormChange = (e, setter = setFormData) => {
    const { name, value } = e.target;
    setter(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const mutation = useFormSubmit({
    onSuccess: () => {
      toast('success!', 1)
      delay(1500).then(_ => window.history.go(-1))
    },
    onError: () => {
      toast(mutation.error?.message || 'request failed', -1)
    }
  })

  const handleFormSubmit = async e => {
    e.preventDefault()
    
    if (!validateFormData()) return

    if (mutation.isPending) {
      return toast('Submiting')
    };

    mutation.mutate(formData);
  }


  const selectFieldsKeys = ['number_of_guests', 'booking_status', 'payment_status']

  const textFields = useMemo( 
    _ => Object.keys(formData).map(field => {
      const item = { type: 'text', field, required: true, label: toGamel(field), onChange: e => handleFormChange(e) }
      if ([...selectFieldsKeys, 'property_id', 'date_start', 'date_end', 'total_price'].includes(field)) {
        return false;
      }
      return item
    }).filter(Boolean), 
    []
  )

  const selectFieldsFromRemote = useSelectFields({ onFormChange: handleFormChange })

  const selectFields = useMemo(
    _ => selectFieldsKeys.map(field => {
      const item = { type: 'select', field, required: true, label: toGamel(field), onChange: e => handleFormChange(e) }
      if (field === 'number_of_guests') {
        item.options = [1,2,3,4,5,6,7,8,9,10].map(t => ({ name: t, value: t }))
      }
      else {
        item.options = selectFieldsFromRemote.find(t => t.field === field)?.options
      }
      return item
    }), 
    [selectFieldsFromRemote]
  )

  const boxProps = {
    display: 'flex', flexWrap: 'wrap', gap: '30px',
    width: isMobile ? '100%' : '70%',
    autoComplete: 'off',
    sx: {
      '& .MuiTextField-root': { m: 1, width: '41.3ch' },
    }
  }

  return (
    <Box m="20px">
      <Header title="CREATE BOOKING" subtitle="Create a New Booking" />
      
      <Box mb={2}>
        <Stepper nonLinear activeStep={stepIndex}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepButton>
                <Typography variant='h4'>{label}</Typography>
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
      
        { stepIndex === 0 && <Box display={'flex'} flexDirection={'column'}>
          <Box display={'flex'} alignItems={'center'} gap={2}>
            { property && 
              <PropertyImageCard property={property} onClick={ e => setPropertyAnchorEl(e.currentTarget) }/>
            }
            <PropertySelector defaultValue={ property } hideAnchor anchorEl={ propertyAnchorEl } onClose={e => setPropertyAnchorEl(null)} onChange={ e => setProperty(e) }/>
            <Box width={'100%'}>
              <Box display={'flex'} gap={2}>
                <Typography variant="h4">📅 { dateRange.join(' ~ ') }</Typography>
                <Typography variant="h4">💰 Total Prices: { propertyPricesTotal }</Typography>
              </Box>
              <PropertyPriceList loading={propertyPricesByMonthsLoading} data={ pricesByDataRange || [] }/>
            </Box>
          </Box>
          
          <Box display={'flex'} gap={'10px'} marginTop={2} minWidth={'400px'}
            sx={{ 
              '& .MuiGrid2-root': { backgroundColor: colors.primary[400] },
              '& .MuiInputBase-root': { backgroundColor: colors.blueAccent[800] },
              '& .MuiListItemText-primary': { color: colors.grey[100] },
            }}
            >

            <CalendarRangeSelector onChange={range => setDateRange(range)} onMonthChange={ setMonths }
              DayItem={ ({ date }) => {
                const priceRow = propertyPricesByMonths.find(t => t.date === date && t.available_status === 'AVAILABLE')
                return <Box>
                  <Box>{date.slice(-2)}</Box>
                  { priceRow && <Box fontSize={'12px'} fontWeight={'normal'} color={colors.blueAccent[100]}>{ priceRow.price }</Box> }
                </Box>
              }}
              />
          </Box>

          <Box marginTop={2} alignSelf={'flex-end'}>
            <Button color="secondary" variant="contained" onClick={e => { 
              dateRange.length 
                ? handleStepSet(1) 
                : toast('Please Select The Date Range', 0) 
              }}
              >Next</Button>
          </Box>
        </Box>
        }
        
        { stepIndex === 1 && <Box width={ isMobile ? '100%' : '70%' }>
          <Box m={1} mb={2} display={'flex'} gap={2}>
            { property && 
                <PropertyImageCard property={property} onClick={ e => { setPropertySelectShow(_ => true);handleStepSet(0) } }/>
            }

            <Box width={'100%'}>
              <Box display={'flex'} gap={2}>
                <Typography variant="h4">📅 { dateRange.join(' ~ ') }</Typography>
                <Typography variant="h4">💰 Total Prices: { propertyPricesTotal }</Typography>
              </Box>
              <PropertyPriceList loading={propertyPricesByMonthsLoading} data={ pricesByDataRange || [] }/>
            </Box>

          </Box>
          <form onSubmit={ e => { e.preventDefault();handleStepSet(2) } }>

            <Box { ...boxProps }>
              { textFields.slice(0, -2).map(item => 
                <FormItem size="small" value={ formData[item.field] } key={item.field} InputProps={{ autoComplete: 'off' }} { ...item } />
              )}
            </Box>
            
            <Box {...boxProps} mt={4}>
              { selectFields.slice(0, -2).map(item => 
                <FormItem size="small" value={ formData[item.field] } key={item.field} { ...item } />
              )}
            </Box>
            <Box {...boxProps} mt={4}>
              { selectFields.slice(-2).map(item => 
                <FormItem size="small" value={ formData[item.field] } key={item.field} { ...item } />
              )}
            </Box>
            
            <Box { ...boxProps } mt={4}>
              { textFields.slice(-2).map(item => 
                <FormItem size="small" value={ formData[item.field] } key={item.field} InputProps={{ autoComplete: 'off' }} { ...item } required={false} type="number" step="0.01"/>
              )}
            </Box>

            <Box display="flex" justifyContent="end" mt="20px">
              <Button color="info" variant="contained" sx={{ marginRight: "20px" }} onClick={e => handleStepSet(0)}>Back</Button>

              <Button type="submit" color="secondary" variant="contained">
                Confirm Tenant Info
              </Button>
            </Box>
          </form>
        </Box>
        }

        { stepIndex === 2 && <Box>
          <Box>
            <Box m={1} mb={2} display={'flex'} gap={2}>
              { property && 
                  <PropertyImageCard property={property} onClick={ e => { setPropertySelectShow(_ => true);handleStepSet(0) } }/>
              }

              <Box width={'100%'}>
                <Box display={'flex'} gap={2}>
                  <Typography variant="h4">📅 { dateRange.join(' ~ ') }</Typography>
                  <Typography variant="h4">💰 Total Prices: { propertyPricesTotal }</Typography>
                </Box>
                <PropertyPriceList loading={propertyPricesByMonthsLoading} data={ pricesByDataRange || [] }/>
              </Box>

            </Box>
            <BookingDetail booking={{ property, ...formData }} />
          </Box>

          <Box display="flex" justifyContent="end" mt="20px">
            <Button color="info" variant="contained" sx={{ marginRight: "20px" }} onClick={e => handleStepSet(1)}>Back</Button>

            <Button onClick={ e => handleStepSet(3) } color="secondary" variant="contained">
              Confirm Booking
            </Button>
          </Box>
        </Box>
        }

        { stepIndex === 3 && <Box>
          <Box>
            <Box m={1} mb={2} display={'flex'} gap={2}>
              { property && 
                  <PropertyImageCard property={property} onClick={ e => { setPropertySelectShow(_ => true);handleStepSet(0) } }/>
              }

              <Box width={'100%'}>
                <Box display={'flex'} gap={2}>
                  <Typography variant="h4">📅 { dateRange.join(' ~ ') }</Typography>
                  <Typography variant="h4">💰 Total Prices: { propertyPricesTotal }</Typography>
                </Box>
                <PropertyPriceList loading={propertyPricesByMonthsLoading} data={ pricesByDataRange || [] }/>
              </Box>

            </Box>
            
            <BookingDetail booking={{ property, ...paymentFormData }} />
          </Box>

          <Box display="flex" justifyContent="end" mt="20px">
            <Button color="info" variant="contained" sx={{ marginRight: "20px" }} onClick={e => handleStepSet(2)}>Back</Button>

            <Button onClick={ handleFormSubmit } color="secondary" variant="contained">
              Confirm Payment
            </Button>
          </Box>
        </Box>
        }
    </Box>
  );
};

export default BookingForm;


function PropertyPriceList({ loading, data = [] }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    { k: 'date', t: '📅Date' },
    { k: 'price', t: '💰Price', },
  ]

  return <Box overflow={'auto'} position={'relative'}>
    { loading && <Box display={'flex'} justifyContent={'center'} alignItems={'center'} position={'absolute'} top={0} left={0} width={'100%'} height={'110px'} zIndex={2}>
      <CircularProgress color="info"/>
    </Box>
    }
    <Box display={'flex'} flexDirection={'column'} mt={2} overflow={'visible'} width={'100%'}>
      { columns.map((column, i) => (
        <Box key={column.k} display={'flex'} overflow={'visible'} pt={.7} pb={.7} borderTop={`1px solid ${colors.blueAccent[800]}`}>
          <Box flexShrink={0} flexBasis={'90px'}>{column.t}</Box>
          {data.map(item => (
            <Box key={item.id} flexShrink={0} flexBasis={'90px'} textAlign={'center'}>{ item[column.k] }</Box>
          ))}
          { !data.length && 
            <Box textAlign={'center'} flexShrink={0} width={'200px'} color={colors.grey[300]}>{ i === 1 && 'No Prices' }</Box>
          }
        </Box>
      ))}
    </Box>
  </Box>
}
