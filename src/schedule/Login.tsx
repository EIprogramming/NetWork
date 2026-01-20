import { useForm } from 'react-hook-form';
import './Login.css'

type User = {
    username: string,
    password: string,
}

function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm<User>();

    return (
        <div className="schedule-login-overlay">    
            <div className="schedule-login-align">
                <div className="schedule-login">
                    <form>
                        <h2 className="schedule-login-title">Sign Up/Log In</h2>
                        <i className="schedule-login-italic">Please enter a username and optional password.</i>
                        <div className="schedule-login-spacer"></div>

                        <label htmlFor="username">Username</label>
                        <div></div>
                        <input 
                            id="username" type="text"
                            className="schedule-login-input schedule-login-username"
                            autoComplete="off"
                            {...register("username", {
                                required: 'Username is required',
                                maxLength: {
                                    value: 30,
                                    message: 'Username may not exceed 30 characters.'
                                }
                            })}
                            />

                        <div className="schedule-login-spacer"></div>

                        <label htmlFor="password">Password</label>
                        <div></div>
                        <input id="password" type="password"
                            className="schedule-login-input schedule-login-password"
                            placeholder="(optional)" />
                        
                        <div className="schedule-login-spacer"></div>

                        <button type="submit">Sign Up / Log In!</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
