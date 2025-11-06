import React from 'react'

const Footer = () => {
    return (
        <>
            <footer className="mt-5 pt-4 pb-4 bg-primary-dark text-white">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h6 className="mb-2">Nourishy Haircare</h6>
                            <p className="mb-0 small">Professional-grade hair products infused with botanical ingredients.</p>
                        </div>
                        <div className="col-md-6 text-md-end mt-3 mt-md-0">
                            <a href="#" className="text-white-50 me-3">Privacy</a>
                            <a href="#" className="text-white-50 me-3">Terms</a>
                            <a href="#" className="text-white-50">Contact</a>
                        </div>
                    </div>
                    <div className="text-center mt-3 small text-white-50">
                        © {new Date().getFullYear()} Nourishy — All Rights Reserved
                    </div>
                </div>
            </footer>
        </>

    )
}

export default Footer