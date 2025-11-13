import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NotFound from '../pages/NotFound'
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'
import HomeUser from '../pages/User/HomeUser'
import SearchPage from '../pages/User/SearchPage'
import Favorites from '../pages/User/Favorites'
import Profile from '../pages/User/Profile'
import Playlists from '../pages/User/Playlists'
import PlaylistDetail from '../pages/User/PlaylistDetail'
import DiscoverWeekly from '../pages/User/DiscoverWeekly'
import Friends from '../pages/User/Friends'
import Dashboard from '../pages/Admin/Dashboard'
import ManageSongs from '../pages/Admin/ManageSongs'
import ManageArtists from '../pages/Admin/ManageArtists'
import ManageAlbums from '../pages/Admin/ManageAlbums'
import ManageUsers from '../pages/Admin/ManageUsers'
import MassUpload from '../pages/Admin/MassUpload'
import Metrics from '../pages/Admin/Metrics'
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
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/playlists" element={<Playlists />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
          <Route path="/user/discover" element={<DiscoverWeekly />} />

          {/* Songs */}
          <Route path="/songs/:id" element={<SongDetails />} />

          {/* Admin (protected) */}
          <Route path="/admin" element={<PrivateRoute roles={["admin"]}><Dashboard /></PrivateRoute>} />
          <Route path="/admin/metrics" element={<PrivateRoute roles={["admin"]}><Metrics /></PrivateRoute>} />
          <Route path="/admin/artists" element={<PrivateRoute roles={["admin"]}><ManageArtists /></PrivateRoute>} />
          <Route path="/admin/albums" element={<PrivateRoute roles={["admin"]}><ManageAlbums /></PrivateRoute>} />
          <Route path="/admin/songs" element={<PrivateRoute roles={["admin"]}><ManageSongs /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={["admin"]}><ManageUsers /></PrivateRoute>} />
          <Route path="/admin/upload" element={<PrivateRoute roles={["admin"]}><MassUpload /></PrivateRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
