
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

                    <Route element={<Layout />}>
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/nouveau-rapport"
                            element={
                                <PrivateRoute>
                                    <NewReport />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/report/:id"
                            element={
                                <PrivateRoute>
                                    <NewReport />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/intervenants"
                            element={
                                <PrivateRoute>
                                    <Intervenants />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/procedure"
                            element={
                                <PrivateRoute>
                                    <Procedure />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/stats"
                            element={
                                <PrivateRoute>
                                    <Stats />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <PrivateRoute requireAdmin>
                                    <AdminUsers />
                                </PrivateRoute>
                            }
                        />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
