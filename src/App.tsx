import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Loading from './components/Loading';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewReport = lazy(() => import('./pages/NewReport'));
const Intervenants = lazy(() => import('./pages/Intervenants'));
const Procedure = lazy(() => import('./pages/Procedure'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const Stats = lazy(() => import('./pages/Stats'));

function App() {
    return (
        <AuthProvider>
            <Router>
                <Suspense fallback={<Loading />}>
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
                </Suspense>
            </Router>
        </AuthProvider>
    );
}

export default App;
