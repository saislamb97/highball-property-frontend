import { useEffect, useState } from 'react';
import { Box, Button, Chip, Dialog, Checkbox } from "@mui/material";
import Header from 'src/components/Header';
import moment from 'moment';
import useSelectFields from './useSelectFields';
import FormItem from '../properties/formItem';
import { toGamel } from 'src/utils/Utils';
import useTopBarSearch from 'src/hooks/useTopBarSearch';
import { usePayments } from 'src/services/payments';
import ImagePreview from 'src/components/Uploader/ImagePreview';
import useToast from 'src/hooks/useToast';
import PropertyImageCard from 'src/pages/properties/ImageCard';
import MyTable from 'src/components/MyTable';
import BookingDetail from '../booking/detail';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Payments() {
  const toast = useToast();
  const [previewImages, setPreviewImages] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [types, setTypes] = useState({ payment_status: '' });
  const [selectedPayments, setSelectedPayments] = useState([]);

  const typesFields = useSelectFields({
    clearable: true,
    onFormChange: e => {
      const { name, value } = e.target;
      setTypes(prevTypes => ({ ...prevTypes, [name]: value }));
    }
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  useTopBarSearch(keyword => {
    setSearchKeyword(keyword?.trim() || '');
  });

  const { paginate, setPaginate, isLoading, error, data = { rows: [], count: 0 }, refetch } = usePayments({
    payment_status: types.payment_status,
    searchKeyword
  });

  const rows = data.rows || [];
  const count = data.count || 0;

  useEffect(() => {
    if (!isLoading && count) {
      setPaginate(prevPaginate => ({
        ...prevPaginate,
        total: count,
        pageCount: Math.ceil(count / prevPaginate.pageSize)
      }));
    }
  }, [isLoading, count, paginate.pageSize]);

  if (error) {
    toast(error.message);
    return <Box>Error loading payments.</Box>;
  }

  const handleDownloadReceipt = (payment) => {
    const doc = new jsPDF();
    const content = generateReceiptContent(payment);

    doc.text('Payment Receipt', 14, 22);
    doc.autoTable({
      startY: 28,
      head: [['Field', 'Value']],
      body: content.map(item => [item.title, item.value]),
      theme: 'grid'
    });

    doc.save(`Payment_Receipt_${payment.id}.pdf`);
  };

  const handleBulkDownloadReceipts = () => {
    selectedPayments.forEach((paymentId) => {
      const payment = rows.find(row => row.id === paymentId);
      if (payment) {
        handleDownloadReceipt(payment);
      }
    });
  };

  const handleSelectPayment = (event, id) => {
    setSelectedPayments((prevSelected) =>
      event.target.checked ? [...prevSelected, id] : prevSelected.filter((paymentId) => paymentId !== id)
    );
  };

  const generateReceiptContent = (payment) => {
    const {
      id, user, property, booking, amount, discount, tax_fee, payment_status, created_at
    } = payment;

    return [
      { title: "Payment ID", value: id || 'N/A' },
      { title: "Property", value: property ? property.name : 'N/A' },
      { title: "Booking", value: booking ? booking.guest_email : 'N/A' },
      { title: "Amount", value: amount || 'N/A' },
      { title: "Discount", value: discount || 'N/A' },
      { title: "Tax Fee", value: tax_fee || 'N/A' },
      { title: "Payment Status", value: payment_status || 'N/A' },
      { title: "Created At", value: moment(created_at).format('YYYY-MM-DD HH:mm') || 'N/A' },
    ];
  };

  const columns = [
    {
      field: "select", headerName: "", width: 50,
      renderCell: ({ row }) => (
        <Checkbox
          checked={selectedPayments.includes(row.id)}
          onChange={(e) => handleSelectPayment(e, row.id)}
        />
      )
    },
    { field: "id", headerName: "ID", width: 40 },
    {
      field: "property", headerName: "Property", flex: 3, cellClassName: 'content-wrap',
      renderCell: ({ row: { property } }) => property ? (
        <PropertyImageCard width="80px" imageHeight="40px" previewImage property={property} />
      ) : '-',
    },
    {
      field: "booking", headerName: "Booking", flex: 3, cellClassName: 'content-wrap',
      renderCell: ({ row: { property, booking } }) => booking ? (
        <Button color='info' sx={{ display: 'flex', flexDirection: 'column' }} onClick={() => setCurrentBooking({ ...booking, property })}>
          <Box>{booking.guest_full_name}</Box>
          <Box>{booking.guest_email}</Box>
          <Box>{booking.date_start} ~ {booking.date_end}</Box>
        </Button>
      ) : '-'
    },
    {
      field: "financial_info",
      headerName: "Financial Info",
      flex: 2,
      cellClassName: 'content-wrap',
      renderCell: ({ row }) => (
        <Box>
          <Box>{row.amount}</Box>
          <Box>Discount: {row.discount}</Box>
          <Box>Tex: {row.tax_fee} %</Box>
        </Box>
      ),
    },    
    {
      field: "payment_status", headerName: toGamel('status'), width: 120, cellClassName: 'content-wrap',
      renderCell: ({ row: { payment_status } }) => {
        const icon = { PENDING: '⏳', PAID: "✅", CANCELLED: '🚫' }[payment_status];
        return payment_status ? (
          <Chip title={payment_status} variant="outlined" color='warning' size="small" label={`${payment_status} ${icon}`} />
        ) : '-';
      },
    },
    {
      field: "date", headerName: "CreatedAt", width: 120, cellClassName: 'content-wrap',
      renderCell: ({ row }) => <Box>{moment(row.created_at).format('YYYY-MM-DD HH:mm')}</Box>
    },
    {
      field: "actions", headerName: "Actions", flex: 1.5, width: 120, cellClassName: 'content-wrap',
      renderCell: ({ row }) => (
        <Box lineHeight={1.4} display={'flex'} flexDirection={'column'} justifyContent={'center'} height="100%" gap={'10px'} sx={{ '& .pointer': { cursor: 'pointer' } }}>
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

  return (
    <Box m="20px">
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap'} gap={2}>
        <Header sx={{ flex: 1, marginBottom: 0 }} title="Payments" subtitle="List of Payments" />
        <Box display={'flex'} gap={1} marginRight={2} flexWrap={'wrap'}>
          {selectedPayments.length > 0 && (
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
          {typesFields.map(t => (
            <FormItem key={t.field} value={types[t.field]} size="small" variant="outlined" label={t.label} type="select" options={t.options} sx={{ width: '150px' }} name={t.field} onChange={t.onChange} />
          ))}
        </Box>
      </Box>
      <MyTable isLoading={isLoading} paginate={paginate} columns={columns} rows={rows} rowHeight={120} onPageChange={page => setPaginate(prevPaginate => ({ ...prevPaginate, page }))} />
      {previewImages.length ? <ImagePreview files={previewImages} onClose={() => setPreviewImages([])} currentIndex={0} /> : ''}
      <Dialog open={!!currentBooking} onClose={() => setCurrentBooking(null)}>
        <Box padding={2}>
          {!!currentBooking && <BookingDetail booking={currentBooking} />}
        </Box>
      </Dialog>
    </Box>
  );
}
