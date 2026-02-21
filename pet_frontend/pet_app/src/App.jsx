import React, { useState, useEffect, useContext } from 'react';
import { NotificationContext } from './contexts/NotificationContext';
import Navbar from './components/Navbar';

// --- PAGE IMPORTS ---
import HomePage from './pages/shared/HomePage';
import LoginPage from './pages/shared/LoginPage';
import RegistrationOptions from './pages/shared/RegistrationOptions';
import RegisterPatient from './pages/shared/RegisterPatient';
import RegisterDoctor from './pages/shared/RegisterDoctor';

import PatientDashboard from './pages/patient/PatientDashboard';
import MyPetsPage from './pages/patient/MyPetsPage';
import AppointmentsPage from './pages/patient/AppointmentsPage';
import MarketplacePage from './pages/patient/MarketplacePage';
import PatientProfile from './pages/patient/PatientProfile';
import MessagesPage from './pages/patient/MessagesPage';
import OrdersPage from './pages/patient/OrdersPage';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorConsultations from './pages/doctor/DoctorConsultations';
import PetRecords from './pages/doctor/PetRecords';
import Prescriptions from './pages/doctor/Prescriptions';
import DoctorMessages from './pages/doctor/DoctorMessages';
import Availability from './pages/doctor/Availability';
// --- NEW IMPORT ---
import DoctorHelp from './pages/doctor/DoctorHelp';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';

import { loginUser, registerUser } from './api/authService';
import { 
  getPets, getAppointments, addPet, deletePet, updatePet, 
  bookAppointment, cancelAppointment, deleteAppointment, 
  updateUser, updateAppointment, getPrescriptions 
} from './api/dataService';

const App = () => {
  const [view, setView] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);  
  const [products, setProducts] = useState([]);
  
  // --- NOTIFICATION STATES ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const showNotification = useContext(NotificationContext);

  // --- HELPER FUNCTIONS ---
  const refreshPatientData = async () => {
    if (currentUser && currentUser.id && currentUser.user_type === 'patient') {
      try {
        const [petsRes, apptsRes] = await Promise.all([
          getPets(currentUser.id),
          getAppointments(currentUser.id)
        ]);
        setCurrentUser(prev => ({ ...prev, pets: petsRes.data, appointments: apptsRes.data }));
      } catch (error) { console.error("Failed to refresh data", error); }
    }
  };

  const fetchProductsForAdmin = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products');
      if(response.ok) setProducts(await response.json());
    } catch (error) { console.error("Error fetching products for admin:", error); }
  };

  // --- ADD NOTIFICATION HELPER ---
  const addNotification = (message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      message,
      type, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1); // INCREMENT BADGE COUNT
  };

  // --- MARK AS READ HELPER ---
  const handleMarkAsRead = () => {
    setUnreadCount(0); // RESET COUNT
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (currentUser && currentUser.id && currentUser.user_type === 'patient') {
      refreshPatientData();
    }
  }, [currentUser?.id]);

  // --- HANDLERS ---
  const handleLogin = async (creds, done) => {
    try {
      const response = await loginUser({ email: creds.email, password: creds.password, role: creds.type });
      const data = response.data;

      if (data.id === 0) { 
        setCurrentUser({ ...data, user_type: 'admin' });
        setView('admin-dashboard');
        showNotification('Welcome Admin');
        fetchProductsForAdmin(); 
        done();
        return;
      }

      const dbRole = data.role ? data.role.toLowerCase() : '';
      const attemptedRole = creds.type ? creds.type.toLowerCase() : '';

      if (dbRole !== attemptedRole) {
        alert(`Access Denied: You are registered as a ${dbRole.toUpperCase()}, but you selected ${attemptedRole.toUpperCase()}.\n\nPlease register a new account or verify your existing user role.`);
        done();
        return;
      }

      setCurrentUser({ 
        ...data, 
        user_type: dbRole, 
        pets: [], 
        appointments: [] 
      });
      
      setView(`${dbRole}-dashboard`);
      showNotification(`Welcome ${data.name}`);

    } catch (error) {
      const msg = error.response?.data || "Login failed";
      showNotification(typeof msg === 'string' ? msg : 'Invalid credentials', 'error');
    } finally { 
      done(); 
    }
  };

  const handleRegister = async (data, done) => {
    try {
      await registerUser({ ...data, role: data.user_type.toUpperCase() });
      showNotification('Registration successful.');
      setView('login');
      
      if (data.user_type === 'doctor' || data.user_type === 'patient') {
        addNotification(`New ${data.user_type === 'doctor' ? 'Doctor' : 'Patient'} Registered: ${data.name}`, 'success');
      }

    } catch (error) { showNotification('Registration failed', 'error'); }
    finally { done(); }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
    showNotification('Logged out');
  };

  const handleAddPet = async (petData) => {
    try {
      await addPet({ ...petData, age: parseFloat(petData.age), user: { id: currentUser.id } });
      await refreshPatientData(); 
      showNotification('Pet added successfully');
      addNotification(`Added new pet: ${petData.name}`, 'success');
    } catch (error) { showNotification('Failed to add pet', 'error'); }
  };

  const handleDeletePet = async (petId) => {
    try {
      await deletePet(petId);
      await refreshPatientData(); 
      showNotification('Pet deleted');
      addNotification('Deleted a pet', 'warning');
    } catch (error) { showNotification('Failed to delete pet', 'error'); }
  };

  const handleUpdatePet = async (petId, petData) => {
    try {
      await updatePet(petId, petData);
      await refreshPatientData(); 
      showNotification('Pet updated successfully');
      addNotification(`Updated pet: ${petData.name}`, 'info');
    } catch (error) { showNotification('Failed to update pet', 'error'); }
  };

  // --- APPOINTMENT HANDLERS ---
  const handleBookAppointment = async (apptData) => {
    try {
      const parsedDoctorId = parseInt(apptData.doctorId);
      await bookAppointment({
        ...apptData, doctorId: parsedDoctorId, doctor: { id: parsedDoctorId },
        status: 'PENDING', paymentStatus: 'UNPAID', patient: { id: currentUser.id }
      });
      await refreshPatientData();
      showNotification('Appointment requested.');
      addNotification('Appointment waiting for doctor approval', 'info');
    } catch (error) { 
      showNotification('Failed to book appointment', 'error'); 
    }
  };

  const handleUpdateAppointmentStatus = async (apptId, newStatus, paymentData = {}) => {
    try {
      await updateAppointment(apptId, { status: newStatus, ...paymentData });

      if (newStatus === 'APPROVED' && !paymentData.paymentMethod) {
        showNotification('Appointment Approved');
        addNotification('Doctor approved appointment', 'success');
      } 
      else if (paymentData.paymentStatus === 'PAID') {
        showNotification('Payment Successful');
        addNotification('Appointment payment successful', 'success');
      }
      else if (paymentData.paymentStatus === 'FAILED') {
        showNotification('Payment Failed');
        addNotification('Appointment payment failed', 'error');
      }
      else {
        showNotification(`Appointment ${newStatus}`);
        addNotification(`Appointment status: ${newStatus}`, 'info');
      }

      if (currentUser && currentUser.user_type === 'patient') refreshPatientData();
    } catch (error) { showNotification('Failed to update appointment status', 'error'); }
  };

  const handleCancelAppointment = async (apptId) => {
    try {
      await cancelAppointment(apptId);
      await refreshPatientData(); 
      showNotification('Appointment cancelled');
      addNotification('Appointment cancelled', 'warning');
    } catch (error) { showNotification('Failed to cancel', 'error'); }
  };

  const handleDeleteAppointment = async (apptId) => {
    try {
      await deleteAppointment(apptId);
      await refreshPatientData();
      showNotification('Appointment deleted');
      addNotification('Deleted an appointment', 'warning');
    } catch (error) { showNotification('Failed to delete', 'error'); }
  };

  const handleUpdateProfile = async (userData) => {
    try {
      await updateUser(currentUser.id, userData);
      setCurrentUser(prev => ({ ...prev, ...userData }));
      showNotification('Profile updated!');
      addNotification('Profile updated successfully', 'success');
    } catch (error) { showNotification('Failed to update profile', 'error'); throw error; }
  };

  // --- MARKETPLACE HANDLERS ---
  const handlePlaceOrder = async (orderData, isSuccess = true) => {
    try {
      if (isSuccess) {
        addNotification('Product booking confirmed', 'success');
        showNotification('Payment successful');
      } else {
        addNotification('Booking failed', 'error');
        showNotification('Payment failed');
      }
      
    } catch (error) { 
      addNotification('Failed to place order', 'error'); 
    }
  };

  // --- ADMIN PRODUCT HANDLERS ---
  const handleAddProduct = async (newProduct) => {
    try {
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProduct)
      });
      if (response.ok) {
        const savedProduct = await response.json();
        setProducts([...products, savedProduct]); 
        showNotification('Product Added Successfully');
      } else throw new Error("Failed to add");
    } catch (error) { showNotification('Failed to add product', 'error'); }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
        showNotification('Product Deleted');
      } else throw new Error("Failed to delete");
    } catch (error) { showNotification('Failed to delete product', 'error'); }
  };

  const handleClearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="w-full min-h-full bg-[#f0fdfa]">
      <Navbar onNavigate={setView} user={currentUser} onLogout={handleLogout} />
      <main className="w-full">
        {view === 'home' && <HomePage onNavigate={setView} />}
        {view === 'login' && <LoginPage onLogin={handleLogin} onNavigate={setView} />}
        {view === 'register-options' && <RegistrationOptions onNavigate={setView} />}
        {view === 'register-patient' && <RegisterPatient onRegister={handleRegister} onNavigate={setView} />}
        {view === 'register-doctor' && <RegisterDoctor onRegister={handleRegister} onNavigate={setView} />}
        
        {/* Patient Pages */}
        {view === 'patient-dashboard' && currentUser && (
          <PatientDashboard 
            onNavigate={setView} 
            user={currentUser} 
            notifications={notifications} 
            unreadCount={unreadCount} 
            onMarkAsRead={handleMarkAsRead}
            onClearNotification={handleClearNotification} 
          />
        )}
        {view === 'my-pets' && currentUser && (
          <MyPetsPage onNavigate={setView} user={currentUser} onAddPet={handleAddPet} onDeletePet={handleDeletePet} onUpdatePet={handleUpdatePet} getPrescriptions={getPrescriptions} />
        )}
        {view === 'appointments' && currentUser && (
          <AppointmentsPage onNavigate={setView} user={currentUser} onBook={handleBookAppointment} onCancel={handleCancelAppointment} onUpdateStatus={handleUpdateAppointmentStatus} onDelete={handleDeleteAppointment} />
        )}
        {view === 'marketplace' && currentUser && (
            <MarketplacePage onNavigate={setView} user={currentUser} onPlaceOrder={handlePlaceOrder} /> 
        )}
        {view === 'messages' && currentUser && (
          <MessagesPage onNavigate={setView} />
        )}
        {view === 'orders' && currentUser && <OrdersPage onNavigate={setView} user={currentUser} />}
        {view === 'profile' && currentUser && <PatientProfile user={currentUser} onNavigate={setView} onUpdateUser={handleUpdateProfile} refreshAppData={refreshPatientData} />}
        
        {/* Doctor Pages */}
        {view === 'doctor-dashboard' && currentUser && (
          <DoctorDashboard 
            onNavigate={setView} 
            user={currentUser} 
            notifications={notifications} 
            unreadCount={unreadCount} 
            onMarkAsRead={handleMarkAsRead}
            onClearNotification={handleClearNotification}
            allUsers={allUsers} 
          />
        )}
        {view === 'doctor-appointments' && currentUser && <DoctorAppointments onNavigate={setView} user={currentUser} onUpdateStatus={handleUpdateAppointmentStatus} />}
        {view === 'doctor-consultations' && currentUser && <DoctorConsultations onNavigate={setView} user={currentUser} />}
        {view === 'pet-records' && currentUser && <PetRecords onNavigate={setView} user={currentUser} />}
        {view === 'prescriptions' && currentUser && <Prescriptions onNavigate={setView} user={currentUser} />}
        {view === 'doctor-messages' && currentUser && <DoctorMessages onNavigate={setView} user={currentUser} />}
        {view === 'availability' && currentUser && <Availability onNavigate={setView} user={currentUser} />}
        
        {/* --- ADDED: HELP CENTER PAGE --- */}
        {view === 'help-center' && currentUser && (
          <DoctorHelp onNavigate={setView} user={currentUser} />
        )}

        {view === 'doctor-profile' && currentUser && <DoctorProfile user={currentUser} onNavigate={setView} onUpdateUser={handleUpdateProfile} />}
        
        {/* Admin Pages */}
        {view === 'admin-dashboard' && currentUser && (
          <AdminDashboard 
            onNavigate={setView} 
            products={products} 
            onAddProduct={handleAddProduct} 
            onDeleteProduct={handleDeleteProduct}
            notifications={notifications} 
            unreadCount={unreadCount} 
            onMarkAsRead={handleMarkAsRead}
            onClearNotification={handleClearNotification}
          />
        )}
        {view === 'admin-profile' && currentUser && <AdminProfile user={currentUser} onNavigate={setView} onUpdateUser={handleUpdateProfile} />}
      </main>
    </div>
  );
};

export default App;