import api from './client';
import axios from 'axios';

const API_URL = "http://localhost:8080";

// --- PET API CALLS ---
export const getPets = (userId) => api.get(`/patient/pets/${userId}`);
export const addPet = (petData) => api.post('/patient/pets', petData);
export const deletePet = (petId) => api.delete(`/patient/pets/${petId}`);
export const updatePet = (id, petData) => api.put(`/patient/pets/${id}`, petData);

// --- APPOINTMENT API CALLS ---
export const getAppointments = (userId) => api.get(`/patient/appointments/${userId}`);
export const getDoctorAppointments = (userId) => api.get(`/patient/appointments/doctor/${userId}`);
export const getDoctors = () => api.get('/patient/doctors');
export const bookAppointment = (apptData) => api.post('/patient/appointments', apptData);
export const cancelAppointment = (apptId) => api.delete(`/patient/appointments/${apptId}`);
export const deleteAppointment = (apptId) => api.delete(`/patient/appointments/${apptId}`);

// --- MAIN UPDATE FUNCTION ---
// Used for: Status changes, Payment updates, and Prescription updates
export const updateAppointment = (id, data) => {
  console.log(`Updating appointment ${id} with:`, data);
  return api.put(`/patient/appointments/${id}`, data);
};

// --- DOCTOR PRESCRIPTION & PATIENTS ---
export const getPrescriptions = (petId) => api.get(`/doctor/prescriptions/${petId}`);
export const getActivePatients = () => api.get('/doctor/patients'); 
export const issuePrescription = (data) => api.post('/doctor/prescriptions', data);

// --- USER API CALLS ---
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${API_URL}/api/auth/patient/profile/${id}`, userData);
    return response;
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// --- ADMIN API CALLS (Using api client) ---
export const getAllUsers = () => api.get('/admin/users');
export const approveDoctor = (id) => api.post(`/admin/approve/${id}`);
export const deleteUser = (id) => api.delete(`/admin/delete/${id}`); // ADDED

// --- MARKETPLACE API CALLS ---

// 1. Get all products (Used by Admin Marketplace & Patient Marketplace)
export const getAllProducts = async () => {
  const response = await api.get('/api/products');
  return response.data;
};

// 2. Add a product (Used by Admin to add item)
export const addProduct = async (productData) => {
  const response = await api.post('/api/products', productData);
  return response.data;
};

// 3. Delete a product (Used by Admin to remove item)
export const deleteProduct = async (productId) => {
  const response = await api.delete(`/api/products/${productId}`);
  return response.data;
};

// --- OPTIONAL: DOCTOR PROFILE UPDATE ---
export const updateDoctorProfile = async (doctorId, data) => {
  return await axios.put(`${API_URL}/doctors/${doctorId}`, data);
};