import React from 'react'
import App from './App'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './Components/Layout/Nav'
import Create from './pages/Create'
import LandingPage from './pages/LandingPage'
import SamplePage from './Components/Sample/SamplePage'

const RoutedApp = () => {
    return (
        <BrowserRouter>
            <Nav />
            <Routes>
                <Route path="/" exact="true" element={<LandingPage />} />
                <Route path="/home" exact="true" element={<App />} />
                <Route path="/sample" exact="true" element={<SamplePage />} />
                <Route path="/create" exact="true" element={<Create />}
                />
            </Routes>

        </BrowserRouter>
    )
}

export default RoutedApp