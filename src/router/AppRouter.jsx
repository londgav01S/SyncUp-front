import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NotFound from '../pages/NotFound'
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'
import HomeUser from '../pages/User/HomeUser'
import SearchPage from '../pages/User/SearchPage'
import Profile from '../pages/User/Profile'
import Playlists from '../pages/User/Playlists'
import DiscoverWeekly from '../pages/User/DiscoverWeekly'
import Dashboard from '../pages/Admin/Dashboard'
import ManageSongs from '../pages/Admin/ManageSongs'
import ManageArtists from '../pages/Admin/ManageArtists'
import ManageUsers from '../pages/Admin/ManageUsers'
import UploadMassive from '../pages/Admin/UploadMassive'
import SongDetails from '../pages/Song/SongDetails'
import MainLayout from '../layouts/MainLayout'
import PrivateRoute from './PrivateRoute'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes (outside layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App shell layout */}
        <Route element={<MainLayout />}> 
          {/* User area */}
          <Route path="/" element={<HomeUser />} />
          <Route path="/user" element={<HomeUser />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/playlists" element={<Playlists />} />
          <Route path="/user/discover" element={<DiscoverWeekly />} />

          {/* Songs */}
          <Route path="/songs/:id" element={<SongDetails />} />

          {/* Admin (protected) */}
          <Route path="/admin" element={<PrivateRoute roles={["admin"]}><Dashboard /></PrivateRoute>} />
          <Route path="/admin/songs" element={<PrivateRoute roles={["admin"]}><ManageSongs /></PrivateRoute>} />
          <Route path="/admin/artists" element={<PrivateRoute roles={["admin"]}><ManageArtists /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={["admin"]}><ManageUsers /></PrivateRoute>} />
          <Route path="/admin/upload" element={<PrivateRoute roles={["admin"]}><UploadMassive /></PrivateRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
