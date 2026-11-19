import { NavLink, useNavigate } from 'react-router-dom'
import { FaChartPie, FaSignOutAlt, FaUserPlus, FaUsers } from 'react-icons/fa'

const SideBar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  // active page = blue, others = grey with hover
  const linkClass = ({ isActive }) =>
    `flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'
    }`

  return (
    <aside className='fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-gray-800 bg-black text-white'>
      <div className='border-b border-gray-800 px-4 py-6'>
        <h1 className='text-center text-xl font-bold text-gray-200'>
          Admin Dashboard
        </h1>
      </div>

      <ul className='flex-1 space-y-2 overflow-y-auto px-3 py-6'>
        <li>
          <NavLink to='/dashboard' className={linkClass}>
            <FaChartPie className='shrink-0 text-lg' /> Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to='/addstudent' className={linkClass}>
            <FaUserPlus className='shrink-0 text-lg' /> Add Student
          </NavLink>
        </li>

        <li>
          <NavLink to='/managestudents' className={linkClass}>
            <FaUsers className='shrink-0 text-lg' /> Manage Students
          </NavLink>
        </li>
      </ul>

      <div className='border-t border-gray-800 p-3'>
        <button
          type='button'
          onClick={handleLogout}
          className='flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium text-red-300 transition-colors duration-200 hover:bg-red-900/40 hover:text-red-200'
        >
          <FaSignOutAlt className='shrink-0 text-lg' /> Logout
        </button>
      </div>
    </aside>
  )
}

export default SideBar