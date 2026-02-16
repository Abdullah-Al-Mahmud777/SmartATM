interface CardStatProps {
  title: string;
  value: string | number;
  icon: string;
  color: string; 
}

export default function CardStat({ title, value, icon, color }: CardStatProps) {
  return (
    <div className={`${color} text-white p-6 rounded-xl shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}
