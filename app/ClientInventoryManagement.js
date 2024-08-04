'use client'
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, IconButton, 
  Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, ThemeProvider, 
  createTheme, CssBaseline, Snackbar, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress,
  Tooltip, Fade
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RemoveCircleOutline as DecreaseIcon,
  AddCircleOutline as IncreaseIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { collection, query, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "../firebase";

// Create a custom theme
const customTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#FFA000',
    },
    background: {
      default: '#1C2331',
      paper: '#2C3E50',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4CAF50',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          '& .MuiInputBase-input': {
            color: 'rgba(255, 255, 255, 0.9)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
        },
      },
    },
  },
});

export default function ClientInventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    updateInventory();
  }, []);

  const updateInventory = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error("Error fetching inventory:", error);
      showSnackbar("Failed to fetch inventory. Please try again.", "error");
    }
    setLoading(false);
  };

  const addItem = async () => {
    if (itemName.trim() && itemQuantity > 0) {
      try {
        const docRef = doc(firestore, 'pantry', itemName.trim());
        await setDoc(docRef, { quantity: itemQuantity });
        setItemName('');
        setItemQuantity(1);
        await updateInventory();
        showSnackbar(`${itemName} added successfully!`, "success");
      } catch (error) {
        console.error("Error adding item:", error);
        showSnackbar("Failed to add item. Please try again.", "error");
      }
    }
  };

  const editItem = async (item, newQuantity) => {
    try {
      const docRef = doc(firestore, 'pantry', item);
      await updateDoc(docRef, { quantity: newQuantity });
      await updateInventory();
      showSnackbar(`${item} quantity updated!`, "success");
    } catch (error) {
      console.error("Error updating item:", error);
      showSnackbar("Failed to update item. Please try again.", "error");
    }
  };

  const deleteItem = async () => {
    if (itemToDelete) {
      try {
        const docRef = doc(firestore, 'pantry', itemToDelete);
        await deleteDoc(docRef);
        await updateInventory();
        showSnackbar(`${itemToDelete} removed from inventory.`, "success");
      } catch (error) {
        console.error("Error deleting item:", error);
        showSnackbar("Failed to delete item. Please try again.", "error");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const openDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', p: 3, bgcolor: 'background.default' }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 4, display: 'flex', alignItems: 'center' }}>
          <InventoryIcon sx={{ mr: 2, fontSize: 40 }} />
          Pantry Tracker Pro
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
            Add New Item
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Quantity"
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value) || 0)}
              sx={{ width: 100 }}
              variant="outlined"
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addItem}
              disabled={!itemName.trim() || itemQuantity <= 0}
              sx={{ px: 4 }}
            >
              Add Item
            </Button>
          </Box>
        </Paper>
        <Paper elevation={3} sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                ),
              }}
            />
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>Item Name</TableCell>
                      <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Quantity</TableCell>
                      <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInventory
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => (
                        <TableRow key={item.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row" sx={{ color: 'text.primary' }}>
                            {item.name}
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'text.primary' }}>{item.quantity}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Decrease quantity" arrow>
                              <IconButton onClick={() => editItem(item.name, Math.max(0, item.quantity - 1))} sx={{ color: 'error.main' }}>
                                <DecreaseIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Increase quantity" arrow>
                              <IconButton onClick={() => editItem(item.name, item.quantity + 1)} sx={{ color: 'success.main' }}>
                                <IncreaseIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete item" arrow>
                              <IconButton onClick={() => openDeleteDialog(item.name)} sx={{ color: 'error.main' }}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredInventory.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ color: 'text.primary' }}
              />
            </>
          )}
        </Paper>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {itemToDelete} from your inventory?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteItem} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}