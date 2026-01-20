import './Login.css'

function Login() {
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
                        <input id="username" type="text" />
                        <div className="schedule-login-spacer"></div>
                        <label htmlFor="password">Password (optional)</label>
                        <div></div>
                        <input id="password" type="password" />
                        <div className="schedule-login-spacer"></div>
                        <button type="submit">Sign Up / Log In!</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
