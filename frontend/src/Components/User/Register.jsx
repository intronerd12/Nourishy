import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import axios from 'axios'
import { toast } from 'react-toastify'


const Register = () => {
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
    })

    const { name, email, password } = user;

    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg')

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')


    let navigate = useNavigate()


    const submitHandler = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.set('name', name);
        formData.set('email', email);
        formData.set('password', password);
        formData.set('avatar', avatar);

        register(formData)
    }

    const onChange = e => {
        if (e.target.name === 'avatar') {

            const reader = new FileReader();

            reader.onload = () => {
                if (reader.readyState === 2) {
                    setAvatarPreview(reader.result)
                    setAvatar(reader.result)
                }
            }

            reader.readAsDataURL(e.target.files[0])

        } else {
            setUser({ ...user, [e.target.name]: e.target.value })
        }
    }

    const register = async (userData) => {
        console.log(userData)
        setLoading(true)
        setError('')
        setSuccess('')
        
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }

            const { data } = await axios.post(`http://localhost:4001/api/v1/register`, userData, config)
            console.log(data)

            setLoading(false)
            setSuccess(data.message)
            toast.success(data.message, {
                position: 'bottom-right'
            })
            
            // Reset form
            setUser({
                name: '',
                email: '',
                password: '',
            })
            setAvatar('')
            setAvatarPreview('/images/default_avatar.jpg')

        } catch (error) {
            setLoading(false)
            const errorMessage = error.response?.data?.message || 'Registration failed'
            setError(errorMessage)
            toast.error(errorMessage, {
                position: 'bottom-right'
            })
            console.log(errorMessage)
        }
    }




    return (
        <>

            <MetaData title={'Register User'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} encType='multipart/form-data'>
                        <h1 className="mb-3">Register</h1>

                        {success && (
                            <div className="alert alert-success" role="alert">
                                <i className="fa fa-check-circle"></i> {success}
                                <br />
                                <small><strong>Important:</strong> Please check your email inbox (and spam folder) for the verification email and click the link to activate your account before logging in.</small>
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                <i className="fa fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email_field">Name</label>
                            <input
                                type="name"
                                id="name_field"
                                className="form-control"
                                name='name'
                                value={name}
                                onChange={onChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email_field">Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                name='email'
                                value={email}
                                onChange={onChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_field">Password</label>
                            <input
                                type="password"
                                id="password_field"
                                className="form-control"
                                name='password'
                                value={password}
                                onChange={onChange}
                            />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='avatar_upload'>Avatar</label>
                            <div className='d-flex align-items-center'>
                                <div>
                                    <figure className='avatar mr-3 item-rtl'>
                                        <img
                                            src={avatarPreview}
                                            className='rounded-circle'
                                            alt='Avatar Preview'
                                        />
                                    </figure>
                                </div>
                                <div className='custom-file'>
                                    <input
                                        type='file'
                                        name='avatar'
                                        className='custom-file-input'
                                        id='customFile'
                                        accept="images/*"
                                        onChange={onChange}
                                    />
                                    <label className='custom-file-label' htmlFor='customFile'>
                                        Choose Avatar
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            id="register_button"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={loading}
                        >
                            {loading ? 'REGISTERING...' : 'REGISTER'}
                        </button>
                    </form>
                </div>
            </div>

        </>
    )
}

export default Register