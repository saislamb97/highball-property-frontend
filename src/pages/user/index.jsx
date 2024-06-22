import { Box, useTheme, Button, Chip, IconButton } from "@mui/material";
import { AddPhotoAlternate, Edit } from '@mui/icons-material';
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { asset } from 'src/utils/Utils';
import useTopBarSearch from "src/hooks/useTopBarSearch";
import MyTable from "src/components/MyTable";
import useSelectFields from "./useSelectFields";
import { useFormSubmit, useUsers } from "src/services/users";
import FormItem from "../properties/formItem";
import useToast from "src/hooks/useToast";
import ImagePreview from 'src/components/Uploader/ImagePreview';
import { useNavigate } from "react-router-dom";

const Owner = () => {
  const theme = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [previewImages, setPreviewImages] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  useTopBarSearch(keyword => {
    setSearchKeyword(keyword?.trim() || '');
  });

  const [types, setTypes] = useState({ role: '', gender: '' });

  const typesFields = useSelectFields({
    clearable: true,
    onFormChange: e => {
      const { name, value } = e.target;
      setTypes(prev => ({ ...prev, [name]: value }));
    }
  });

  const { isLoading, data, paginate, setPaginate, refetch } = useUsers({ ...types, searchKeyword });
  const { rows, count } = data || { rows: [], count: 0 };

  useEffect(() => {
    if (count) {
      setPaginate({ ...paginate, total: count, pageCount: Math.ceil(count / paginate.pageSize) });
    }
  }, [count]);

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "username", headerName: "Username", flex: 2, cellClassName: "name-column--cell" },
    { field: "full_name", headerName: "Full Name", flex: 2 },
    {
      field: "gender", headerName: "Gender", flex: 1,
      valueFormatter: v => v || '🙅🏼‍♀️'
    },
    { field: "phone", headerName: "Phone Number", flex: 2 },
    {
      field: "email", headerName: "Email", flex: 2,
      renderCell: ({ row: { email } }) => <Box style={{ color: '#4fc1ff' }}>{email}</Box>
    },
    {
      field: "role", headerName: "Role", flex: 2,
      renderCell: ({ row: { role } }) => {
        const icon = { ADMIN: <AdminPanelSettingsOutlinedIcon color="error" />, USER: <LockOpenOutlinedIcon /> }[role];
        const color = { ADMIN: 'warning', USER: 'info' }[role];
        return (
          <Chip title={role} color={color} size="small" label={role} icon={icon} />
        );
      },
    },
    {
      field: "actions", headerName: "Actions", flex: 1,
      renderCell: ({ row }) => (
        <IconButton onClick={() => navigate(`/user-form`, { state: { user: row } })}>
          <Edit />
        </IconButton>
      )
    }
  ];

  const mutation = useFormSubmit({
    onSuccess() {
      toast('Success', 1);
      refetch();
    },
    onError(e) {
      toast('Failed', -1);
    }
  });

  return (
    <Box m="20px">
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap'} gap={2}>
        <Header
          sx={{ flex: 1, marginBottom: 0 }}
          title="USERS"
          subtitle="Managing the Users"
        />
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button variant="contained" color="primary" onClick={() => navigate('/user-form')}>
            Create User
          </Button>
          {Object.values(types).filter(Boolean).length > 0 &&
            <Button color="error" variant="outlined" onClick={e => setTypes({})}>Clear Filters ❌</Button>
          }
          {typesFields.map(t =>
            <FormItem key={t.field} value={types[t.field]} size="small" variant="outlined" label={t.label} type="select" options={t.options} sx={{ width: '140px' }} name={t.field}
              onChange={t.onChange}
            />
          )}
        </Box>
      </Box>

      <MyTable isLoading={isLoading} paginate={paginate} columns={columns} rows={rows}
        onPageChange={page => setPaginate({ ...paginate, page })}
      />

      {previewImages.length ? <ImagePreview files={previewImages} onClose={e => setPreviewImages([])} currentIndex={0} /> : ''}
    </Box>
  );
};

export default Owner;
