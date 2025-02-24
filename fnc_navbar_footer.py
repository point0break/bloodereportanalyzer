
function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-gold shadow-sm fixed-top">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    <img src={bloodIcon} width="40" height="40" alt="BloodCheck Logo" />
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                <FaHome className="me-1" /> Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about">
                                <FaInfoCircle className="me-1" /> About
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/contact">
                                <FaEnvelope className="me-1" /> Contact
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/analyzer">
                                <FaFlask className="me-1" /> Analyzer
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

function Footer() {
    return (
        <footer className="bg-dark text-white text-center py-4 mt-auto">
            <div className="container">
                <p>Contact: support@bloodcheck.com | +91 123456789</p>
            </div>
        </footer>
    );
}
