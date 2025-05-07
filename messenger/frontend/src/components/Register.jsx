import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userRegister } from '../store/actions/authAction';
import { useAlert } from 'react-alert';
import { ERROR_CLEAR, SUCCESS_MESSAGE_CLEAR } from '../store/types/authType';

const BACKEND_URL = "https://mern-chat-application-nlxu.onrender.com"

const Register = () => {
  const navigate = useNavigate();
  const alert = useAlert();
  const dispatch = useDispatch();

  const { loading, authenticate, error, successMessage } = useSelector(state => state.auth);

  const [state, setState] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    image: null
  });

  const [loadImage, setLoadImage] = useState('');

  const inputHandle = e => {
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  };

  const fileHandle = e => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setState({
        ...state,
        [e.target.name]: file
      });

      const reader = new FileReader();
      reader.onload = () => {
        setLoadImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const register = e => {
    e.preventDefault();
    const { userName, email, password, confirmPassword, image } = state;

    // Client-side validation
    if (!userName.trim() || !email.trim() || !password || !confirmPassword) {
      alert.error('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      alert.error('Passwords do not match');
      return;
    }

    const formData = new FormData();
    formData.append('userName', userName.trim());
    formData.append('email', email.trim());
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    if (image) {
      formData.append('image', image);
    }

    dispatch(userRegister(formData));
  };

  useEffect(() => {
    if (authenticate) {
      navigate('/');
    }
    if (successMessage) {
      alert.success(successMessage);
      dispatch({ type: SUCCESS_MESSAGE_CLEAR });
    }
    if (error) {
      if (Array.isArray(error)) {
        error.forEach(err => alert.error(err));
      } else {
        alert.error(error);
      }
      dispatch({ type: ERROR_CLEAR });
    }
  }, [successMessage, error, authenticate, navigate, alert, dispatch]);

  return (
    <div className='register'>
      <div className='card'>
        <div className='card-header'>
          <h3>Create Account</h3>
        </div>

        <div className='card-body'>
          <form onSubmit={register} noValidate>
            <div className='form-group'>
              <label htmlFor='username'>Username</label>
              <input
                type='text'
                onChange={inputHandle}
                name='userName'
                value={state.userName}
                className='form-control'
                placeholder='Enter username'
                id='username'
                required
                aria-required='true'
              />
            </div>

            <div className='form-group'>
              <label htmlFor='email'>Email Address</label>
              <input
                type='email'
                onChange={inputHandle}
                name='email'
                value={state.email}
                className='form-control'
                placeholder='Enter email'
                id='email'
                required
                aria-required='true'
              />
            </div>

            <div className='form-group'>
              <label htmlFor='password'>Password</label>
              <input
                type='password'
                onChange={inputHandle}
                name='password'
                value={state.password}
                className='form-control'
                placeholder='Create password'
                id='password'
                required
                minLength='6'
                aria-required='true'
              />
            </div>

            <div className='form-group'>
              <label htmlFor='confirmPassword'>Confirm Password</label>
              <input
                type='password'
                onChange={inputHandle}
                name='confirmPassword'
                value={state.confirmPassword}
                className='form-control'
                placeholder='Confirm password'
                id='confirmPassword'
                required
                aria-required='true'
              />
            </div>

            <div className='form-group'>
              <div className='file-image'>
                <div className='image'>
                  {loadImage && <img src={loadImage} alt='Profile preview' />}
                </div>
                <div className='file'>
                  <label htmlFor='image' className='btn btn-secondary'>
                    Upload Profile Image
                    <input
                      type='file'
                      onChange={fileHandle}
                      name='image'
                      className='visually-hidden'
                      id='image'
                      accept='image/*'
                      aria-label='Profile image upload'
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className='form-group'>
              <button
                type='submit'
                className='btn btn-primary'
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? 'Registering...' : 'Create Account'}
              </button>
            </div>

            <div className='form-group text-center'>
              <span className='text-muted'>
                Already have an account?{' '}
                <Link to='/messenger/login' className='text-primary'>
                  Log In
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
