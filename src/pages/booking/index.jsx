import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Box, useTheme, Button, Chip, Dialog, Menu, MenuItem, Divider, Checkbox } from "@mui/material";
import Header from 'src/components/Header';
import moment from 'moment';
import useSelectFields from './useSelectFields';
import FormItem from '../properties/formItem';
import { toGamel } from 'src/utils/Utils';
import { tokens } from "src/theme";
import useTopBarSearch from 'src/hooks/useTopBarSearch';
import { useBookings, useFormSubmit } from 'src/services/bookings';
import ImagePreview from 'src/components/Uploader/ImagePreview';
import PropertyImageCard from 'src/pages/properties/ImageCard';
import useToast from 'src/hooks/useToast';
import MyTable from "src/components/MyTable";
import BookingDetail from './detail';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Bookings() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const toast = useToast();

  const [previewImages, setPreviewImages] = useState([]);
  const [types, setTypes] = useState({ booking_status: '', check_in_status: '' });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentBooking, setCurrentBooking] = useState(null);
  const [bookingStatusAnchorEl, setBookingStatusAnchorEl] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);

  const typesFields = useSelectFields({
    fields: Object.keys(types),
    clearable: true,
    onFormChange: e => {
      const { name, value } = e.target;
      setTypes(prev => ({ ...prev, [name]: value }));
    }
  });

  const { paginate, setPaginate, isLoading, error, data = { rows: [], count: 0 } } = useBookings({
    ...types,
    searchKeyword
  });

  const { rows, count } = data;

  useTopBarSearch(keyword => {
    setSearchKeyword(keyword?.trim() || '');
  });

  useEffect(() => {
    if (!isLoading && count) {
      setPaginate(prev => ({ ...prev, total: count, pageCount: Math.ceil(count / prev.pageSize) }));
    }
  }, [isLoading, count]);

  useEffect(() => {
    if (error) {
      toast(error?.message || 'Load bookings failed');
    }
  }, [error, toast]);

  const mutation = useFormSubmit();

  const columns = [
    {
      field: "select", headerName: "", width: 50,
      renderCell: ({ row }) => (
        <Checkbox
          checked={selectedBookings.includes(row.id)}
          onChange={(e) => handleSelectBooking(e, row.id)}
        />
      )
    },
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "property", headerName: "Property", flex: 2, minWidth: 100, cellClassName: 'content-wrap',
      renderCell: ({ row: { property } }) => property ? (
        <PropertyImageCard width="80px" imageHeight="40px" previewImage property={property} />
      ) : ''
    },
    {
      field: "total_price", headerName: toGamel('total_price'), flex: 1.5, minWidth: 80, cellClassName: "name-column--cell",
      renderCell: ({ row }) => `${row.total_price} (${row.currency})`
    },
    { field: "number_of_guests", headerName: toGamel('number_of_guests'), minWidth: 120, flex: 1.5 },
    {
      field: "guest", headerName: "Guest", flex: 2, minWidth: 140, cellClassName: 'content-wrap',
      renderCell: ({ row }) => (
        <>
          <Box>{row.guest_full_name}</Box>
          <Box>Mobile No: {row.guest_mobile_no}</Box>
          <Box style={{ color: '#4fc1ff' }}>Email: {row.guest_email}</Box>
        </>
      )
    },
    {
      field: "booking_status", headerName: toGamel('booking_status'), minWidth: 120,
      renderCell: ({ row: { id, booking_status } }) => {
        const icon = { RESERVED: '⏯', CONFIRMED: "✅", CANCELLED: "⛔" }[booking_status];
        return (
          <Chip data-booking_status={booking_status} data-booking_id={id} sx={{ cursor: 'pointer', '&:hover': { border: `1px solid ${colors.red[400]}` } }}
            title={booking_status} variant="outlined" color='warning' size="small" label={`${booking_status} ${icon}`}
            onClick={e => setBookingStatusAnchorEl(e.currentTarget)}
          />
        );
      },
    },
    {
      field: "date", headerName: "Date Start/End", width: 100, cellClassName: 'content-wrap',
      renderCell: ({ row }) => (
        <Box title="Date">
          <Box>{moment(row.date_start).format('YYYY-MM-DD')}</Box>
          <Box textAlign={'center'}>~</Box>
          <Box>{moment(row.date_end).format('YYYY-MM-DD')}</Box>
        </Box>
      )
    },
    {
      field: "check_in", headerName: 'Status', width: 165, cellClassName: 'content-wrap',
      renderCell: ({ row: { id, check_in_status } }) => {
        const statusOption = typesFields.find(t => t.field === 'check_in_status');
        statusOption.options = statusOption.options.filter(t => !!t.value);

        return (
          <Box display={'flex'} flexDirection={'column'} gap={2}>
            <Box>
              <FormItem {...statusOption} onChange={e => handleCheckInStatusUpdate(e, id)} label="Status" sx={{ width: '100%' }} size="small" type="select" variant="outlined" value={check_in_status} />
            </Box>
          </Box>
        );
      },
    },
    {
      field: "booking_date", headerName: toGamel('booking_date'), minWidth: 90,
      renderCell: ({ row }) => (
        <Box>
          <Box>{moment(row.booking_date).format('YYYY-MM-DD')}</Box>
        </Box>
      )
    },
    {
      field: "actions", headerName: "Actions", flex: 1.5, minWidth: 90,
      renderCell: ({ row }) => (
        <Box lineHeight={1.4} display={'flex'} flexDirection={'column'} justifyContent={'center'} height="100%" gap={'10px'} sx={{ '& .pointer': { cursor: 'pointer' } }}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              padding: '3px 8px',
              backgroundColor: '#1976d2',
              color: '#fff',
              boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#115293',
              },
            }}
            onClick={() => setCurrentBooking(row)}
            size="small"
          >
            Detail
          </Button>
          {row.booking_status !== 'CANCELLED' && (
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                padding: '3px 8px',
                borderColor: '#d32f2f',
                color: '#d32f2f',
                '&:hover': {
                  borderColor: '#9a0007',
                  color: '#9a0007',
                  backgroundColor: 'rgba(154,0,7,0.1)',
                },
              }}
              onClick={() => window.confirm('Confirm to cancel the booking') && handleBookingStatusUpdate('CANCELLED', row.id)}
              size="small"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            color="warning"
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              padding: '3px 8px',
              backgroundColor: '#ff9800',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#f57c00',
              },
            }}
            onClick={() => handleDownloadReceipt(row)}
            size="small"
          >
            Download Receipt
          </Button>
        </Box>
      ),
    },    
  ];

  function handleCheckInStatusUpdate(e, id) {
    mutation.mutate({ id, check_in_status: e.target.value }, {
      onSuccess() {
        for (let row of rows) {
          if (row.id === id) {
            row.check_in_status = e.target.value;
            break;
          }
        }
      }
    });
  }

  function handleBookingStatusUpdate(status, id) {
    const booking_id = id || bookingStatusAnchorEl?.dataset?.booking_id;
    if (!+booking_id) {
      return toast('Invalid booking id');
    }
    mutation.mutate({ id: +booking_id, booking_status: status }, {
      onSuccess() {
        for (let row of rows) {
          if (row.id === +booking_id) {
            row.booking_status = status;
            break;
          }
        }
      }
    });
    setBookingStatusAnchorEl(null);
  }

  function generateReceiptContent(booking) {
    const {
      id, property, total_price, number_of_guests,
      guest_full_name, guest_mobile_no, guest_email,
      booking_date, check_in_status, booking_status, date_start, date_end
    } = booking;

    return [
      { title: "Booking ID", value: id || 'N/A' },
      { title: "Property", value: property ? property.name : 'N/A' },
      { title: "Total Price", value: total_price ? total_price : 'N/A' },
      { title: "Number of Guests", value: number_of_guests || 'N/A' },
      { title: "Guest", value: guest_full_name || 'N/A'},
      { title: "Guest Mobile No", value: guest_mobile_no || 'N/A' },
      { title: "Guest Email", value: guest_email || 'N/A' },
      { title: "Booking Date", value: moment(booking_date).format('YYYY-MM-DD') || 'N/A' },
      { title: "Check-in Status", value: check_in_status || 'N/A' },
      { title: "Booking Status", value: booking_status || 'N/A' },
      { title: "Date Start", value: moment(date_start).format('YYYY-MM-DD') || 'N/A' },
      { title: "Date End", value: moment(date_end).format('YYYY-MM-DD') || 'N/A' },
    ];
  }

  function handleDownloadReceipt(booking) {
    const doc = new jsPDF();
    const content = generateReceiptContent(booking);

    doc.text('Booking Receipt', 14, 22);
    doc.autoTable({
      startY: 28,
      head: [['Field', 'Value']],
      body: content.map(item => [item.title, item.value]),
      theme: 'grid'
    });

    doc.save(`Booking_Receipt_${booking.id}.pdf`);
  }

  function handleBulkDownloadReceipts() {
    selectedBookings.forEach((bookingId) => {
      const booking = rows.find(row => row.id === bookingId);
      if (booking) {
        handleDownloadReceipt(booking);
      }
    });
  }

  function handleSelectBooking(event, id) {
    setSelectedBookings((prevSelected) =>
      event.target.checked ? [...prevSelected, id] : prevSelected.filter((bookingId) => bookingId !== id)
    );
  }

  return (
    <Box m="20px">
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap'} gap={2}>
        <Header title="Bookings" subtitle="List of Bookings" />
        <Box display={'flex'} gap={1} marginRight={2} flexWrap={'wrap'}>
          {selectedBookings.length > 0 && (
            <Button
              variant="contained"
              color="warning"
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                backgroundColor: '#ff9800',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#f57c00',
                },
              }}
              onClick={handleBulkDownloadReceipts}
            >
              Download Selected Receipts
            </Button>
          )}
          {Object.values(types).filter(Boolean).length > 0 && (
            <Button color="error" variant="outlined" onClick={() => setTypes({})}>Clear Filters ❌</Button>
          )}
          {typesFields.map(t => (
            <FormItem key={t.field} value={types[t.field]} size="small" variant="outlined" label={t.label} type="select" options={t.options} sx={{ width: '140px' }} name={t.field} onChange={t.onChange} />
          ))}
        </Box>
      </Box>

      <MyTable
        isLoading={isLoading}
        paginate={paginate}
        columns={columns}
        rows={rows}
        rowHeight={120}
        onPageChange={page => setPaginate(paginate => ({ ...paginate, page }))}
        onRowSelectionChange={(selectedRows) => setSelectedBookings(selectedRows)}
      />

      {previewImages.length ? <ImagePreview files={previewImages} onClose={() => setPreviewImages([])} currentIndex={0} /> : null}

      <Dialog open={!!currentBooking} onClose={() => setCurrentBooking(null)}>
        <Box padding={2}>
          {currentBooking && <BookingDetail booking={currentBooking} />}
        </Box>
      </Dialog>

      <Menu
        component="nav"
        id="booking-status-menu"
        MenuListProps={{
          'aria-labelledby': 'booking-status-button',
        }}
        anchorEl={bookingStatusAnchorEl}
        open={!!bookingStatusAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        onClose={() => setBookingStatusAnchorEl(null)}
      >
        {bookingStatusAnchorEl && (
          <Typography variant="h5" sx={{ padding: 1 }} color={colors.blueAccent[200]} fontWeight={'bold'}>
            Update Booking Status
          </Typography>
        )}
        {typesFields.find(t => t.field === 'booking_status').options.map((t, i) => (
          ['CONFIRMED', 'CANCELLED'].includes(t.value) && (
            <Box key={i} padding={1} sx={{ '& .MuiMenuItem-root.Mui-selected': { backgroundColor: colors.grey[400] } }}>
              {i > 0 && <Divider />}
              <MenuItem
                key={t.name}
                selected={t.value === bookingStatusAnchorEl?.dataset?.booking_status}
                onClick={() => handleBookingStatusUpdate(t.value)}
              >
                {t.value}
              </MenuItem>
            </Box>
          )
        ))}
      </Menu>
    </Box>
  );
}
