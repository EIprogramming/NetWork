import { useForm } from 'react-hook-form';
import './Login.css'

type User = {
    username: string,
    password: string,
    confirm: string
}

function Login() {
    const { register, handleSubmit, getValues, formState: { errors } } = useForm<User>({mode: 'onChange'});
    const onSubmit = handleSubmit((data) => console.log(data));
    const usernameMaxlength = 40;
    const passwordMaxlength = 40;
    const passwordMinlength = 15;

    function validateConfirm() {
        if (getValues("password") !== getValues("confirm")) {
            return "Passwords must match.";
        }
    }

    return (
        <div className="schedule-login-overlay">    
            <div className="schedule-login-align">
                <div className="schedule-login">
                    <form onSubmit={onSubmit}>
                        <h2 className="schedule-login-title">Sign Up/Log In</h2>

                        <label htmlFor="username">Name</label>
                        <div></div>
                        <input 
                            id="username" type="text"
                            className="schedule-login-input schedule-login-username"
                            autoComplete="off"
                            placeholder=""
                            {...register("username", {
                                required: "Name is required.",
                                maxLength: {
                                    value: usernameMaxlength,
                                    message: `Name cannot exceed ${usernameMaxlength} characters.`
                                }
                            })}
                            />
                        {errors.username && <div role="alert">{errors.username.message}</div>}

                        <div className="schedule-login-spacer"></div>

                        <label htmlFor="password">Password</label>
                        <div></div>
                        <input id="password" type="password"
                            className="schedule-login-input schedule-login-password"
                            placeholder="(optional)" 
                            {...register("password", {
                                maxLength: {
                                    value: passwordMaxlength,
                                    message: `Password cannot exceed ${passwordMaxlength} characters.`
                                },
                                minLength: {
                                    value: passwordMinlength,
                                    message: `Password must be more than ${passwordMinlength} characters.`
                                }
                            })} />
                        {errors.password && <div role="alert">{errors.password.message}</div>}
                        
                        <div className="schedule-login-spacer"></div>
                        
                        {(getValues("password") || getValues("confirm")) && <>
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <div></div>
                        <input id="confirm-password" type="password"
                            className="schedule-login-input schedule-login-password"
                            placeholder="" 
                            {...register("confirm", {
                                validate: validateConfirm,
                            })} /> 
                        {errors.confirm && <div role="alert">{errors.confirm.message}</div>}
                        </>}

                        <div className="schedule-login-spacer"></div>
                        <button type="submit">Sign Up / Log In!</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
