const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            {text && <p className="mt-3 text-gray">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;