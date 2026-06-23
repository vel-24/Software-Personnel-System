const StatCard = ({ icon, value, label, change, changeType }) => {
    return (
        <div className="stat-card">
            <div className="stat-card-icon">{icon}</div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-label">{label}</div>
            {change && (
                <div className={`stat-card-change ${changeType}`}>
                    {changeType === 'positive' ? '↑' : '↓'} {change}
                </div>
            )}
        </div>
    );
};

export default StatCard;