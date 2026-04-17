import { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const History = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyData = await apiCall('/food/history');
        // Format dates
        const formattedData = historyData.map(item => ({
          ...item,
          displayDate: format(parseISO(item.date), 'MMM dd')
        }));
        setData(formattedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-6 pt-10 min-h-full">
      <h1 className="text-2xl font-bold dark:text-white mb-6 flex items-center">
        <Activity className="mr-3 text-brand-orange" />
        Activity History
      </h1>

      <div className="glass rounded-3xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Calories (Last 7 Days)</h2>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-500">Loading chart...</div>
        ) : data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-500">No activity yet.</div>
        ) : (
          <div className="h-64 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF8A00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#FF8A00', fontWeight: 'bold' }}
                />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.2} />
                <Area type="monotone" dataKey="total_calories" stroke="#FF8A00" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-brand-orange/10 dark:bg-brand-orange/5 border border-brand-orange/20 rounded-2xl p-4 flex items-start space-x-4">
        <div className="text-3xl">💡</div>
        <div>
          <h4 className="font-semibold text-brand-darkOrange dark:text-brand-orange mb-1">Consistency is Key</h4>
          <p className="text-sm border-brand-orange/80 text-gray-700 dark:text-gray-300">
            Keep logging your meals daily to help the app give you better exercise and diet recommendations over time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default History;


