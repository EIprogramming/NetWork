import { useForm } from 'react-hook-form';
import './Login.css'
import { useParams } from 'react-router';
import { useRef } from 'react';
import type User from './classes/user';
import type State from './classes/state';
import { unflattenAvailability } from './availabilityUtils';

type UserLogin = {
    username: string,
    password: string,
    confirm: string
}

interface Props {
    setDefaultUser: React.Dispatch<React.SetStateAction<User | null>>,
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
    activeTimeblocks: State[][],
    setActiveTimeblocks: React.Dispatch<React.SetStateAction<Array<Array<State>>>>,
    setOldActiveTimeblocks: React.Dispatch<React.SetStateAction<Array<Array<State>>>>
}

function Login( { setDefaultUser, setIsLoggedIn, activeTimeblocks, setActiveTimeblocks, setOldActiveTimeblocks } : Props ) {
    const { register, handleSubmit, getValues, formState: { errors } } = useForm<UserLogin>({mode: 'onChange'});
    
    const  { "*": scheduleId } = useParams();
    const usernameMaxlength = 40;
    const passwordMaxlength = 40;
    const passwordMinlength = 15;
    const user = useRef<User | null >(null);

    function validateConfirm() {
        if (getValues("password") !== getValues("confirm")) {
            return "Passwords must match.";
        }
    }

    async function getUserRawAvailability(currUser: User) {
        const username = currUser.username;

        if (!scheduleId || !username) { return; }

        const params = new URLSearchParams({
            username,
            scheduleId
        });
        
        return await fetch(`http://localhost:3000/availability?${params}`)
            .then((res) => res.json())
            .then((json) => {
                const availability = json;
                console.log(json);
                console.log("avail", availability);
                if (!availability) return; // Return null if availability not created yet
                if (availability.errors) return;
                return availability;
            }).catch(error => {console.log(error)}).then();
    }

    async function logIn(currUser: User) {
        user.current = currUser;
        if (!user.current) return;

        const rawAvailability = await getUserRawAvailability(currUser);
        const availability = unflattenAvailability(rawAvailability);

        if (availability) {
            setActiveTimeblocks(availability);
            setOldActiveTimeblocks(availability);
            user.current.availability = availability;
        } else {
            user.current.availability = activeTimeblocks;
        }

        setDefaultUser(user.current);
        setIsLoggedIn(true);
    }

    const onSubmit = handleSubmit(async (data) => { 
        // todo: implement passwords
        const username = data.username;
        const password = data.password;
        
        // check if confirm password exists
        const confirmPassword = data.confirm || "";

        if (password !== confirmPassword) { return; }
        if (!scheduleId || !username) { return; }

        const params = new URLSearchParams({
            username,
            scheduleId
        });

        let isNewUser = false;

        await fetch(`http://localhost:3000/users?${params}`)
            .then((res) => res.json())
            .then((json) => {
                // REMINDER: when adding password, make sure to still check if the user exists
                isNewUser = !(json.username);
                if (isNewUser) { return; }
                console.log("logged in: ", json.username);
                logIn(json);
            }).catch(error => {console.log(error)}).then();
        
        if (!isNewUser) { return; }
        fetch(`http://localhost:3000/users`, {
            method: "POST",
            body: JSON.stringify({
                "username": username,
                "scheduleId": scheduleId
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then((res) => res.json()).then(async (json) => {
            console.log("signed up: ", json.username);
            logIn(json);
        });
        
    });

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
