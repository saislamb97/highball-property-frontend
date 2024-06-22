import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Alert, Button, useTheme, Chip, Popover, Divider, Typography, TextField } from "@mui/material";
import Header from "../../components/Header";
import { useProperties } from "src/services/properties";
import { asset, toGamel, ellipsis } from "src/utils/Utils";
import { EditOutlined, BookOnline, PriceChange } from "@mui/icons-material";
import useTopBarSearch from "src/hooks/useTopBarSearch";
import ImagePreview from "src/components/Uploader/ImagePreview";
import useSelectFields from "./useSelectFields";
import FormItem from "./formItem";
import PropertyImageCard from './ImageCard';
import MyTable from "src/components/MyTable";
import useTableColumnsByRole from "src/hooks/useTableColumnsByRole";

const Properties = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [gmap, setGmap] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  useTopBarSearch(keyword => {
    setSearchKeyword(keyword?.trim() || '');
  });

  const [types, setTypes] = useState({
    furnish_type: '', view_type: '', owner_id: ''
  });

  const typesFields = useSelectFields({ 
    clearable: true,
    onFormChange: e => {
      const { name, value } = e.target;
      setTypes(prev => ({ ...prev, [name]: value }));
    }
  });

  const { paginate, setPaginate, isLoading, error, data, refetch } = useProperties({ ...types, searchKeyword });
  const { rows, count } = data || { rows: [], count: 0 };

  useEffect(() => {
    if (count) {
      setPaginate({ ...paginate, total: count, pageCount: Math.ceil(count / paginate.pageSize) });
    }
  }, [count]);

  useEffect(() => {
    refetch();
  }, [types, searchKeyword]);

  if (error) {
    setMessage({ state: 'error', text: error.message || 'Load properties failed!' });
  }

  const [previewImages, setPreviewImages] = useState([]);
  const handleImagePreview = images => {
    setPreviewImages(images.map(t => ({ url: asset(t.image_url) })));
  };

  const columns = useTableColumnsByRole([
    { field: "id", headerName: "ID", align: 'left', resizable: false, width: 60 },
    { field: "property", headerName: "Name", width: 150, minWidth: 120, cellClassName: 'content-wrap',
      renderCell: ({ row }) => <PropertyImageCard width="90px" imageHeight="60px" previewImage property={row} />
    },
    { field: "owner", headerName: "Owner", minWidth: 140, cellClassName: 'content-wrap',
      renderCell: ({ row }) => 
        row.owner 
         ? <>
            <Typography variant="body2">{ row.owner.username }</Typography>
            <Typography variant="caption" color="textSecondary">{ row.owner.email }</Typography>
           </>
         : '-'
    },
    { field: "description", headerName: "Description", width: 180, cellClassName: 'content-wrap',
      renderCell: ({ row }) =>
      <>
        <Typography variant="body2" title={ row.description }>{ ellipsis(row.description, 30) }</Typography>
      </>
    },
    { field: "number_of", headerName: "Number Of", width: 100, cellClassName: 'content-wrap',
      renderCell: ({ row }) =>
      <>
        <Box title="Room">Room: { row.number_of_rooms }</Box> <Divider/>
        <Box title="Parking">Parking: { row.number_of_parking }</Box> <Divider/>
        <Box title="Toilets">Toilets: { row.number_of_toilets }</Box>
      </>
    },
    { field: "unit_number", headerName: "Unit Number", width: 120, cellClassName: 'content-wrap',
      valueFormatter: v => v || '-'
    },
    { field: "posted_date", headerName: "Posted Date", width: 120,
      renderCell: ({ row }) =>
        <Typography variant="body2" title="Posted Date">{ new Date(row.posted_date).toLocaleDateString() }</Typography>
    },
    { field: "type", headerName: "Type Of", width: 200, cellClassName: 'content-wrap',
      renderCell: ({ row }) =>
      <>
        <Box title={ toGamel('view_type') }>View: { row.view_type }</Box> <Divider/>
        <Box title={ toGamel('furnish_type') }>Furnish: { row.furnish_type }</Box> <Divider/>
      </>
    },
    {
      field: "Associations",
      headerName: "Associations",
      width: 350,
      cellClassName: 'content-wrap',
      renderCell: ({ row }) => {
        const actions = [
          {
            name: 'Prices',
            icon: <PriceChange />,
            color: 'warning',
            variant: 'filled',
            handle: e => navigate(`/propertyPrices?property_id=${row.id}`)
          },
          {
            name: 'Booking',
            icon: <BookOnline />,
            color: 'success',
            variant: 'filled',
            handle: e => navigate(`/booking-form?property_id=${row.id}`)
          },
          {
            name: 'Edit',
            icon: <EditOutlined />,
            color: 'info',
            handle: e => navigate(`/property-form?id=${row.id}`)
          }
        ].filter(Boolean);
    
        return (
          <Box
            lineHeight={1.5}
            display='flex'
            gap={1}
            flexWrap='wrap'
            justifyContent='left'
            sx={{ '& .pointer': { cursor: 'pointer' } }}
          >
            {actions.map(t => (
              <Chip
                key={t.name}
                icon={t.icon}
                variant={t.variant || "outlined"}
                color={t.color}
                label={t.name}
                size="small"
                sx={{ height: "22px" }}
                className="pointer"
                onClick={t.handle}
                data-rowid={row.id}
              />
            ))}
          </Box>
        )
      }
    },
  ]);

  return (
    <Box m="20px">
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap'} gap={2} mb={2}>
        <Header
          title="PROPERTIES"
          subtitle="List of Properties for Future Reference"
          sx={{ marginBottom: 0, flex: 1 }}
        />
        
        <Box display={'flex'} gap={1} marginRight={2} flexWrap={'wrap'}>
          { Object.values(types).filter(Boolean).length > 0 && 
            <Button color="error" variant="outlined" onClick={ e => setTypes({}) }>Clear Filters ❌</Button> 
          }
          { typesFields.map(t => 
            <FormItem key={t.field} value={ types[t.field] } size="small" variant="outlined" label={ t.label } type="select" options={t.options} sx={{ width: '130px' }} name={t.field} onChange={t.onChange}/>
          )}
        </Box>

        {
          <Link to="/property-form" style={{ textDecoration: "none" }}>
            <Button color="success" variant="contained" sx={{ marginRight: "12px" }} >
              Create Property
            </Button>
          </Link>
        }
      </Box>

      {message?.text && (
        <Box mb={2} width="66%">
          <Alert variant="filled" severity={ message.state || "error" }>
            {message.text}
          </Alert>
        </Box>
      )}

      <MyTable isLoading={isLoading} paginate={paginate} columns={columns} rows={rows} 
        rowHeight={120}
        onPageChange={page => setPaginate({ ...paginate, page })}
      />

      <Popover
        anchorEl={ gmap?.anchorEl }
        open={ Boolean(gmap) }
        onClose={ e => setGmap(null) }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{ '& .MuiModal-backdrop': { backgroundColor: 'rgba(0, 0, 0, .3)' } }}
      >
      </Popover>

      { previewImages.length ? <ImagePreview files={previewImages} onClose={ e => handleImagePreview([]) } currentIndex={0}/> : '' }
    </Box>
  );
};

export default Properties;
