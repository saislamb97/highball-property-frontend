import { Box, Pagination, useTheme, Stack, Skeleton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import { tokens } from "src/theme";

export default function MyTable({ isLoading, rows, columns, paginate = {}, onPageChange, rowHeight, autoHeight = false, onSelect  }) {
  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const handleSelectionModelChange = e => {
    setRowSelectionModel(e)
    typeof onSelect === 'function' && onSelect(e);
  }

  return <Box width={'100%'} height="70vh" marginTop={2} sx={{
      "*": { "--DataGrid-containerBackground": colors.blueAccent[700] },
      "& .MuiDataGrid-root": { border: "none", },
      "& .MuiDataGrid-cell": { borderBottom: "none", },
      "& .name-column--cell": { color: colors.greenAccent[300], },
      "& .MuiDataGrid-cell.content-wrap": { 
        wordWrap: "break-word", whiteSpace: "wrap", lineHeight: 1.4,
        display: 'flex', justifyContent: 'center', flexDirection: 'column'
      },
      "& .MuiDataGrid-columnHeaders": {
        backgroundColor: colors.blueAccent[700], borderBottom: "none",
      },
      "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400], },
      "& .MuiDataGrid-footerContainer": {
        borderTop: "none", backgroundColor: colors.blueAccent[700],
      },
      "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important`, },
      "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important`, },
    }}
    >
    { !isLoading ? (<>
      <DataGrid
        rows={rows} 
        columns={columns} 
        hideFooter
        loading={isLoading}
        rowHeight={rowHeight}
        autoHeight={autoHeight}
        checkboxSelection={ typeof onSelect === 'function' }
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={ handleSelectionModelChange }
        />
      <Box component={Box}
        backgroundColor={colors.blueAccent[700]} width="100%" display={'flex'} p={1.5} alignItems={'center'} justifyContent="flex-end" gap={2} borderRadius={'0 0 4px 4px'}
        >
        <Pagination size={'small'} color="info"
          count={ paginate.pageCount } 
          total={paginate.total} 
          page={paginate.page} 
          onChange={ (e, page) => onPageChange(page) }
          />
        <span>Total: { paginate.total }</span>
      </Box>
    </>) 
    : (
      <Stack spacing={2} mt={4}>
        { [1,2,3].map(t => <Skeleton key={t} variant="rectangular" width={'100%'} height={60}/> ) }
      </Stack>
    )}
  </Box>
}