import {
  ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar,
  PieChart, Pie, Cell,
} from 'recharts';
import SideBar from './SideBar';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const COLORS = ['#4f46e5', '#e53e3e'];

// counts how many students share the same value of a field
const groupCount = (list, key) =>
  list.reduce((acc, el) => {
    const value = el[key] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

const Dashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [Students, SetStudents] = useState([]);

  useEffect(() => {
    fetchStudent();
  }, []); // run once

  const fetchStudent = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/students', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      SetStudents(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/', { replace: true });
        return;
      }
      console.log('fetch error:', err);
    }
  };

  // Total + gender
  const totalStudents = Students.length;
  const genderData = [
    { name: 'Male', value: Students.filter((el) => el.gender === 'Male').length },
    { name: 'Female', value: Students.filter((el) => el.gender === 'Female').length },
  ];

  // Students per batch
  const batchData = groupCount(Students, 'batch');
  const batchChartData = Object.keys(batchData).map((year) => ({
    batchYear: year,
    Students: batchData[year],
  }));

  // Students per class
  const classData = groupCount(Students, 'class_name');
  const classChartData = Object.keys(classData).map((cls) => ({
    className: cls,
    Students: classData[cls],
  }));

  // Recent students: API already returns newest first
  const recentStudents = Students.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar: always visible from md up, opens with the menu button on phones */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className={`${menuOpen ? 'block' : 'hidden'} z-40 md:block`}>
        <SideBar />
      </div>

      {/* Main area: margin equal to the sidebar width (w-60) on md and up */}
      <div className="min-w-0 md:ml-60">
        {/* Top bar, phones only */}
        <div className="sticky top-0 z-20 flex items-center gap-3 bg-gray-800 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="rounded p-1 text-2xl leading-none hover:bg-gray-700"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
          <span className="font-semibold">Student Dashboard</span>
        </div>

        {/* Heading, md and up */}
        <h1 className="hidden border-r border-gray-800 bg-black p-6 text-center text-xl font-bold md:block">
          Student Dashboard
        </h1>

        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          {/* Counts */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <div className="rounded-lg bg-gray-800 p-4 text-center">
              <h2 className="text-base font-bold sm:text-lg">Total Students</h2>
              <p className="text-2xl font-bold sm:text-3xl">{totalStudents}</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-4 text-center">
              <h2 className="text-base font-bold sm:text-lg">Male Students</h2>
              <p className="text-2xl font-bold sm:text-3xl">{genderData[0].value}</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-4 text-center">
              <h2 className="text-base font-bold sm:text-lg">Female Students</h2>
              <p className="text-2xl font-bold sm:text-3xl">{genderData[1].value}</p>
            </div>
          </div>

          {/* Batch + Class charts */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
            <div className="min-w-0 rounded-lg bg-gray-800 p-4">
              <h2 className="mb-4 font-bold">Students Per Batch</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={batchChartData}>
                  <XAxis dataKey="batchYear" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Students" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="min-w-0 rounded-lg bg-gray-800 p-4">
              <h2 className="mb-4 font-bold">Students Per Class</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={classChartData}>
                  <XAxis dataKey="className" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Students" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gender + Recent students */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
            <div className="min-w-0 rounded-lg bg-gray-800 p-4">
              <h2 className="mb-4 font-bold">Gender Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="min-w-0 rounded-lg bg-gray-800 p-4">
              <h2 className="mb-4 font-bold">Recent Students</h2>
              {/* table scrolls sideways inside its card on very small screens */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead className="text-gray-400">
                    <tr>
                      <th className="pb-2 m-5">Name</th>
                      <th className="pb-2">Class</th>
                      <th className="pb-2">Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map((s) => (
                      <tr key={s._id} className="border-t border-gray-700">
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-2 ml-3">
                            {s.photo && (
                              <img
                                src={`http://localhost:5000/uploads/${s.photo}`}
                                alt={s.name}
                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                              />
                            )}
                            <span className="truncate ml-5">{s.name}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-2">{s.class_name}</td>
                        <td className="py-2">{s.batch}</td>
                      </tr>
                    ))}
                    {recentStudents.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-4 text-center text-gray-400">
                          No students yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;