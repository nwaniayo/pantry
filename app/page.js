'use client'
import { useState, useEffect } from "react";
import { firestore } from "../firebase";
import { 
  Box, Stack, Typography, TextField, Button, InputAdornment, IconButton, 
  useMediaQuery, useTheme, Modal, Paper, Snackbar, Alert, Fade
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { collection, query, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const isAddButtonDisabled = !itemName.trim() || itemQuantity <= 0;

  const updateInventory = async () => {
    const q = query(collection(firestore, 'pantry'));
    const docs = await getDocs(q);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        id: doc.id,
        name: doc.id,
        ...doc.data()
      });
    });
    setInventory(inventoryList);
  }

  const addItem = async (item, quantity) => {
    const docRef = doc(firestore, 'pantry', item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + quantity });
    } else {
      await setDoc(docRef, { quantity: quantity });
    }
    await updateInventory();
    showSnackbar(`Added ${quantity} ${item} to inventory`);
  };
  
  const removeItem = async (item) => {
    const docRef = doc(firestore, 'pantry', item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { quantity: quantity - 1 });
      }
      await updateInventory();
      showSnackbar(`Removed 1 ${item} from inventory`);
    }
  };

  const startDelete = (item) => {
    setIsDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (isDeletingItem) {
      const docRef = doc(firestore, 'pantry', isDeletingItem);
      await deleteDoc(docRef);
      setIsDeleteModalOpen(false);
      setIsDeletingItem(null);
      await updateInventory();
      showSnackbar(`Deleted ${isDeletingItem} from inventory`, 'info');
    }
  };

  const startEdit = (item, quantity) => {
    setEditingItem(item);
    setEditQuantity(quantity);
    setIsEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (editingItem) {
      const docRef = doc(firestore, 'pantry', editingItem);
      await updateDoc(docRef, { quantity: editQuantity });
      setIsEditModalOpen(false);
      setEditingItem(null);
      await updateInventory();
      showSnackbar(`Updated ${editingItem} quantity to ${editQuantity}`);
    }
  };

  const handleAddItem = () => {
    if (!isAddButtonDisabled) {
      addItem(itemName.trim(), itemQuantity);
      setItemName('');
      setItemQuantity(1);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const columns = [
    { field: 'name', headerName: 'Item Name', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            onClick={() => startEdit(params.row.name, params.row.quantity)}
            size="small"
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => startDelete(params.row.name)}
            size="small"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box 
      width="100%" 
      minHeight="100vh" 
      display="flex" 
      flexDirection="column"
      alignItems="center"
      gap="20px"
      p={isMobile ? 2 : 3}
      sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Typography variant={isMobile ? "h4" : "h2"} color="#333" textAlign="center" fontWeight="bold">
        Inventory Management
      </Typography>

      <Paper elevation={3} sx={{ width: '100%', maxWidth: '800px', p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction={isMobile ? "column" : "row"} spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              variant="outlined"
              type="number"
              label="Quantity"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value) || 0)}
              style={{ width: isMobile ? '100%' : '100px' }}
            />
            <Button 
              variant="contained" 
              onClick={handleAddItem}
              disabled={isAddButtonDisabled}
              fullWidth={isMobile}
              startIcon={<AddCircleOutlineIcon />}
              sx={{ 
                backgroundColor: theme.palette.success.main,
                '&:hover': {
                  backgroundColor: theme.palette.success.dark,
                },
              }}
            >
              Add Item
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={3} sx={{ width: '100%', maxWidth: '800px', height: 400, borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={filteredInventory}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          autoHeight={isMobile}
          sx={{
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
        />
      </Paper>

      {/* Edit Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Fade in={isEditModalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}>
            <Typography id="edit-modal-title" variant="h6" component="h2" mb={2}>
              Edit {editingItem}
            </Typography>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(Number(e.target.value))}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={saveEdit} fullWidth>
              Save Changes
            </Button>
          </Box>
        </Fade>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Fade in={isDeleteModalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}>
            <Typography id="delete-modal-title" variant="h6" component="h2" mb={2}>
              Delete Confirmation
            </Typography>
            <Typography id="delete-modal-description" sx={{ mb: 2 }}>
              Are you sure you want to delete {isDeletingItem}?
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={confirmDelete}>
                Delete
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}