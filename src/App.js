import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './Pages/HomePage';
import { MyMeetingsPage } from './Pages/MyMeetingsPage';
import { RoomPage } from './Pages/RoomPage';
import { LoginPage } from './Pages/LoginPage';
import { RegisterPage } from './Pages/RegisterPage';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/login' element={<LoginPage />} />
				<Route path='/register' element={<RegisterPage />} />
				<Route path='/meetings' element={<MyMeetingsPage />} />
				<Route path='/room/:roomId' element={<RoomPage />} />
				<Route path='*' element={<LoginPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
