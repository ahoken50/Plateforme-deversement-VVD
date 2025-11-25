
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewReport from './pages/NewReport';
import Intervenants from './pages/Intervenants';
import Procedure from './pages/Procedure';
import AdminUsers from './pages/AdminUsers';
import Stats from './pages/Stats';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="report/new" element={<NewReport />} />
                        <Route path="report/:id" element={<NewReport />} />
                        <Route path="intervenants" element={<Intervenants />} />
                        <Route path="procedure" element={<Procedure />} />
                        <Route path="stats" element={<Stats />} />
                        <Route path="admin/users" element={
                            <PrivateRoute requireAdmin>
                                <AdminUsers />
                            </PrivateRoute>
                        } />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
