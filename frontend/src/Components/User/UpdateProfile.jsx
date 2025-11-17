import React, {  useState, useEffect } from 'react'
import MetaData from '../Layout/MetaData'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../utils/firebase';
import Loader from '../Layout/Loader';
import * as Yup from 'yup'


const UpdateProfile = () => {
    const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();
    
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg')
    const [loading, setLoading] = useState(false)
    const [isUpdated, setIsUpdated] = useState(false)
    let navigate = useNavigate();

    const [errors, setErrors] = useState({})
    const profileSchema = Yup.object().shape({
        name: Yup.string().trim().min(2, 'Name must be at least 2 characters').required('Name is required'),
        email: Yup.string().trim().email('Enter a valid email').required('Email is required')
    })

    const updateProfile = async (userData) => {
        try {
            setLoading(true);

            // Prefer Firebase ID token for backend auth
            let idToken = null;
            try {
                idToken = await auth?.currentUser?.getIdToken(true);
            } catch (_) {}

            if (!idToken) {
                setLoading(false);
                toast.error('Session expired. Please login again to update your profile.', { position: 'bottom-right' });
                navigate('/login');
                return;
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${idToken}`
                }
            };

            const { data } = await axios.put('/me/update', userData, config);

            if (data.success) {
                updateUser(data.user);
                setIsUpdated(data.success);
                toast.success(data.message || 'Profile updated successfully!', { position: 'bottom-right' });
                navigate('/me', { replace: true });
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
            const msg = error.response?.data?.message || 'Failed to update profile';
            toast.error(msg, { position: 'bottom-right' });
        }
    }

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error("Please login to access this page", {
                position: 'bottom-center'
            });
            navigate('/login');
            return;
        }

        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setAvatarPreview(user.avatar?.url || '/images/default_avatar.jpg');
        }
    }, [user, isAuthenticated, authLoading, navigate])

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setErrors({})
            await profileSchema.validate({ name, email }, { abortEarly: false })
        } catch (error) {
            if (error?.name === 'ValidationError') {
                const fieldErrors = {}
                error.inner.forEach(err => {
                    if (err.path && !fieldErrors[err.path]) fieldErrors[err.path] = err.message
                })
                setErrors(fieldErrors)
                toast.error('Please fix the validation errors')
                return
            }
        }
        const formData = new FormData();
        formData.set('name', name);
        formData.set('email', email);
        formData.set('avatar', avatar);
        updateProfile(formData)
    }

    const onChange = e => {
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatarPreview(reader.result)
                setAvatar(reader.result)
            }
        }

        reader.readAsDataURL(e.target.files[0])

    }
    // console.log(user)

    
    if (authLoading) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <>
            <MetaData title={'Update Profile'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} encType='multipart/form-data'>
                        <h1 className="mt-2 mb-5">Update Profile</h1>

                        <div className="form-group">
                            <label htmlFor="email_field">Name</label>
                            <input
                                type="name"
                                id="name_field"
                                className="form-control"
                                name='name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {errors.name && <small className="text-danger">{errors.name}</small>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email_field">Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                name='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && <small className="text-danger">{errors.email}</small>}
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
                                        accept='image/*'
                                        onChange={onChange}
                                    />
                                    <label className='custom-file-label' htmlFor='customFile'>
                                        Choose Avatar
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn update-btn btn-block mt-4 mb-3" disabled={loading ? true : false} >Update</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default UpdateProfile