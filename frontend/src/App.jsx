import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorRegister from "./pages/DonorRegister";
import RequestBlood from "./pages/RequestBlood";
import RequestDetail from "./pages/RequestDetail";
import ActiveRequests from "./pages/ActiveRequests";
import SearchDonors from "./pages/SearchDonors";
import DashboardDonor from "./pages/DashboardDonor";
import DashboardRequester from "./pages/DashboardRequester";
import DashboardAdmin from "./pages/DashboardAdmin";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchDonors />} />
              <Route path="/requests" element={<ActiveRequests />} />
              <Route path="/requests/:id" element={<RequestDetail />} />

              <Route
                path="/donor/register"
                element={
                  <ProtectedRoute>
                    <DonorRegister />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/request/new"
                element={
                  <ProtectedRoute>
                    <RequestBlood />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/donor"
                element={
                  <ProtectedRoute allowedRoles={["donor"]}>
                    <DashboardDonor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/requester"
                element={
                  <ProtectedRoute allowedRoles={["requester"]}>
                    <DashboardRequester />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardAdmin />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
