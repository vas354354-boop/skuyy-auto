import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Mobil from './pages/Mobil';
import Motor from './pages/Motor';
import TitipJual from './pages/TitipJual';
import Detail from './pages/Detail';
import About from './pages/About';
import Contact from './pages/Contact';
import Cari from './pages/Cari';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminVehicleForm from './pages/admin/AdminVehicleForm';
import AdminLogin from './pages/admin/AdminLogin';
import AdminConsignment from './pages/admin/AdminConsignment';
import AdminLeads from './pages/admin/AdminLeads';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="mobil" element={<Mobil />} />
          <Route path="motor" element={<Motor />} />
          <Route path="titip-jual" element={<TitipJual />} />
          <Route path="cari" element={<Cari />} />
          <Route path="kendaraan/:id" element={<Detail />} />
          <Route path="tentang-kami" element={<About />} />
          <Route path="kontak" element={<Contact />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="kendaraan" element={<AdminVehicles />} />
          <Route path="kendaraan/tambah" element={<AdminVehicleForm />} />
          <Route path="kendaraan/edit/:id" element={<AdminVehicleForm />} />
          <Route path="titip-jual" element={<AdminConsignment />} />
          <Route path="leads" element={<AdminLeads />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
