import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Post from './pages/Post'
import About from './pages/About'
import Animal from './pages/Animal'

export default function App() {
  return (
    
    <>
      <Home />
    </>


    // <BrowserRouter>
    //   <Routes>
    //     <Route path="/" element={<Home />} />
    //     <Route path="/post/:slug" element={<Post />} />
    //     <Route path="/about" element={<About />} />
    //   </Routes>
    // </BrowserRouter>
  )
}
