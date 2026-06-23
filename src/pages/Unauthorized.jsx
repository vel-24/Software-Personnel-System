import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-page">
            <div className="unauthorized-card">
                <div className="unauthorized-icon">🚫</div>
                <h1 className="unauthorized-title">403 - Unauthorized</h1>
                <p className="unauthorized-message">
                    You don't have permission to access this page. 
                    Please contact your administrator if you believe this is an error.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;