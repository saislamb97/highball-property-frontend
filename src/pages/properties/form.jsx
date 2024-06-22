import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, useTheme, Stack } from "@mui/material";
import Skeleton from '@mui/material/Skeleton';
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import Header from "../../components/Header";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import FormItem from "./formItem";
import useIsMobile from "src/hooks/useIsMobile";
import { useProperty, useFormSubmit } from "src/services/properties";
import { delay, toGamel } from "src/utils/Utils";
import Uploader from 'src/components/Uploader';
import useSelectFields from "./useSelectFields";
import useToast from "src/hooks/useToast";
import useLocationQuery from "src/hooks/useLocationQuery";

const PropertyForm = () => {
  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const isMobile = useIsMobile();

  const toast = useToast({ autoHideDuration: 2000 });

  const [property, setProperty] = useState(null);
  const [message, setMessage] = useState({ text: '', state: 'error' });
  const [submiting, setSubmiting] = useState(false);
  const [formData, setFormData] = useState({
    property_name: "",
    description: '',
    number_of_rooms: '',
    number_of_parking: '',
    number_of_toilets: '',
    unit_number: '',
    view_type: '',
    posted_date: '',
    furnish_type: '',
    owner_id: '',
    images: []
  });

  const id = useLocationQuery('id', 'number');

  const { isLoading: loading, error, data, refetch } = useProperty({ id })

  useEffect(() => {
    if (id && !loading) { 
      if (data) {
        setProperty({ ...data });
        Object.keys(formData).forEach(k => {
          formData[k] = data[k] || ''
          if (k === 'imageIds') {
            formData[k] = data.images.map(t => t.id)
          }
        })
        setFormData({ ...formData });
      } else {
        setMessage({ text: 'Property not found', state: 'error' })
      }
    }
    if (error) {
      setMessage({ text: error?.message || 'Get Property Failed !', state: 'error' })
    }
  }, [id, loading]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const mutation = useFormSubmit({
    onSuccess: () => {
      toast('success!', 1)
      refetch()
      delay(1500).then(_ => window.history.go(-1))
    },
    onError: () => {
      toast(mutation.error?.message || 'request failed', -1)
    }
  })

  const handleFormSubmit = async e => {
    e.preventDefault()

    if (mutation.isPending) {
      return toast('Submiting')
    };

    if (id) {
      formData.id = id
    }

    mutation.mutate(formData);
  }

  const selectFields = useSelectFields({ onFormChange: handleFormChange })
  
  const positionFields = []
  const textFields = useMemo( _ => Object.keys(formData).map(field => {
      const item = { type: 'text', field, required: true, label: toGamel(field), onChange: handleFormChange }
      if (field === 'description') {
        item.rows = 3
      }
      if (['number_of_parking', 'number_of_rooms', 'number_of_toilets'].includes(field)) {
        item.type = 'select'
        item.options = [1,2,3,4,5,6,7,8].map(p => ({ name: p, value: p }))
      }
      if (['posted_date'].includes(field)) {
        item.type = 'date'
      }
      if ([...selectFields.map(f => f.field), ...positionFields.map(f => f.field), 'images' ].includes(field)) {
        return false;
      }
      return item
    }).filter(Boolean), 
    [selectFields, positionFields]
  )

  const boxProps = {
    mt: 3,
    display: 'flex', flexWrap: 'wrap', gap: '30px',
    width: isMobile ? '100%' : '70%',
    autoComplete: 'off',
    sx: {
      '& .MuiTextField-root': { m: 1, width: '40%' },
    }
  }

  return ( 
    <Box m="20px" pb="10px">
      <Header
        title={`${property ? "UPDATE Property" : "CREATE Property"}`}
        subtitle={`${
          property ? "Update existing Property" : "Create a New Property"
        }`}
      />
      
      { !loading ? (
      <form onSubmit={handleFormSubmit}>
        { (!id || property) && <Box { ...boxProps } display={'flex'} flexDirection={'column'} maxWidth={'60%'} m={1} mt={0} p={2} borderRadius={2} border={ `2px dashed ${colors.primary[200]}` }>
          <Typography variant='h5' lineHeight={1}>Poster And Images</Typography>
          <Uploader remotePath="/properties" 
            defaultValue={ property?.images ? property.images.map(t => ({ ...t, url: t.image_url })) : [] }
            removeOnServer={ !property?.id }
            onChange={ files => setFormData({ ...formData, images: files.map(f => ({ id: f.serverId, image_url: f.serverUrl })) }) }
            onRemove={ file => !!file.serverImage?.property_image }
          />
        </Box>
        }

        <Box { ...boxProps }>
          { textFields.slice(0, 2).map(item => <FormItem value={formData[item.field]} key={item.field} { ...item }/>) }
        </Box>

        <Box { ...boxProps } sx={{
          '& .MuiTextField-root': { m: 1, width: 'calc(80% + 46px)' },
        }}>
          { textFields.slice(2, 4).map(item => <FormItem value={formData[item.field]} key={item.field} { ...item }/>) }
        </Box>

        <Box { ...boxProps }>
          { textFields.slice(4).map(item => <FormItem value={formData[item.field]} key={item.field} { ...item }/>) }
        </Box>

        <Box { ...boxProps }>
          { selectFields.map(item => <FormItem value={formData[item.field]} key={item.field} select { ...item }/>) }
        </Box>

        <Box { ...boxProps }>
          { positionFields.map(item => 
            <FormItem  
              InputProps={{ autoComplete: 'off' }} 
              value={formData[item.field]} 
              key={item.field} 
              { ...item }
              />
          ) }
        </Box>
        
        <Box { ...boxProps } mb={10} justifyContent="flex-end" >
          <LoadingButton
            loading={submiting}
            loadingPosition="start"
            startIcon={<SaveIcon/>}
            type="submit"
            color="secondary"
            variant="contained"
          >
            {property ? "Update Property" : "Create New Property"}
          </LoadingButton>
          <Link to="/properties" style={{ textDecoration: "none" }}>
            <Button color="info" variant="contained">Back </Button>
          </Link>
        </Box>
      </form>
      ) : (
        <Stack spacing={4} mt={4}>
          { Array(2).fill().map((_, i) => 
            <>
              <Skeleton key={i} variant="rectangular" width={300} height={50}/>
              <Skeleton key={i + 2} variant="rectangular" width={isMobile ? '100%' : '70%'} height={50}/>
            </>)
          }
          <Skeleton variant="rectangular" width={isMobile ? '100%' : '70%'} height={50}/>
          <Skeleton variant="rounded" width={isMobile ? '100%' : '70%'} height={'30vh'} />
        </Stack>
      )}
    </Box>
  );
};

export default PropertyForm;
